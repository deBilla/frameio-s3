import axios from "axios";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import ProgressBar from "progress";
import axiosRetry from "axios-retry";

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
 * Get a sepcific asset
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
    console.error("Error fetching assets:", error);
    return [];
  }
}

const calculatePartSize = (fileSize: number) => {
  const maxParts = 10000;
  const minPartSize = 5 * 1024 * 1024; // 5MB
  return Math.max(Math.ceil(fileSize / maxParts), minPartSize);
};

const downloadAndUploadToS3 = async (url: string, key: string, maxRetries = 3, retryDelay = 5000) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`Attempt ${attempt} to download and upload.`);

      const response = await axios.get(url, {
        responseType: "stream",
      });

      const totalLength = parseInt(response.headers["content-length"], 10);
      const partSize = calculatePartSize(totalLength);
      const progressBar = new ProgressBar(
        "-> downloading [:bar] :percent :etas",
        {
          width: 40,
          complete: "=",
          incomplete: " ",
          renderThrottle: 1,
          total: totalLength,
        }
      );

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: `${key}`,
          Body: response.data,
        },
        partSize,
        leavePartsOnError: true, // Keep parts on error to resume upload
      });

      response.data.on("data", (chunk: any) => progressBar.tick(chunk.length));

      await upload.done();
      console.log("Upload completed successfully.");
      return; // Exit the function if successful

    } catch (error) {
      console.error(`Upload failed on attempt ${attempt}.`, error);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
      } else {
        console.error("Max retries reached. Upload failed.");
        throw error; // Re-throw error if maximum retries are reached
      }
    }
  }
};

export const processAsset = async (key: string, assetId: string) => {
  const isAlreadyUploaded = await doesFileExist(key);

  if (isAlreadyUploaded) {
    console.log('File is already uploaded ', key);
    return;
  }
  const asset = await getAsset(assetId);
  const downloadUrl = asset.original;
  console.log(`Downloading ${assetId}, File Size ${asset.filesize}, File Name ${key}`);
  if (downloadUrl) {
    await downloadAndUploadToS3(downloadUrl, key);
  } else {
    console.log('Download url is not available for ', assetId);
  }
}

export const doesFileExist = async (key: string): Promise<boolean> => {
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
}

processAsset('Kino i/QURAN PROJECT UHD BATCH 1/002 Al-Baqarah_UHD_TEXTED.mov', 'd467181f-4fd0-4617-a2f0-58fdbd4e0d94').then(() => {
  console.log('success');
})
