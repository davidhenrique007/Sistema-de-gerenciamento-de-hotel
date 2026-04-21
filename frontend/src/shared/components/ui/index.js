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
} from './Button/Button.jsx';  // ← mudou para .jsx

// Input
export { 
  Input, 
  InputType, 
  InputSize 
} from './Input/Input.jsx';  // ← mudou para .jsx

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
} from './Spinner/Spinner.jsx';  // ← mudou para .jsx

// Notification
export {
  Notification,
  NotificationType,
  NotificationPosition,
  NotificationProvider,
  NotificationContainer,
  useNotification
} from './Notification/Notification.jsx';  // ← mudou para .jsx

// ============================================
// DIA 18 - Componentes Estruturais
// ============================================

// Modal
export {
  Modal,
  ModalSize,
  useModal
} from './Modal/Modal.jsx';  // ← mudou para .jsx