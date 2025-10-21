import { Storage } from '@google-cloud/storage';

// Decode the base64-encoded JSON key from the environment variable
const keyFilenameBase64 = process.env.GCLOUD_SERVICE_ACCOUNT_JSON;

if (!keyFilenameBase64) {
  throw new Error(
    'Environment variable GCLOUD_SERVICE_ACCOUNT_JSON is not set.'
  );
}

const keyFilename = Buffer.from(keyFilenameBase64, 'base64').toString('utf-8');

// Parse the JSON key to get the service account object
const serviceAccountJSON = JSON.parse(keyFilename);

// Initialize Google Cloud Storage with the service account credentials
const gStorage = new Storage({ credentials: serviceAccountJSON });

const bucketName = 'bilas-laundry';
const bucket = gStorage.bucket(bucketName);

export { gStorage, bucketName, bucket };
