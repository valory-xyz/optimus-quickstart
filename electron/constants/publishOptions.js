// update key: READ-ONLY access to Olas Operate App, delete once public
const updateKey =
  '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';

const publishOptions = {
  provider: 'github',
  owner: 'valory-xyz',
  repo: 'olas-operate-app',
  releaseType: 'release',
  token: process.env.GH_TOKEN,
  private: true,
  publishAutoUpdate: true,
};

module.exports = { publishOptions, updateKey };
