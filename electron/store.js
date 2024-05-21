const beforeEachMigration = (_store, context) => {
  console.log(
    `[store] migrate from ${context.fromVersion} → ${context.toVersion}`,
  );
};

const setupStoreIpc = async (ipcChannel) => {
  const Store = (await import('electron-store')).default;

  const migrations = {
    '0.0.1': (store) => {
      store.set('isInitialFunded', false);
    },
  };

  const store = new Store({ beforeEachMigration, migrations });

  // exposed to electron browser window
  ipcChannel.handle('store', () => store.store);
  ipcChannel.handle('store-get', (_, key) => store.get(key));
  ipcChannel.handle('store-set', (_, key, value) => store.set(key, value));
  ipcChannel.handle('store-delete', (_, key) => store.delete(key));
};

module.exports = { setupStoreIpc };
