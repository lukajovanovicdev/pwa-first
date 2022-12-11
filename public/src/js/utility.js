const dbPromise = idb.open('feed-store', 1, (db) => {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
});

const writeData = (storeName, data) =>
  dbPromise.then((db) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    return tx.complete;
  });

const readAllData = (storeName) =>
  dbPromise.then((db) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
  });

const clearAllData = (storeName) =>
  dbPromise.then((db) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    return tx.complete;
  });

const deleteItemFromData = (storeName, id) =>
  dbPromise
    .then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);
      return tx.complete;
    })
    .then(() => console.log('Item deleted'));
