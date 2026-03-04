import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, NOTIFICATION_TYPES } from '../NotificationContext';
import Notification from '../Notification';
import useNotification from '../useNotification';

// ============================================================================
// COMPONENTE DE TESTE
// ============================================================================

const TestComponent = ({ onNotify }) => {
  const { 
    notifySuccess, 
    notifyError, 
    notifyWarning, 
    notifyInfo,
    clearAllNotifications,
  } = useNotification();
  
  React.useEffect(() => {
    if (onNotify) {
      onNotify({ 
        notifySuccess, 
        notifyError, 
        notifyWarning, 
        notifyInfo,
        clearAllNotifications,
      });
    }
  }, [onNotify, notifySuccess, notifyError, notifyWarning, notifyInfo, clearAllNotifications]);
  
  return (
    <div>
      <button onClick={() => notifySuccess('Success message')}>
        Success
      </button>
      <button onClick={() => notifyError('Error message')}>
        Error
      </button>
      <button onClick={() => notifyWarning('Warning message')}>
        Warning
      </button>
      <button onClick={() => notifyInfo('Info message')}>
        Info
      </button>
      <button onClick={() => clearAllNotifications()}>
        Clear All
      </button>
    </div>
  );
};

// ============================================================================
// TESTES
// ============================================================================

describe('Notification System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  describe('Renderização', () => {
    it('deve renderizar sem notificações inicialmente', () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      expect(document.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });

    it('deve lançar erro se useNotification for usado fora do provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotification must be used within a NotificationProvider');
      
      consoleError.mockRestore();
    });
  });

  // ==========================================================================
  // ADIÇÃO DE NOTIFICAÇÕES
  // ==========================================================================

  describe('Adição de notificações', () => {
    it('deve adicionar notificação de sucesso', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      const button = screen.getByText('Success');
      await userEvent.click(button);

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Success message');
      expect(notification).toHaveClass('success');
    });

    it('deve adicionar notificação de erro', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      const button = screen.getByText('Error');
      await userEvent.click(button);

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Error message');
      expect(notification).toHaveClass('error');
    });

    it('deve adicionar notificação de aviso', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      const button = screen.getByText('Warning');
      await userEvent.click(button);

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Warning message');
      expect(notification).toHaveClass('warning');
    });

    it('deve adicionar notificação informativa', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      const button = screen.getByText('Info');
      await userEvent.click(button);

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Info message');
      expect(notification).toHaveClass('info');
    });

    it('deve adicionar múltiplas notificações', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      await userEvent.click(screen.getByText('Success'));
      await userEvent.click(screen.getByText('Error'));
      await userEvent.click(screen.getByText('Warning'));

      const notifications = await screen.findAllByRole('alert');
      expect(notifications).toHaveLength(3);
    });

    it('deve respeitar o limite máximo de notificações', async () => {
      const maxStack = 2;
      
      render(
        <NotificationProvider maxStack={maxStack}>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      const button = screen.getByText('Success');

      for (let i = 0; i < 5; i++) {
        await userEvent.click(button);
      }

      const notifications = await screen.findAllByRole('alert');
      expect(notifications).toHaveLength(maxStack);
    });
  });

  // ==========================================================================
  // AUTO CLOSE
  // ==========================================================================

  describe('Auto close', () => {
    it('deve fechar notificação automaticamente após duration', async () => {
      const duration = 3000;
      
      let notifyFunctions;
      
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent onNotify={(fns) => { notifyFunctions = fns; }} />
        </NotificationProvider>
      );

      act(() => {
        notifyFunctions.notifySuccess('Auto close message', duration);
      });

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(duration / 2);
      });
      
      expect(notification).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(duration / 2);
      });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('não deve fechar automaticamente se duration = 0', async () => {
      let notifyFunctions;
      
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent onNotify={(fns) => { notifyFunctions = fns; }} />
        </NotificationProvider>
      );

      act(() => {
        notifyFunctions.notifySuccess('Persistent message', 0);
      });

      const notification = await screen.findByRole('alert');
      expect(notification).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(notification).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FECHAMENTO MANUAL
  // ==========================================================================

  describe('Fechamento manual', () => {
    it('deve fechar notificação ao clicar no botão de fechar', async () => {
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent />
        </NotificationProvider>
      );

      await userEvent.click(screen.getByText('Success'));

      const notification = await screen.findByRole('alert');
      const closeButton = notification.querySelector('button');
      
      await userEvent.click(closeButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // LIMPEZA DE TODAS NOTIFICAÇÕES
  // ==========================================================================

  describe('Limpeza de todas notificações', () => {
    it('deve limpar todas notificações', async () => {
      let notifyFunctions;
      
      render(
        <NotificationProvider>
          <Notification />
          <TestComponent onNotify={(fns) => { notifyFunctions = fns; }} />
        </NotificationProvider>
      );

      act(() => {
        notifyFunctions.notifySuccess('Message 1');
        notifyFunctions.notifyError('Message 2');
        notifyFunctions.notifyWarning('Message 3');
      });

      await screen.findAllByRole('alert');
      
      act(() => {
        notifyFunctions.clearAllNotifications();
      });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // LIMPEZA DE MEMORY LEAKS
  // ==========================================================================

  describe('Memory leaks', () => {
    it('deve limpar timeouts ao desmontar componente', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      let notifyFunctions;
      
      const { unmount } = render(
        <NotificationProvider>
          <Notification />
          <TestComponent onNotify={(fns) => { notifyFunctions = fns; }} />
        </NotificationProvider>
      );

      act(() => {
        notifyFunctions.notifySuccess('Test message');
      });

      await screen.findByRole('alert');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});