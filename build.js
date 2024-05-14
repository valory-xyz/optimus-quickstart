const dotenv = require('dotenv');
const build = require('electron-builder').build;

dotenv.config();

const main = async () => {
  console.log('Building...');

  /** @type import {CliOptions} from "electron-builder" */
  await build({
    publish: 'always',
    config: {
      appId: 'xyz.valory.olas-operate-app',
      artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
      productName: 'Olas Operate',
      files: ['electron/**/*', 'package.json'],
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
        publish: {
          provider: 'github',
          owner: 'valory-xyz',
          repo: 'olas-operate-app',
          releaseType: 'draft',
          token: process.env.GH_TOKEN,
        },
        category: 'public.app-category.utilities',
        icon: 'electron/assets/icons/splash-robot-head-dock.png',
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
