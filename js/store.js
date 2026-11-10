const DB_NAME = 'billetera';
const DB_VERSION = 1;
const STORE = 'expenses';

let connection;

function open() {
  connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return connection;
}

async function run(mode, operation) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = operation(transaction.objectStore(STORE));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = transaction.onabort = () => reject(transaction.error);
  });
}

export const getAll = () => run('readonly', store => store.getAll());
export const add = expense => run('readwrite', store => store.add(expense));
export const remove = id => run('readwrite', store => store.delete(id));
