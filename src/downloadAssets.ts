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
          Key: `shorts/QB_SHORTS/qb-content-batch-2/${key}`,
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

async function main() {
  const assets = ['28a20bef-4352-47c3-acb7-880b0fb7068c',
    '3d384255-3147-4574-8b3f-535039a12e2c',
    '78c08e24-489b-4437-b400-8919707ebcf5',
    'a9838215-fb3c-46ab-99bf-2b89582c4df3',
    '949ea9fe-ee8c-4bb8-a35d-8ce186aeab2d',
    'dc3ef451-9e03-45a9-9d3a-14c246f57e8f',
    'a9811bdb-aff7-461e-874a-3bd3063c290f',
    '2ba2e3e8-7a84-4084-ae1f-bffe93745e2f',
    '2575c7d6-e841-4cfe-a53e-e4f09c5c79c5',
    '6270d466-0c9c-4f19-aa52-8a529ed5bd11',
    'e6772933-4a93-4867-ae4b-09f7fe96608e',
    '91c36efc-a35e-457f-ac98-d06416412c5f',
    'f22c4518-a5b9-4658-9d80-02fb9007c25f',
    '594d17b8-3369-4ab0-9b7f-a4f6fc5eb132',
    '3a567bac-139e-4f80-b2bb-e08b715968bb',
    '3c41d2d4-cd0f-4ad2-844d-a4080bea1a63',
    'd01e12ff-8a35-4c08-8c00-b7d9977268bb',
    'c1e57ad1-f283-4217-ba31-59139bc3594d',
    'aadd6a65-8425-4529-8e9c-a6147062cb38',
    '4581013f-e178-4c1a-85ee-7fb42d492abb',
    '7c823093-ae74-48a7-b8b1-42c2ff79c575',
    '14c41202-c7ef-44ba-8b37-24ef0b672b33',
    'aa7b721b-c389-41b5-9e35-119c713724a1',
    '84a178f2-5a1d-45ee-8c73-68d8ac9a9bab',
    '749814f5-3402-4afd-abf7-fd7a10e3f270',
    '07e5b8a0-bb3a-47cf-9f10-fd73f641b576',
    '01bf7417-3afd-4879-ad05-4c3b9cf4ecec',
    'abb46a5c-f0d0-4cfe-8d18-83c0a8e085d8',
    '8c3d0f7c-eed0-4eb0-a392-4e5b6e5741a8',
    '091c8efb-5698-496f-83f1-d7a5aadfdef8',
    '676f52b3-634e-4a76-a6d7-9f7a9c303863',
    '7f723217-47ae-4cbe-83eb-88141e1e7e43',
    '20940111-a9f4-4cfc-b65b-e66ba6a27bb4',
    '9c0bd932-125e-4f23-9e39-122314d8a738',
    '48c9f0ab-0833-4820-92ee-f5e631d6242c',
    '7b52abf5-5905-40d7-936d-3022575e3cda',
    '5099b22d-9a81-46de-a7af-30d45a6da8f4',
    'db31e28a-0eda-4345-a938-5093288db5bf',
    'e77d9063-5852-41e6-9036-a268b1ca3140',
    '0f3dae33-9688-444e-bcb4-95defbf356b9',
    '9cdd5113-56a3-4f50-8131-5479cb1e0c9e',
    'e47f3bb3-081a-4799-b25b-b27b08687850',
    '12996d6b-6cce-4afe-b476-e5f38f0ce166',
    'dcec33bf-ee0f-4169-afe2-0e67d17db18a'];

  for (const assetId of assets) {
    const asset = await getAsset(assetId);
    const downloadUrl = asset.original;
    console.log(`Downloading ${assetId}, File Size ${asset.filesize}`);
    if (downloadUrl) {
      await downloadAndUploadToS3(downloadUrl, `${assetId}.mov`);
    } else {

      console.log('Download url is not available for ', assetId);
    }
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
