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
        Key: `shorts/QB_SHORTS/${key}`,
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
  'ac090a6c-2a4d-4dbf-b524-5b2d808859cd',
    '85177f1b-ed94-45ce-ab40-0472f61c65be',
    'cf0e295e-44f5-432a-a202-8273fa679e97',
    '2a9b4810-2275-419d-9bed-c2b2a7d8a7d1',
    '3fc90378-c00a-4504-a18a-23260b327a6c',
    'baff664d-22ac-409f-b996-b130cbd6d3dc',
    'bb966a91-3599-4688-abf4-88b7ea091eaf',
    '4b8b7fde-e41c-468f-952e-4d862c389e08',
    '1e79eff1-43ec-4b10-af71-69df82206822',
    '430c4847-972b-41d9-896d-5ebf33bed42c',
    '78c80fdf-567b-4343-9788-76fb1549c6fb',
    '1aea017d-38c8-4b26-9eec-e6c5b0fdf486',
    '746a0766-89b9-40d3-a495-c9877743c00c',
    'c6a4e02a-7191-4584-a0c8-bef618c05c0d',
    '8ad49fad-b57d-43d6-8870-914df419605a',
    'f4cfd4cb-db7f-44d2-b3c5-b2f22db19217',
    'f62c46e2-356a-4886-a7ad-c29035c21cf9',
    'cd32b490-79af-4052-ac0e-c69f8433858a',
    '5ca67790-3ef8-495b-8653-2c661d4cac35',
    '9e7be004-af08-415e-9aa5-632f91121f12',
    '2907a4c7-4005-4122-9b94-1de3417b58b6',
    'c3e77c57-fac0-4f4f-af8e-8e76740b22d7',
    '78bfb50c-dd67-4655-8277-0fdaf77bf718'];


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
