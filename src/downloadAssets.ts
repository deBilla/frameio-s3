import axios from "axios";
import { S3Client } from "@aws-sdk/client-s3";
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
  console.log(`${FRAMEIO_API_URL}/assets/${id}`);
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

const downloadAndUploadToS3 = async (url: string, key: string) => {
  try {
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
        Key: `/2/${key}`,
        Body: response.data,
      },
      partSize,
      leavePartsOnError: false, // Cleanup parts on error
    });

    response.data.on("data", (chunk: any) => progressBar.tick(chunk.length));

    await upload.done();
    console.log("Upload completed successfully.");
  } catch (error) {
    console.error("Upload failed.", error);
  }
};

async function main() {
  // const assetId = "356f5106-6295-4311-aaa8-9f663df74b95";
  const assets = [
  '721f5f66-45d7-42a9-b5e3-402247d17dc6',
    '3ff351d2-6dc1-4ef9-b2a9-515685b52c6e',
    '2cf9fc0a-9a1e-4cc5-ba1e-def24cd27d37',
    'c392d363-e10e-48ae-8204-9abe9bf72341',
    'fd90af9e-99e0-4fbf-8b7e-960393ffc52a',
    'cd0b4e18-90bd-4bc9-b085-5d9942788e12',
    '72efd556-0854-46b9-9c86-7b85c071654f',
    'cc9d6579-5cac-4cea-ba63-27283507eb0e',
    'ac42c374-50db-44a4-b563-99cca650a5af',
    '7f5b7281-9ce2-4dc4-a70d-23fd2852852f',
    'e002c12f-76c4-4ce5-bd03-678e65be00ea',
    '37467cd1-df94-46a2-9a16-e2fdc03a0c99',
    '16276379-6244-40a9-af43-59f74c4be4b2',
    '4dad6a4e-ec74-48e7-aa89-751c47beb184',
    'a28a6736-6a56-436a-b63b-72d2ced432a8',
    'd4134575-f233-4d59-a5c8-7709f9113cff',
    'b504573e-cb7a-4b0d-8b26-3ce160c91694',
    '05854c23-7f25-430d-95c6-97cd241d340b'];


  for (const assetId of assets) {
    const asset = await getAsset(assetId);
    const downloadUrl = asset.original;
    console.log(`Downloading ${assetId}, File Size ${asset.filesize}`);
    await downloadAndUploadToS3(downloadUrl, `${assetId}.mov`);
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
