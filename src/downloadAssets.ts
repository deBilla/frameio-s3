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
        Key: `shorts/QB_SHORTS/qb-content-batch-1/${key}`,
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
  '06014dc3-a14b-4c33-ac82-39405f26b1d4',
    '94e1fabb-7454-4b52-ab8e-ba9f936b0d12',
    'fcbc6016-8544-4685-ab8f-b53d3dd278d1',
    '4f00fe9f-4389-4f21-9aba-dbdf1b6b1162',
    '0f5cf248-b62f-4561-af63-92fb39ba9a02',
    '204c7cad-1ebc-4c56-8fb5-840b03e53ea3',
    '77fb2fcb-3ecd-4c07-b6b1-58567ca89c56',
    'e05a8cbe-9f62-47b3-b029-7c74c55af44f',
    '32fc094a-b0f8-48a9-8cee-fa5fcf9161ee',
    '974dac40-a1fb-46f9-b69d-7a987140e6c4',
    'af659d63-e1e8-4ae6-9241-8d76635cbe30',
    '23bef771-5620-4fa4-b099-ab60466855aa',
    'fbccfbbc-787f-4824-a1b0-16f644f21c80',
    '058480fb-88ed-40f0-8879-06bef1025400',
    '74c8d84e-ebd7-411b-9628-89bc36a70df5',
    '3f1e5dc7-7ac5-4653-8549-f541d7a18e2e',
    '7c79637a-1176-4a7e-85b5-be8771af5ff9',
    '207f380a-1e3c-4e77-a9e4-fba5ae5a2b04',
    'fbf1d35e-ced9-4752-bfec-46305dde5f73',
    '77642e70-3aea-4afc-a2a2-ddfc8a9f65e9',
    '5aad32d3-b9d6-4489-8bc6-f4e5ea2544b9',
    'a4bedbca-2e72-479b-be46-a58f947da80d',
    '2c77bc19-1de6-49fe-8b89-425844f58b6d',
    '79091bf8-a41d-4f2e-82be-15e23d995bc5',
    'ee2eaf9c-be06-45aa-b316-df6d9b48203e',
    '3eacc477-4724-4234-9e55-6dfb96d02d5e',
    'f3310822-76df-4e22-bce9-d088ff79b94e',
    '546cc4c6-d644-4709-b8fc-cae1a4b1a5fc',
    '6d438503-74c0-493c-8cf0-ce3005b3decf',
    'f230d987-89e4-48f9-a417-8701f715d8b9',
    '98cc2e2c-6989-48b0-8067-610e154277b4',
    '2ba2c020-06ed-4fc6-bd2d-782789acc6b1',
    '2878663a-aa29-4b9e-a648-2ca3868fb3aa',
    'cba2d303-75fa-4f53-9197-16937b78be51',
    'c744a734-1f63-46db-8522-6cd5d4d3a449',
    'f2e89d5f-26b8-47a8-aac0-d64686faea96',
    '9d1c843a-adf5-4333-8d4c-f04d1cb569e3',
    'bd3c4a06-12f0-40ed-9fcf-59453d68bd38',
    'aeed7ce4-cb7f-4421-a481-33a43e48ff2f',
    '695883cd-6693-4cb6-a1ac-24b10d063329',
    'de2a71de-f47e-4c54-94db-b8302a6cfd72',
    '99758f32-5ec9-485a-bdba-3e40946dda9b',
    'b394a5fa-5e63-4f2b-8eb4-ec4bbf6dee38',
    '323c0b11-5286-4075-ba5e-edbf9266c023',
    '26572dee-7b0c-49e8-9192-7c27d7742fc4',
    '3ca085b9-7959-49f5-9eec-7e44e2d32540',
    '6b9caf3e-0f03-44cd-b11a-1112f0090d2a',
    'bdd73a6a-a40c-46e1-b2be-bc90cd44b552',
    '9790bcae-d9c1-4566-9d19-1dea200fb758',
    'd99d1c69-c791-4c37-9bb3-6c727c75ccb3'];


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
