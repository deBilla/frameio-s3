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
        Key: `shorts/QB_SHORTS/evergreen/${key}`,
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
  '52896121-1971-4abb-a1d5-a7c521b13596',
    '37f34d7c-a869-4fe2-aaa6-a86372e2c862',
    '28e0540f-d2e1-4b7a-bfda-daea8fe02b49',
    '1a567e31-66a3-400f-b9e5-2d4c64efead0',
    'bcedafa9-14c6-4b7c-b12b-c9bc5fcf2df9',
    '047c0f71-75de-42da-b831-95e84fc247ed',
    '54c314ec-a9f4-4506-b2cd-fdf787a0816a',
    'acdd2325-eaa4-45f8-91ca-5545b7b86949',
    '59659e27-be00-4b6d-a825-084820fbc2bf',
    '34ac01c9-e756-4265-9bc8-eab49219ba03',
    '95847d66-59b7-4ed6-ac95-b875ea23e986',
    '9c68c0d3-c185-459b-b06e-364e7b406e9c',
    '67df240a-482f-4018-ad82-ef1533a01006',
    '40f05745-8a16-417d-b651-7e8b205c4beb',
    'c5b0125f-84af-4897-8f37-2a50dadbd2d5',
    '29f86842-3514-4046-8c07-0a0843b506c2',
    'b60834d7-a8be-4d10-9e09-d0432b05064b',
    'aed47c1f-11b7-445f-a263-ddc32c3cd7dd',
    '31a39638-b7a5-47f8-b6f8-b6f7c650dce5',
    '33bf64fe-6b65-47a9-85ee-9702a94f0474',
    '230bf3e7-d35c-4f88-888e-2e4247f1bd8e',
    '85e139fe-9001-4910-b75d-9d8ad1bea098',
    '8b6ee312-e10e-4bf3-b3f8-d1f975604714',
    '4f246c61-abb6-487a-8723-07a69fa31c0e',
    '63f3052f-0279-4162-8c3c-0b35ce93a636',
    '7bd4d3dd-effa-4fda-ae4a-644d6983d241',
    'fe370373-f039-4ace-b06b-ebbaa33936b0',
    '58860f17-88ef-4cf7-a02c-b3e232b87148',
    '93068c11-7641-4b38-b7f7-9664dd41758a',
    'e0019c3d-a58b-42a8-8c7e-21e2694e1f13',
    '6dcd7a66-6fa0-46ae-926e-eb08233e13a3',
    '647f1c18-b9fc-4991-acdf-b10fdeaee4eb',
    'e429129e-4f1e-4169-a21d-7e57809676a6',
    '5e8794d2-b92a-4fd3-b770-fc24fec0d50b',
    '37aa32a0-e0a8-4a8a-8535-ee3b6da507b1',
    '38dc5423-b403-43fc-afff-49a633958fc1',
    '6b0bdf17-7295-4b3d-a733-2d29d35e60d2',
    '39fd2461-a5b8-46cf-b940-7599eaf472ca',
    '429c3345-6f8a-48d8-8e0c-c1f722635d24',
    '8a2f4a4c-a062-408d-a44d-d8148dc05071'];


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
