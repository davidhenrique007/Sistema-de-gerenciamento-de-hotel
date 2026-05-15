import { useNotifications } from '../contexts/NotificationContext';

export const useNotificationSettings = () => {
  const {
    settings,
    loading,
    toggleNotification,
    enableNotification,
    disableNotification,
    resetSettings,
    isNotificationEnabled,
    shouldShowToast,
    shouldPlaySound
  } = useNotifications();

  return {
    settings,
    loading,
    toggleNotification,
    enableNotification,
    disableNotification,
    resetSettings,
    isNotificationEnabled,
    shouldShowToast,
    shouldPlaySound
  };
};

export default useNotificationSettings;