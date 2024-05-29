// set schema to validate store data
const schema = {
  isInitialFunded: {
    type: 'boolean',
    default: false,
  },
  firstStakingRewardAchieved: {
    type: 'boolean',
    default: false,
  },
  firstRewardNotificationShown: {
    type: 'boolean',
    default: false,
  },
};

const setupStoreIpc = async (ipcChannel, mainWindow) => {
  const Store = (await import('electron-store')).default;

  /** @type import Store from 'electron-store' */
  const store = new Store({
    schema,
  });

  store.onDidAnyChange((data) => {
    if (mainWindow?.webContents)
      mainWindow.webContents.send('store-changed', data);
  });

  // exposed to electron browser window
  ipcChannel.handle('store', () => store.store);
  ipcChannel.handle('store-get', (_, key) => store.get(key));
  ipcChannel.handle('store-set', (_, key, value) => store.set(key, value));
  ipcChannel.handle('store-delete', (_, key) => store.delete(key));
  ipcChannel.handle('store-clear', (_) => store.clear());
};

module.exports = { setupStoreIpc };
