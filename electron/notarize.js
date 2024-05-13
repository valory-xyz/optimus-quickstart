const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  console.log('Notarizing');
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    console.log('Only notarizing for macOS, exiting');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    // appBundleId: 'xyz.valory.olas-operate-app',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLETEAMID,
    tool: 'notarytool',
  }).catch((error) => {
    console.log(error);
    process.exit(1);
  });
  return context;
};
