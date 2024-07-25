import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import ProgressBar from 'progress';
import axiosRetry from 'axios-retry';

// Configure axios to retry requests
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

dotenv.config();

const FRAMEIO_API_URL = 'https://api.frame.io/v2';
const FRAMEIO_TOKEN = process.env.FRAMEIO_TOKEN || '';

/**
 * Get all the asset IDs
 */
async function getTeams() {
  try {
      const response = await axios.get(`${FRAMEIO_API_URL}/teams`, {
          headers: {
              'Authorization': `Bearer ${FRAMEIO_TOKEN}`
          }
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
  }
}

/**
 * Get all the asset IDs
 */
async function getProjects(teamId: string) {
  try {
      const response = await axios.get(`${FRAMEIO_API_URL}/teams/${teamId}/projects?filter[archived]=all`, {
          headers: {
              'Authorization': `Bearer ${FRAMEIO_TOKEN}`
          }
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
  }
}

/**
 * Get all the asset IDs
 */
async function getAllAssets(rootAssetId: string) {
  try {
      const response = await axios.get(`${FRAMEIO_API_URL}/assets/${rootAssetId}/children?include_deleted=false`, {
          headers: {
              'Authorization': `Bearer ${FRAMEIO_TOKEN}`
          }
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
  }
}

/**
 * Get a sepcific asset
 */
async function getAsset(id: string) {
    try {
        const response = await axios.get(`${FRAMEIO_API_URL}/assets/${id}`, {
            headers: {
                'Authorization': `Bearer ${FRAMEIO_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching assets:', error);
        return [];
    }
}

/**
 * Download an asset using download URL
 */
async function downloadAsset(url: string, outputPath: string) {
  const response = await axios.get(url, {
      responseType: 'stream'
  });

  const totalLength = parseInt(response.headers['content-length'], 10);
  const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
      width: 40,
      complete: '=',
      incomplete: ' ',
      renderThrottle: 1,
      total: totalLength
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.on('data', (chunk: any) => progressBar.tick(chunk.length));
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });
}

async function main() {
    // // getTeams
    // const teams = await getTeams();

    // console.log(teams);

    // // const teamIds: string[] = teams.map((team: any) => team.id);
    // const teamIds: string[] = ['60265c93-6bd7-4938-9a38-fb87e035b7b2', 'b099f7c7-5459-41b4-b77b-e5d53d099518', '96483bcc-401f-453b-8bee-39288966c70d', '32ee3b60-76ff-4bd2-8bb2-cba3663cc0e2'];
    // //console.log(teamIds);
    // const downloadUrlMap = new Map();
    // const assetIdList: string[] = [];
    // const rootAssetSet = new Set();

    // // getProjects
    // for (const teamId of teamIds) {
    //   const projects = await getProjects(teamId);
    //   // console.log(projects);
    //   const rootAssetIds: string[] = projects.map((project: any) => project.root_asset_id);
    //   rootAssetSet.add(rootAssetIds);
      
    //   // for (const rootAssetId of rootAssetIds) {
    //   //   const assets = await getAllAssets(rootAssetId);
    //   //   const assetIds: string[] = assets.map((asset: any) => asset.id);
    
    //   //   for (const assetId of assetIds) {
    //   //     if (!downloadUrlMap.has(assetId)) {
    //   //       const asset = await getAsset(assetId);
    //   //       console.log(asset.original);
    //   //       downloadUrlMap.set(assetId, asset.original);
    //   //     }
    //   //     // Do something with the asset if needed
    //   //   }
    //   // }
    // }

    // //console.log(JSON.stringify(downloadUrlMap));
    // console.log(rootAssetSet);


    // const rootAssetIds = [
    //   "6ca85b19-025a-485a-87e7-3fca1ba36bb1",
    //   "a2b036d4-e3cb-4cb9-bfe6-076c8abb0dee",
    //   "1d76f299-9c57-4d30-803f-5a7f9508f175",
    //   "fcdfb354-f044-482b-b3a1-356184802814",
    //   "d15d19d6-66b6-42eb-a3e6-873968d73e1c",
    //   "e9182e64-8732-4ed8-861c-01999acff479",
    //   "d3f10b42-5751-45fd-873a-4dd7869012b0",
    //   "1274f5d0-afd9-49b8-8bf9-dc4068746130",
    //   "3ed7ca88-b1e1-470c-ba1d-6e5c6d1ad09a",
    //   "9d825cd2-8a91-4a5b-9843-5700d3278531",
    //   "efef3990-1645-4c0f-b016-5f8bc3c2fba7",
    //   "faab6515-5e4a-4861-83c5-1dc5ad0d4345",
    //   "b05b838e-37d8-42b4-a6b0-3e7c3ea1a134",
    //   "0bb6a881-5157-440d-ba14-ab7d6511a411",
    //   "fb244d5c-2079-4e3c-bead-1e52d885738f",
    //   "1588bf65-7a49-40bb-ad64-aa5a27e6ff3f",
    //   "c0d5dc37-693b-4515-a958-6ce4eefe7259",
    //   "aa59cf15-7e9d-4fbc-ae51-341948d84c90",
    //   "6b2e5d3e-417a-4b94-b599-090460345321",
    //   "7a995645-c2d4-42bc-a02f-a92f74924d84",
    //   "965c3487-1b34-47fa-8196-f57f8aeb3ba4",
    //   "818a805d-96cd-407a-a096-fc1818b94e11",
    //   "1beb266e-9bce-4efa-8938-e740052d6104",
    //   "ecfdfec8-9457-4816-b616-b714bdacd8b2",
    //   "a93e2e91-8c55-4e9e-8c57-1c23979eb8ba",
    //   "3809b6f9-d99d-4185-9fc7-686fc83b9fd6",
    //   "b3f8410a-3de0-4838-ae8b-505b590e6e3c",
    //   "c7b12b55-45fe-41e0-ade2-5b7f46a0bb4e",
    //   "9820beb5-fa56-4bcc-a1be-be71f7c8403e",
    //   "6d7f1ff3-7db1-4071-ba7c-09d1513d8410",
    //   "6d0faa34-b105-4a32-95f5-d9a2cf48fba3",
    //   "12db8f7a-4a8c-40d7-be87-7337f6123495",
    //   "4886f9e1-fbfa-4ba6-a1d1-dc42a5950d71",
    //   "1bd6e481-f3ce-4d43-b5a1-39883190682e",
    //   "f65a1369-5265-4125-8ab2-85e30a7a0437",
    //   "c87cf7cb-99fe-40de-9ebd-828796760c9e",
    //   "3b9d12d5-82f0-4f77-baae-0dd1c8e5f880",
    //   "149919f1-5c0f-4ca5-b16d-a200e7bb3e3b",
    //   "d53be158-c2ae-472a-b353-c7efdb0a8bc9",
    //   "721f5f66-45d7-42a9-b5e3-402247d17dc6",
    //   "3ff351d2-6dc1-4ef9-b2a9-515685b52c6e",
    //   "2cf9fc0a-9a1e-4cc5-ba1e-def24cd27d37",
    //   "c392d363-e10e-48ae-8204-9abe9bf72341",
    //   "fd90af9e-99e0-4fbf-8b7e-960393ffc52a",
    //   "cd0b4e18-90bd-4bc9-b085-5d9942788e12",
    //   "72efd556-0854-46b9-9c86-7b85c071654f",
    //   "cc9d6579-5cac-4cea-ba63-27283507eb0e",
    //   "ac42c374-50db-44a4-b563-99cca650a5af",
    //   "7f5b7281-9ce2-4dc4-a70d-23fd2852852f",
    //   "e002c12f-76c4-4ce5-bd03-678e65be00ea",
    //   "37467cd1-df94-46a2-9a16-e2fdc03a0c99",
    //   "16276379-6244-40a9-af43-59f74c4be4b2",
    //   "4dad6a4e-ec74-48e7-aa89-751c47beb184",
    //   "a28a6736-6a56-436a-b63b-72d2ced432a8",
    //   "d4134575-f233-4d59-a5c8-7709f9113cff",
    //   "b504573e-cb7a-4b0d-8b26-3ce160c91694",
    //   "05854c23-7f25-430d-95c6-97cd241d340b",
    //   "c58a318a-3b06-491c-a997-9bfa5a4dc919",
    //   "5a066976-6601-4d37-b863-4b3d11c2a86b",
    //   "d4ced80e-eb70-410c-a1fb-2fc6cb8fa470",
    //   "c6eb7365-7f31-46af-91ee-f632b23fac53",
    //   "bc424453-30b1-4058-99f1-c1504dadb707",
    //   "c6a45411-88ea-4c51-98ac-9d1a130f3e6f",
    //   "881c0e88-e8a5-40f2-b22b-09760fad5f35",
    // ];

    const rootAssetIds = [
      '6ca85b19-025a-485a-87e7-3fca1ba36bb1',
      'a2b036d4-e3cb-4cb9-bfe6-076c8abb0dee',
      '1d76f299-9c57-4d30-803f-5a7f9508f175',
      'fcdfb354-f044-482b-b3a1-356184802814',
      'd15d19d6-66b6-42eb-a3e6-873968d73e1c',
      'e9182e64-8732-4ed8-861c-01999acff479',
      'd3f10b42-5751-45fd-873a-4dd7869012b0',
      '1274f5d0-afd9-49b8-8bf9-dc4068746130',
      '3ed7ca88-b1e1-470c-ba1d-6e5c6d1ad09a',
      '9d825cd2-8a91-4a5b-9843-5700d3278531',
      'efef3990-1645-4c0f-b016-5f8bc3c2fba7',
      'faab6515-5e4a-4861-83c5-1dc5ad0d4345',
      'b05b838e-37d8-42b4-a6b0-3e7c3ea1a134',
      '0bb6a881-5157-440d-ba14-ab7d6511a411',
      'fb244d5c-2079-4e3c-bead-1e52d885738f',
      '1588bf65-7a49-40bb-ad64-aa5a27e6ff3f',
      'c0d5dc37-693b-4515-a958-6ce4eefe7259',
      'aa59cf15-7e9d-4fbc-ae51-341948d84c90',
      '6b2e5d3e-417a-4b94-b599-090460345321',
      '7a995645-c2d4-42bc-a02f-a92f74924d84',
      '965c3487-1b34-47fa-8196-f57f8aeb3ba4',
      '818a805d-96cd-407a-a096-fc1818b94e11',
      '1beb266e-9bce-4efa-8938-e740052d6104',
      'ecfdfec8-9457-4816-b616-b714bdacd8b2',
      'a93e2e91-8c55-4e9e-8c57-1c23979eb8ba',
      '3809b6f9-d99d-4185-9fc7-686fc83b9fd6',
      'b3f8410a-3de0-4838-ae8b-505b590e6e3c',
      'c7b12b55-45fe-41e0-ade2-5b7f46a0bb4e',
      '9820beb5-fa56-4bcc-a1be-be71f7c8403e',
      '6d7f1ff3-7db1-4071-ba7c-09d1513d8410',
      '6d0faa34-b105-4a32-95f5-d9a2cf48fba3',
      '12db8f7a-4a8c-40d7-be87-7337f6123495',
      '4886f9e1-fbfa-4ba6-a1d1-dc42a5950d71',
      '1bd6e481-f3ce-4d43-b5a1-39883190682e',
      'f65a1369-5265-4125-8ab2-85e30a7a0437',
      'c87cf7cb-99fe-40de-9ebd-828796760c9e',
      '3b9d12d5-82f0-4f77-baae-0dd1c8e5f880',
      '149919f1-5c0f-4ca5-b16d-a200e7bb3e3b',
      'd53be158-c2ae-472a-b353-c7efdb0a8bc9'
    ];

    const assetSet = new Set();

    for (const rootAssetId of rootAssetIds) {
      const assets = await getAllAssets(rootAssetId);
      const assetIds: string[] = assets.map((asset: any) => asset.id);
      assetIds.forEach((id: string) => assetSet.add(id));
  
      // for (const assetId of assetIds) {
      //   if (!downloadUrlMap.has(assetId)) {
      //     const asset = await getAsset(assetId);
      //     console.log(asset.original);
      //     downloadUrlMap.set(assetId, asset.original);
      //   }
      //   // Do something with the asset if needed
      // }
    }

    console.log(assetSet);


    // getRootAssetId

    // getAssets
    // const assets = await getAllAssets();
    // console.log(JSON.stringify(assets));
}

main().catch(error => {
    console.error('Error in main function:', error);
});