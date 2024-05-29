const publishOptions = {
  provider: 'github',
  owner: 'valory-xyz',
  repo: 'olas-operate-app',
  token: process.env.GH_TOKEN,
  private: false,
  publishAutoUpdate: true,
  releaseType: process.env.IS_STAGING === 'true' ? 'prerelease' : 'release',
  channel: process.env.IS_STAGING === 'true' ? 'alpha' : 'latest',
};

module.exports = { publishOptions };
