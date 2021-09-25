import {EC2Client, paginateDescribeVpcs, Vpc} from '@aws-sdk/client-ec2';

const getDefaultVpc = async ({options, resolveVariable}) => {
  const region = await resolveVariable(
    'self:provider.region, "ap-southeast-2"'
  );
  const ec2Client = new EC2Client({region});

  const paginator = paginateDescribeVpcs(
    {
      client: ec2Client,
    },
    {
      Filters: [{Name: 'isDefault', Values: ['true']}],
    }
  );

  const vpcList: Vpc[] = [];
  for await (const vpcs of paginator) {
    vpcList.push(...(vpcs.Vpcs || []));
  }

  if (!vpcList.length) {
    throw new Error('Default VPC not found');
  }

  return vpcList[0].VpcId;
};

export = getDefaultVpc;
