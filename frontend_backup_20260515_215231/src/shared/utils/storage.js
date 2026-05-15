// ============================================
// WRAPPER SEGURO PARA STORAGE
// ============================================

/**
 * Verifica se o storage está disponível
 */
const isStorageAvailable = (type) => {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Wrapper para localStorage
 */
class LocalStorageWrapper {
  constructor() {
    this.available = isStorageAvailable('local');
    this.memoryStorage = new Map();
  }

  setItem(key, value) {
    try {
      const valueToStore = JSON.stringify(value);
      if (this.available) {
        localStorage.setItem(key, valueToStore);
      } else {
        this.memoryStorage.set(key, valueToStore);
      }
      return true;
    } catch {
      this.memoryStorage.set(key, JSON.stringify(value));
      return false;
    }
  }

  getItem(key) {
    try {
      let value = null;
      if (this.available) {
        value = localStorage.getItem(key);
      } else {
        value = this.memoryStorage.get(key);
      }
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  removeItem(key) {
    if (this.available) {
      localStorage.removeItem(key);
    }
    this.memoryStorage.delete(key);
  }

  clear() {
    if (this.available) {
      localStorage.clear();
    }
    this.memoryStorage.clear();
  }
}

/**
 * Wrapper para sessionStorage
 */
class SessionStorageWrapper {
  constructor() {
    this.available = isStorageAvailable('session');
    this.memoryStorage = new Map();
  }

  setItem(key, value) {
    try {
      const valueToStore = JSON.stringify(value);
      if (this.available) {
        sessionStorage.setItem(key, valueToStore);
      } else {
        this.memoryStorage.set(key, valueToStore);
      }
      return true;
    } catch {
      this.memoryStorage.set(key, JSON.stringify(value));
      return false;
    }
  }

  getItem(key) {
    try {
      let value = null;
      if (this.available) {
        value = sessionStorage.getItem(key);
      } else {
        value = this.memoryStorage.get(key);
      }
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  removeItem(key) {
    if (this.available) {
      sessionStorage.removeItem(key);
    }
    this.memoryStorage.delete(key);
  }

  clear() {
    if (this.available) {
      sessionStorage.clear();
    }
    this.memoryStorage.clear();
  }
}

// Instâncias
export const localStorageWrapper = new LocalStorageWrapper();
export const sessionStorageWrapper = new SessionStorageWrapper();

// Objeto de conveniência
export const storage = {
  local: localStorageWrapper,
  session: sessionStorageWrapper
};