import { useWidgets } from '../contexts/WidgetContext';

export const useWidgetSettings = () => {
  const context = useWidgets();
  return {
    widgets: context.widgets || {},
    loading: context.loading || false,
    toggleWidget: context.toggleWidget || (() => {}),
    resetWidgets: context.resetWidgets || (() => {}),
    isWidgetEnabled: (id) => context.widgets?.[id] ?? true
  };
};

export default useWidgetSettings;