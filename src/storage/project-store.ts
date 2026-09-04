import type { StudioProject } from '../studio-model';

// IndexedDB supports structured data and Blobs: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

const STORE_NAME = 'projects';
const CURRENT_PROJECT_KEY = 'current';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error ?? new Error('Local storage request failed')), {
      once: true,
    });
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true });
    transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('Local storage transaction aborted')), {
      once: true,
    });
    transaction.addEventListener('error', () => reject(transaction.error ?? new Error('Local storage transaction failed')), {
      once: true,
    });
  });
}

export class ProjectStore {
  private database?: IDBDatabase;

  constructor(private readonly databaseName = 'hushline-studio') {}

  private async open(): Promise<IDBDatabase> {
    if (this.database) return this.database;

    const request = indexedDB.open(this.databaseName, 1);
    request.addEventListener('upgradeneeded', () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    });
    this.database = await requestResult(request);
    return this.database;
  }

  async load(): Promise<StudioProject | undefined> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    return requestResult(transaction.objectStore(STORE_NAME).get(CURRENT_PROJECT_KEY));
  }

  async save(project: StudioProject): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(
      { ...project, updatedAt: Date.now() },
      CURRENT_PROJECT_KEY,
    );
    await transactionDone(transaction);
  }

  async clear(): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(CURRENT_PROJECT_KEY);
    await transactionDone(transaction);
  }

  close(): void {
    this.database?.close();
    this.database = undefined;
  }
}
