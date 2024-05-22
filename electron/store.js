const beforeEachMigration = (_store, context) => {
  console.log(
    `[store] migrate from ${context.fromVersion} → ${context.toVersion}`,
  );
};

const setupStoreIpc = async (ipcChannel, mainWindow) => {
  const Store = (await import('electron-store')).default;

  // update this object if/when you add/remove keys from the store
  const migrations = {
    '>=0.1.0-rc20': (store) => {
      store.set('isInitialFunded', false);
    },
  };

  const store = new Store({ beforeEachMigration, migrations });

  store.onDidAnyChange((data) => {
    if (mainWindow?.webContents)
      mainWindow.webContents.send('store-changed', data);
  });

  // exposed to electron browser window
  ipcChannel.handle('store', () => store.store);
  ipcChannel.handle('store-get', (_, key) => store.get(key));
  ipcChannel.handle('store-set', (_, key, value) => store.set(key, value));
  ipcChannel.handle('store-delete', (_, key) => store.delete(key));
};

module.exports = { setupStoreIpc };
