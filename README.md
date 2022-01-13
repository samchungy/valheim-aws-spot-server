# Valheim AWS Spot Instance Server
- Launches a Valheim Server on an EC2 Spot Instance which backs up to S3 all from GitHub Actions.
- Also creates a receiver for 2 slash commands on Discord - `/valheim start` and `/valheim stop` to start/stop the server.

## Installation
1. Clone Repo and commit to a private repo on Github.
2. Adjust the config in Serverless.yml under Custom > Config. You will need to adjust
  - `bucketName`
  - `region`
  - `serverName`
  - `instanceType` (optional)

3. Add the following secrets to GitHub Actions Secrets 
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DISCORD_PUBLIC_TOKEN
SERVER_PASSWORD # Valheim Server Password
SERVER_WEBHOOK # Discord Server Webhook URL
```

4. Run the workflow. Profit.

5. You can remove the Elastic IP option if you want to save a bit more money.

## Discord Slash Commands
You can setup Slash commands for your server here: https://discord.com/developers/docs/interactions/application-commands. Use the URL from the API Gateway path as action endpoint for Discord.

```
{
    "name": "valheim",
    "description": "start or stop the valheim server",
    "options": [
        {
            "name": "start",
            "description": "Start the valheim server",
            "type": 1
        },
        {
            "name": "stop",
            "description": "Stop the valheim server",
            "type": 1
        }
    ],
    "default_permission": false
}
```

 If you don't wish to use the Discord Slash Command integration you can invoke the start/stop Lambdas using the AWS CLI. eg.

```
aws lambda invoke \
    --function-name valheim-dev-start-server \
    --invocation-type Event \
    --payload '{}'
```
