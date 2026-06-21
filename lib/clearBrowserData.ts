const deleteIndexedDatabase = (name: string) =>
  new Promise<void>((resolve) => {
    const request = window.indexedDB.deleteDatabase(name);
    const finish = () => resolve();
    request.onsuccess = finish;
    request.onerror = finish;
    request.onblocked = finish;
  });

export async function clearBrowserData() {
  if (typeof window === 'undefined') return;

  try {
    const { db } = await import('@/lib/db');
    db.close();
  } catch (error) {
    console.warn('Unable to close the local POS database', error);
  }

  try {
    const databaseList = typeof window.indexedDB.databases === 'function'
      ? await window.indexedDB.databases()
      : [{ name: 'FoodScanOfflineDB' }];
    const databaseNames = [...new Set(databaseList.map(database => database.name).filter(Boolean) as string[])];
    await Promise.all(databaseNames.map(deleteIndexedDatabase));
  } catch (error) {
    console.warn('Unable to clear IndexedDB completely', error);
    await deleteIndexedDatabase('FoodScanOfflineDB');
  }

  try {
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(cacheName => window.caches.delete(cacheName)));
    }
  } catch (error) {
    console.warn('Unable to clear browser caches', error);
  }

  window.localStorage.clear();
  window.sessionStorage.clear();
}
