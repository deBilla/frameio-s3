import axios from 'axios';
import dotenv from 'dotenv';
import axiosRetry from 'axios-retry';

// Configure axios to retry requests
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

dotenv.config();

const FRAMEIO_API_URL = 'https://api.frame.io/v2';
const FRAMEIO_TOKEN = process.env.FRAMEIO_TOKEN || '';

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

async function main() {
  const asset = await getAsset('356f5106-6295-4311-aaa8-9f663df74b95');
  console.log(JSON.stringify(asset));
}

main().catch(error => {
    console.error('Error in main function:', error);
});