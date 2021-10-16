# Valheim AWS Spot Instance Server
- Launches a Valheim Server on an EC2 Spot Instance which backs up to S3.
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
SERVER_PASSWORD
SERVER_WEBHOOK
```

4. Run the workflow. Profit.

5. You can remove the Elastic IP option if you want to save a bit more money.

## Discord Slash Commands
You can setup Slash commands for your server here: https://discord.com/developers/docs/interactions/application-commands. Use the URL from the API Gateway path as action endpoint for Discord.

bla
