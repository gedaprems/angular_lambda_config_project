const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
require('dotenv').config();

const { getEnvAwsConfig } = require('./config/aws-config');

const app = express();
app.use(cors());

app.get('/config/local-lambdas/:env', async (req, res) => {
  const { env } = req.params;
  const [envName, domain] = env.toLowerCase().split('_');
  const filePath = path.join(__dirname, 'lambda-config', 'env', envName, domain, 'lambda-config.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return res.json(JSON.parse(data));
  }
  res.status(404).send('Config not found');
});

app.get('/config/lambdas/:env', async (req, res) => {
  const { env } = req.params;
  const envKey = env.toLowerCase();
  let awsConfig;
  try {
    awsConfig = getEnvAwsConfig(envKey);
  } catch (error) {
    return res.status(400).send(error.message);
  }

  AWS.config.update({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region
  });
  
  const lambda = new AWS.Lambda();
  const [envName, domain] = env.toLowerCase().split('_');

  try {
    const data = await lambda.listFunctions().promise();
    const functions = data.Functions;

    const payload = {
      lastFetched: new Date().toISOString(),
      lambdas: functions
    };

    // Write to env-specific file
    const outputDir = path.join(__dirname, '..', 'backend', 'lambda-config', 'env', envName, domain);
    const outputFile = path.join(outputDir, 'lambda-config.json');

    // Create dir if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));


    res.json(payload);
  } catch (err) {
    console.error('AWS Lambda fetch error:', err);
    res.status(500).send('Error fetching Lambda functions');
  }
});

app.get('/config/status', (req, res) => {
  res.json({ status: 'API running ✅', timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
  console.log('Node API running on port 3000');
});
