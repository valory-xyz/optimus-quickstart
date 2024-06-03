const publishOptions = {
  provider: 'github',
  owner: 'valory-xyz',
  repo: 'olas-operate-app',
  token: process.env.GH_TOKEN,
  private: false,
  publishAutoUpdate: true,
  releaseType: 'draft',
};

module.exports = { publishOptions };
