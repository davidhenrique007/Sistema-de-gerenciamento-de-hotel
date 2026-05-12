let updateInterval = null;
let currentIntervalSeconds = 30;
let callbacks = [];

export const startAutoUpdate = () => {
  if (updateInterval) clearInterval(updateInterval);
  
  updateInterval = setInterval(() => {
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro no auto-update callback:', error);
      }
    });
  }, currentIntervalSeconds * 1000);
  
  localStorage.setItem('auto_update_enabled', 'true');
};

export const stopAutoUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  localStorage.setItem('auto_update_enabled', 'false');
};

export const getUpdateStatus = () => {
  const saved = localStorage.getItem('auto_update_enabled');
  if (saved === null) return true;
  return saved === 'true';
};

export const setUpdateInterval = (seconds) => {
  currentIntervalSeconds = seconds;
  localStorage.setItem('auto_update_interval', seconds.toString());
  
  if (getUpdateStatus() && updateInterval) {
    startAutoUpdate();
  }
};

export const getUpdateInterval = () => {
  const saved = localStorage.getItem('auto_update_interval');
  return saved ? parseInt(saved) : 30;
};

export const registerCallback = (callback) => {
  callbacks.push(callback);
  return () => {
    callbacks = callbacks.filter(cb => cb !== callback);
  };
};

export const refreshNow = () => {
  callbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Erro no refresh manual:', error);
    }
  });
};

export default {
  startAutoUpdate,
  stopAutoUpdate,
  getUpdateStatus,
  setUpdateInterval,
  getUpdateInterval,
  registerCallback,
  refreshNow
};