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
        Key: `shorts/QB_SHORTS/soureh-short-film-vertical/${key}`,
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
  '84cb0435-7d6f-4c3a-987d-e13193611fd7',
    '8610be8e-32ca-4280-9f61-8dcfe600cf48',
    'c8114110-8dbe-492b-a11c-2da47f10712e',
    '2a83edd1-e721-452f-8feb-516aa3e4b04c',
    '0119bb94-7bf5-4a99-b3b0-516078891977',
    '307900a3-a16c-4946-9e7a-8f9656efeefa',
    '87b24b9f-1653-47e4-b47b-0be6b9e458ec',
    '20e36fdc-f847-4ae0-95bc-0bbbdf4ba389',
    '17443429-c1e3-4376-a888-1982a1e50fce',
    '2457ddaa-9898-4af4-a40c-8c0e6a322721',
    'f90320d6-dcc0-435f-a375-6d13d9ca3dfb',
    '52be6464-a992-4d62-9b60-a497201d66c4',
    '2cbb6fd9-4c4b-4e36-96b7-6bd59515d7ba',
    '6e1255cf-cf18-40e9-a512-7fc043039e9d',
    'a0cb3901-f517-4a91-8864-4e36392c0b6d',
    '0194ed09-21dc-4282-825e-c846ec4aa452',
    'f4d81276-1057-42e6-81e1-11e4ab92bb0a',
    '5fcbd772-bf3c-4d6f-879a-ebfa101f011d',
    '7d26118b-346f-429e-993b-2738b6036e93',
    '517856ae-3fab-4f06-8d30-f96dc258f731'];


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
