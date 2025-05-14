const regionMap = {
  us: 'eu-central-1',
  ous: 'eu-central-1',
  clinical: 'us-east-1'
};

const credentialsMap = {
  test1: {
    accessKeyId: process.env.TEST_ACCESS_KEY_ID,
    secretAccessKey: process.env.TEST_SECRET_ACCESS_KEY
  },
};

function parseEnvKey(envKey) {
  const [env, region] = envKey.split('_');
  return { env, region };
}

function getEnvAwsConfig(envKey) {
  const { env, region } = parseEnvKey(envKey);
  const creds = credentialsMap[env];
  const regionName = regionMap[region];

  if (!creds || !regionName) {
    throw new Error(`Invalid ENV_NAME: ${envKey}`);
  }

  return {
    ...creds,
    region: regionName
  };
}

module.exports = {
  getEnvAwsConfig
};
