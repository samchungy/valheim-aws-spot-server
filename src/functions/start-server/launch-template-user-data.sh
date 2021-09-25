#!/bin/bash
yum update -y
amazon-linux-extras install docker -y
mkdir -p ~/.docker/cli-plugins/
mkdir -p /home/ec2-user/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.0.0-rc.3/docker-compose-linux-amd64 -o ~/.docker/cli-plugins/docker-compose
cp ~/.docker/cli-plugins/docker-compose /home/ec2-user/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
chmod +x /home/ec2-user/.docker/cli-plugins/docker-compose
service docker start
usermod -a -G docker ec2-user
cd /home/ec2-user
mkdir -p ./valheim
aws s3 cp s3://VALHEIM_SERVER_BUCKET/docker-compose.yml .
aws s3 cp s3://VALHEIM_SERVER_BUCKET/valheim/saves ./valheim/saves --recursive
docker compose up --detach
TOKEN=`curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
while sleep 30; do
    HTTP_CODE=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s -w %{http_code} -o /dev/null http://169.254.169.254/latest/meta-data/spot/instance-action)
    if [[ "$HTTP_CODE" -eq 401 ]] ; then
        echo 'Refreshing Authentication Token'
        TOKEN=`curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 30"`
    elif [[ "$HTTP_CODE" -eq 200 ]] ; then
        echo 'Termination Notice Received'
        docker compose down
        aws s3 cp ./valheim/saves s3://VALHEIM_SERVER_BUCKET/valheim/saves --recursive
        aws s3 cp ./valheim/backups s3://VALHEIM_SERVER_BUCKET/valheim/backups --recursive
    else
        echo 'Not Interrupted'
    fi
done