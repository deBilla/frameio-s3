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
        Key: `4/${key}`,
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
  'a0ec4cea-98cf-4b00-9592-8198c185ee4f',
  '43aa02fa-df80-4d08-8b6d-fc611e166fb1',
  '3e01e029-03dc-4759-84cc-5823cb5b5659',
  'a9872bde-27e7-46fd-8587-3b6573e52c61',
  '5bff25df-c28b-411a-b6a6-7fd3bb2853d5',
  'fa84d924-9c6a-4c44-83f4-b25cfd728baf',
  '293a6965-5017-43ae-bea5-b713539370c8',
  '3e3a357f-f3b1-41e4-9a55-b9f9ee7a1d53',
  '82c535d1-0fe9-423f-894c-6b3b02140e4d',
  'a01a43e9-a593-4072-a769-447e00e5ae58',
  '362d5da4-232b-4147-8ab6-83cc6ecb6a10',
  '4c484392-308f-46eb-b66c-eeb5b8529dcf',
  '21ba462f-8299-4d26-b2f0-15d7b0337a84',
  '31ee8701-0880-49e9-9e93-b481404d181b',
  'efd9ff69-4b94-4981-b437-7aeba1d63402',
  '7445951a-71d0-411e-97b9-70fe7d11ca10',
  '94ba1550-35a0-47c1-a29c-241b207a9e7c',
  '03fa44a2-f607-4ca5-87b7-93be80a3aa09',
  'aab5b028-2fdc-41d7-bb4f-3086e267b67c',
  'ea6015ab-b979-45d7-b9d4-248fd55c2ae7',
  '956de3d8-b6ab-4a50-9f00-33a75ce22e5c',
  '9fb0794a-e923-4f25-a040-23da7526d50f',
  '777a907c-c7f0-48d5-8fe4-e4537e5ba4c7',
  '44cd709a-e5ec-48bb-bb7e-2e6547fe2e97',
  '76443f51-5fdd-4417-b388-1bb6679df7d1',
  '6c798883-9eeb-4a02-b83c-146536d24751',
  'b8755471-de3a-476b-bab3-47bf62b19528',
  '8714e70f-43a3-483d-8161-6eb644054fb3',
  'eb38bbba-0fe7-4efc-bf14-e6ac484c8e76',
  'c189a69c-a2bf-4cc7-bc2a-d12d051b277b',
  '7457d252-b6f4-4555-874a-8078632859a2',
  'fadc419f-4426-409a-92e4-deae203ab0cc',
  'fce7207e-d7fc-4976-a33d-e97c6b828b5c',
  'a020404f-43c6-48bd-bb43-8f77b6fdde55',
  'f51d1efe-1834-4be6-adcf-aa78bce370b9',
  '9c633ea5-456b-4b75-8585-e98e8acf484a',
  'ee60b54d-3dfe-44c8-8d21-6a1b5947c197',
  'ef99c7f4-bf59-4a5d-a7d9-11f89e08de34',
  '3fafd23d-edf1-4106-86c2-6bbbe7d7ff2b',
  'ab0c090b-3160-433b-8d40-83f04e51ed90',
  '21e5f072-2bbd-4eb4-8d29-25c976045c57',
  '0723c745-b006-49bf-b2a7-8cd42e884027',
  'e69fe0d3-cc99-4257-b236-3418329724e4',
  '55c1440d-df19-4c8e-bc3b-07fd1ea510ab',
  '1dc83d71-cde4-46d7-b99b-b638fba7c2d4',
  'ce9583ff-04dd-46ef-a544-c8699d91b542',
  '1ca58f9e-0828-45c8-8627-8fbe555bb765',
  'd4f1424d-9513-4778-a264-2322550a69b8',
  '23d5744f-623b-4e26-aed7-c7f7fd90a5bb',
  '07af9948-580c-45ac-a5df-4ebf52a1d6bf',
  '6138875b-be78-400b-8fb9-c87d6cff93cf',
  'ef596562-7c32-4b63-9614-4f475f9cc6e6',
  'a8a02f57-ee60-48c3-8e63-ee87a6175037',
  'c17b4a9b-b5af-4758-b605-3596fa688820',
  '517590ff-0266-44fe-a934-aec11e608479',
  '48b029f8-16a2-4d8b-b4bd-ef73ab21a046',
  'e4276240-9a57-4ffe-9b89-f16f649a81b1',
  'b8e2a1fe-d1d5-4f0e-bb54-263cda099cf3',
  '1c9a80ce-ea76-43a7-97c5-5bdf7ffc9610',
  '0af2585e-0c5b-4dcb-b47a-4ef8fa71542c',
  'cc096b8a-a0a9-4578-90a6-f6462aceb3e2',
  '1c2de1c1-4255-4f09-84c5-24728b517993',
  'a726b7ae-2161-430e-8fc0-e4304b0b3d88',
  'c4b42e2f-5d13-4c1d-b69b-ef134cc17c56',
  '94fbf783-e661-462d-811b-0fee6543efa9',
  'ba9fc7b1-d774-4fc2-92ae-cf82f36c7e6c',
  '0920269e-7875-4447-a5de-98df37c7df5f',
  'a9110c0f-6ca1-4fc4-9411-0b774d0fe583',
  '6351142d-f261-4145-aa0a-9adf361639bd',
  '430ed202-45be-4409-858d-a08a30141d96',
  '057a38fe-8dae-4e1f-972a-072d3df86735',
  '58e0c905-d34d-4253-8785-c67dd9aac13f',
  'e713f721-dc1d-4943-be4d-62f515dd28a3',
  '1e06856e-d6a5-498a-bdfc-9af2f5739269',
  '8565b6a4-cdfe-4367-ad36-6fd584905915',
  'de7e84e2-25d5-4a45-b3db-13268b67554d',
  'e71c58c1-fcfe-4289-a075-ebc3ab990ba3',
  '2e7d1a7c-51e7-4849-92ec-f454eea43a00',
  '0392283b-e803-4639-bb4f-aac97b118866',
  '6ae03034-d526-40f0-b4ad-5c1db7cf6ea0',
  'eb842488-7ca9-45b5-9528-237c7c86ee15',
  '99ba89be-cde9-4871-8383-202a0fc08932',
  'bcad0217-e53a-4575-9afa-5b3b1584126d',
  '4186fdf4-62d3-494a-80c4-e60ca2aef52c',
  '57fed7a2-8bd1-438c-8a3a-978b4aaf478d',
  'dbbdf06f-c461-482a-98ac-8826d8958668',
  '6f402d79-c256-4689-88d7-6c488fff500e',
  'fce4280f-28df-4c2a-bb90-befa3a7fc903',
  'b302603d-3302-47d9-8d1c-fe796008ef1e',
  '11b8c3b0-0b18-459e-ae52-db0362aa5457',
  '70f3e772-5a11-4d00-88db-28e0067978de',
  'b98a8388-7f91-4207-90ad-729f8d4d599d',
  '2d331380-0316-4f08-8d1d-bd7c0bf31593',
  '5ef25154-ca77-46a4-b8b9-ab2c4221c2c9',
  '170c39f7-c80b-49a0-9a93-235f8c6ae315',
  '5f52375a-f9e4-4b21-82fb-4e7fc74ce97b',
  '6540031e-2dd1-45a7-a57d-c136a749bc76',
  '283026d2-391a-48bc-be75-41b98e64a32b',
  '8b35468e-6a91-47ff-a30b-24da34cab5dc',
  '79248aaa-6be2-4e96-8da3-d996cbe34037',
  '322b936e-9085-4a40-b526-327aa7cbbc7b',
  'a54bbcf0-a223-4d02-985a-0aa78bdcfa71',
  'f86ef6dc-a131-441e-bd5f-8a9673af863e',
  '0ce01a65-390c-46f5-96f4-e13e0c50f220',
  '69f66c4e-1ec2-4335-bd19-fa974a0ac4e2',
  '3c41eb59-9777-49f0-8687-f924581cba06',
  '82325ecf-5cc7-4d8d-a35a-3f86d8d0754f',
  '916ca3d5-1284-46b1-a7a1-598de9ea72a3',
  '8d2d0398-f691-4058-9e1f-b8bbf7fe8e6d',
  '89874248-5f68-4858-85e7-7466577faa82',
  '916ed094-6c04-46bb-a283-b014726eaf98',
  'f3e0c9c8-ee53-40c0-b827-327d97c2723a',
  '7924b211-1983-4d1e-a7b6-0e36e86b0cc8',
  '0b8b8296-d3c8-4a86-aa23-8c8649afc6c1',
  '14e471ca-fc6f-45e8-875f-0381a8fc102b',
  '6be5a35a-0c9e-4659-a8ad-41a19a64d1b7',
  'dd7741b2-3a6f-4a11-9f54-d1a63aee4da3',
  '3a6a281c-2fed-4f0a-bcd9-d04a455d4c25',
  '4e51ae47-a7f3-447a-b60d-416f8c16b458',
  'dce80ac1-b9dc-4dd2-9d1a-e7252a7f00ae',
  '435e633a-b60f-4615-bb8a-7d14d1854833',
  'acc3c978-75f8-49fb-8c3b-8f90147515f1',
  '59417775-e16b-44b3-82fd-bcc37682a8fc',
  'dff4e88d-a963-465b-b580-8eca03a5e436',
  '58a53197-848d-402e-be85-b35475eb7cd0',
  '7c01779c-9a87-4ee0-936b-db44fa6c1d87',
  'c8785acd-ace6-48a9-9463-35c492745da6',
  '83105c9f-ab09-473f-9c3a-5eb6a1893356',
  'f8218ae7-d9b6-4434-be0a-9c3fe0c64401',
  '7055e89d-1e40-42b4-9103-6fbf6920b69f',
  'f61f969f-47fd-4f7d-992a-5c4f446c3944',
  'b93884df-468c-4884-9a17-c123395ebbe2',
  'a64c6738-05c4-456b-9476-13d49ee44788',
  '3980b06c-c9ac-492d-8c98-567061e8ac96',
  '70339847-c3ef-4256-9df9-b32d229a0a7c',
  '79d01789-43d2-4009-9596-de4a983298c3',
  '5a5c6276-6528-4517-a0a5-ae6d281de613',
  'f7b1eadc-8527-474c-a2d7-c5d83b19829a',
  '2f040532-d12d-487b-b307-2599e678e30a',
  'b98e8077-e8ef-4129-b84e-8b787c1bb0ff'];


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
