import {SSMClient} from '@aws-sdk/client-ssm';
import {config} from 'src/config';

const ssmClient = new SSMClient({region: config.region});

export {ssmClient};
