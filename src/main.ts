import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import ProgressBar from 'progress';
import axiosRetry from 'axios-retry';
import { processAsset, doesFileExist } from './downloadAssets';
import KINOI from './map/kinoi_t.json';
import ORIGINALS from './map/originals_mis2.json';
// import BLUE_MEDIA from './map/blue_media.json';
// import DESIGN_TEAM from './map/design_team.json';
/// import BARAJOUN from './map/barajoun.json';
import SHORTS from './map/missing_shorts.json';
import { CSVUtil } from './utils/csvUtil';
import { processAssetManager } from './downloadAssetsManager';

// Configure axios to retry requests
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

dotenv.config();

const FRAMEIO_API_URL = 'https://api.frame.io/v2';
const FRAMEIO_TOKEN = process.env.FRAMEIO_TOKEN || '';

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
async function getProject(projectId: string) {
  try {
      const response = await axios.get(`${FRAMEIO_API_URL}/projects/${projectId}`, {
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

async function findAndFetchNestedAssets(assets: any[], getAllAssets: (id: string) => Promise<any[]>, 
projectName: string, folderPath: string, map: Map<string, string>): Promise<void> {
  for (const asset of assets) {
    const currentPath = `${folderPath}/${asset.name}`;
    if (asset.type === 'folder') {
        // Add folder to the map

        // Asset is a folder, fetch nested assets
        const nestedAssets = await getAllAssets(asset.id);

        // Process nested assets
        await findAndFetchNestedAssets(nestedAssets, getAllAssets, projectName, currentPath, map);
    } else {
        // Process non-folder asset or other logic
        map.set(`${projectName}${currentPath}`, asset.id);
    }
}
}

async function main() {
  // const map = new Map<string, string>();
  // const teamName = "Kino i";
  // const projects = await getProjects('60265c93-6bd7-4938-9a38-fb87e035b7b2');

  // for (const project of projects) {
  //     const projectName = project.name;
  //     const rootAssetId = project.root_asset_id;

  //     const assets = await getAllAssets(rootAssetId);

  //     // Use the findAndFetchNestedAssets method
  //     await findAndFetchNestedAssets(assets, getAllAssets, `${teamName}/${projectName}`, '', map);
  // }

  // console.log(JSON.stringify(Array.from(map, ([key, value]) => ({ key, value }))));


  // const map = new Map<string, any>();
  for (const media of KINOI) {
    await processAssetManager(media['key'], media['value']);
    // const check = await doesFileExist(media['key']);

    // // // if (!check) {
    //   map.set(media['key'], {assetId: media['value'], exists: check});
    // // // }
  }

  // console.log(JSON.stringify(Array.from(map, ([key, value]) => ({ key, value }))));
  // const csvUtil = new CSVUtil();
  // csvUtil.createCSVFromMap(map, '/Users/dimuthu/bitsmedia/frameio-migration/original_report.csv');

  // for (const [key, id] of map.entries()) {
  //   await processAsset(key, id);
  // }
}

main().catch(error => {
    console.error('Error in main function:', error);
});