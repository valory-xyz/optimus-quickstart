const dotenv = require('dotenv');
const build = require('electron-builder').build;

dotenv.config();

const main = async () => {
  console.log('Building...');

  /** @type import {CliOptions} from "electron-builder" */
  await build({
    config: {
      productName: 'Olas Operate',
      artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',

      appId: 'xyz.valory.olas-operate-app',
      category: 'public.app-category.utilities',
      directories: {
        output: 'dist',
      },
      mac: {
        target: [
          {
            target: 'dmg',
            arch: ['arm64'],
          },
        ],
        icon: 'electron/assets/icons/splash-robot-head.png',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'electron/entitlements.mac.plist',
        entitlementsInherit: 'electron/entitlements.mac.plist',
        category: 'public.app-category.utilities',
        notarize: {
          teamId: process.env.APPLETEAMID,
        },
      },
    },
  });
};

main().then((response) => { console.log('Build & Notarize complete'); response.map(x => console.log(x)) }).catch((e) => console.error(e));
