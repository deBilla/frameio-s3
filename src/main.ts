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
    // getTeams
    // const teams = await getTeams();

    // const teamIds: string[] = teams.map((team: any) => team.id);
    // //console.log(teamIds);
    // const downloadUrlMap = new Map();
    // const assetIdList: string[] = [];

    // // getProjects
    // for (const teamId of teamIds) {
    //   const projects = await getProjects(teamId);
    //   // console.log(projects);
    //   const rootAssetIds: string[] = projects.map((project: any) => project.root_asset_id);
    
    //   for (const rootAssetId of rootAssetIds) {
    //     const assets = await getAllAssets(rootAssetId);
    //     const assetIds: string[] = assets.map((asset: any) => asset.id);
    
    //     for (const assetId of assetIds) {
    //       if (!downloadUrlMap.has(assetId)) {
    //         const asset = await getAsset(assetId);
    //         console.log(asset.original);
    //         downloadUrlMap.set(assetId, asset.original);
    //       }
    //       // Do something with the asset if needed
    //     }

    //     break;
    //   }
    // }

    // console.log(JSON.stringify(downloadUrlMap));


    // getRootAssetId

    // getAssets
    // const assets = await getAllAssets();
    // console.log(JSON.stringify(assets));
}

main().catch(error => {
    console.error('Error in main function:', error);
});