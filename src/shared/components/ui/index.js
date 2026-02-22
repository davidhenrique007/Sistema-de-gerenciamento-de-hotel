// ============================================
// UI Components Barrel
// ============================================
// Exporta todos os componentes UI para fácil importação
// ============================================

// ============================================
// DIA 16 - Componentes Básicos
// ============================================

// Button
export { 
  Button, 
  ButtonVariant, 
  ButtonSize 
} from './Button/Button.js';

// Input
export { 
  Input, 
  InputType, 
  InputSize 
} from './Input/Input.js';

// ============================================
// DIA 17 - Componentes de Feedback
// ============================================

// Spinner
export { 
  Spinner, 
  SpinnerSize, 
  SpinnerColor,
  SpinnerOverlay,
  SpinnerInline 
} from './Spinner/Spinner.js';

// Notification
export {
  Notification,
  NotificationType,
  NotificationPosition,
  NotificationProvider,
  NotificationContainer,
  useNotification
} from './Notification/Notification.js';

// ============================================
// DIA 18 - Componentes Estruturais
// ============================================

// Modal
export {
  Modal,
  ModalSize,
  useModal
} from './Modal/Modal.js';