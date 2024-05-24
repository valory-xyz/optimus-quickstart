const publishOptions = {
  provider: 'github',
  owner: 'valory-xyz',
  repo: 'olas-operate-app',
  releaseType: 'release',
  token: process.env.GH_TOKEN,
  private: false,
  publishAutoUpdate: true,
};

module.exports = { publishOptions };
