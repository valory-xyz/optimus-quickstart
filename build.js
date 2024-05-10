const dotenv = require('dotenv');
const build = require('electron-builder').build;

dotenv.config();

const main = async () => {
  console.log('Building...');

  /** @type import {CliOptions} from "electron-builder" */
  await build({
    config: {
      appId: 'xyz.valory.olas-operate-app',
      artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
      productName: 'Olas Operate',
      publish: {
        provider: 'github',
        owner: 'valory-xyz',
        repo: 'olas-operate-app',
        releaseType: 'draft',
        token: process.env.GH_TOKEN,
      },
      directories: {
        output: 'dist',
      },
      cscKeyPassword: process.env.CSC_KEY_PASSWORD,
      cscLink: process.env.CSC_LINK,
      mac: {
        target: [
          {
            target: 'dmg',
            arch: ['arm64'],
          },
        ],
        category: 'public.app-category.utilities',
        icon: 'electron/assets/icons/splash-robot-head.png',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'electron/entitlements.mac.plist',
        entitlementsInherit: 'electron/entitlements.mac.plist',
        notarize: {
          teamId: process.env.APPLETEAMID
        },
      },
    },
  });
};

main().then((response) => { console.log('Build & Notarize complete'); console.log(response) }).catch((e) => console.error(e));
