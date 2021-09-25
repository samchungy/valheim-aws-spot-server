import {EC2Client} from '@aws-sdk/client-ec2';
import {config} from 'src/config';

const ec2Client = new EC2Client({region: config.region});

export {ec2Client};
