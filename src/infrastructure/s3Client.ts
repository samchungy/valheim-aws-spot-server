import {S3Client} from '@aws-sdk/client-s3';
import {config} from 'src/config';

const s3Client = new S3Client({region: config.region});

export {s3Client};
