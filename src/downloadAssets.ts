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
          Key: `shorts/soureh/${key}`,
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
  const assets = ['0e5462a9-0c5f-4696-bd33-c5d19d5c8589',
    '3beb0e5f-29a2-4062-8dec-21f361f19a68',
    'd7d556ee-61a8-4655-bf03-e9ddef4391ac',
    'e3fd9cd7-17ac-4865-ae6d-7082246279e2',
    'ddb5a246-b67f-4319-abb9-d449a0a91f2f',
    'ee8e1694-d3b9-4cb2-a954-aff263636a20',
    'b9ee49bf-8315-477b-b1a0-4460ce69782a',
    'abe82529-40fe-4cfb-bc01-71778a5bea22',
    '6f02258e-6577-4c8c-87ff-e32365ea20d7',
    'e3076764-ef5a-4553-b2c5-ae25cb16e0c8',
    '372a4287-9cf2-49c4-96d9-ac68f8f01d3b',
    'e21f5ecb-5d3b-4414-816f-01f9887775d7',
    '25c0d816-373d-4b14-8ca0-f3918a9c5c93',
    '3109b8d1-96eb-486d-8814-7ead555fb168',
    '99947e88-5f63-4f38-b9ce-edf36e261aa7',
    '2caedab0-fc9d-4eec-8c88-5609b171dba2',
    '659fdf5d-a6b5-48a2-a9b1-77919e75ae70',
    '70640cc2-40ba-4e66-8712-ed7ce67447d8',
    '286fa2c9-6959-4ff0-b89b-de37eaddde11',
    '96b02260-ff9e-4c36-8aa1-08bff13c909e',
    '23f14532-42ed-49be-83e9-fbd68f3976b4',
    '7cebbf10-0397-4689-b4cb-45b8b5adeb9f',
    '89609325-b0c3-41ef-985e-1d1dbc0bf00a'];

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
