import axios from "axios";
import { S3Client, HeadObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import ProgressBar from "progress";
import axiosRetry from "axios-retry";
import { PassThrough } from "stream";

// Configure axios to retry requests
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

dotenv.config();

const FRAMEIO_API_URL = "https://api.frame.io/v2";
const FRAMEIO_TOKEN = process.env.FRAMEIO_TOKEN || "";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3-accelerate.amazonaws.com",
});
const bucketName = process.env.S3_BUCKET || "";

/**
 * Get a specific asset
 */
async function getAsset(id: string) {
  try {
    const response = await axios.get(`${FRAMEIO_API_URL}/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${FRAMEIO_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching asset:", error);
    return null;
  }
}

const calculatePartSize = (fileSize: number) => {
  const maxParts = 10000;
  const minPartSize = 5 * 1024 * 1024; // 5MB
  return Math.max(Math.ceil(fileSize / maxParts), minPartSize);
};

const downloadAndUploadToS3 = async (url: string, key: string, maxRetries = 3, retryDelay = 5000) => {
  let attempt = 0;
  let start = 0;
  let uploadId: string | null = null;
  const parts: { ETag: string; PartNumber: number }[] = [];

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`Attempt ${attempt} to download and upload.`);

      // Check if there's already an ongoing upload
      try {
        const headParams = {
          Bucket: bucketName,
          Key: key,
        };
        const headData = await s3Client.send(new HeadObjectCommand(headParams));
        start = headData.ContentLength!;
        console.log(`Resuming from byte: ${start}`);
      } catch (headErr: any) {
        if (headErr.name !== 'NotFound') throw headErr;
      }

      // Initialize multipart upload if not already started
      if (!uploadId) {
        const createMultipartUpload = await s3Client.send(new CreateMultipartUploadCommand({ Bucket: bucketName, Key: key }));
        uploadId = createMultipartUpload.UploadId!;
      }

      // Download the file
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          Range: `bytes=${start}-`,
        },
      });

      const totalLength = parseInt(response.headers['content-length'], 10) + start;
      const partSize = calculatePartSize(totalLength);
      const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: totalLength,
      });

      const passThrough = new PassThrough();

      response.data.on('data', (chunk: any) => {
        progressBar.tick(chunk.length);
        passThrough.write(chunk);
      });

      response.data.on('end', () => {
        passThrough.end();
      });

      response.data.on('error', (err: any) => {
        throw err;
      });

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: passThrough,
        },
        partSize,
        leavePartsOnError: true,
      });

      await upload.done();
      console.log('Upload completed successfully.');
      return; // Exit the function if successful

    } catch (error) {
      console.error(`Upload failed on attempt ${attempt}.`, error);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
      } else {
        console.error('Max retries reached. Upload failed.');
        if (uploadId) {
          await s3Client.send(new AbortMultipartUploadCommand({ Bucket: bucketName, Key: key, UploadId: uploadId }));
        }
        throw error; // Re-throw error if maximum retries are reached
      }
    }
  }
};

export const processAssetManager = async (key: string, assetId: string) => {
  const isAlreadyUploaded = await doesFileExist(key);

  if (isAlreadyUploaded) {
    console.log('File is already uploaded ', key);
    return;
  }
  const asset = await getAsset(assetId);
  const downloadUrl = asset?.original;
  console.log(`Downloading ${assetId}, File Size ${asset?.filesize}, File Name ${key}`);
  if (downloadUrl) {
    await downloadAndUploadToS3(downloadUrl, key);
  } else {
    console.log('Download url is not available for ', assetId);
  }
};

const doesFileExist = async (key: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({ Bucket: bucketName, Key: key });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
};

processAssetManager('Kino i/QURAN PROJECT UHD BATCH 1/002 Al-Baqarah_UHD_TEXTED.mov', 'd467181f-4fd0-4617-a2f0-58fdbd4e0d94').then(() => {
  console.log('success');
})