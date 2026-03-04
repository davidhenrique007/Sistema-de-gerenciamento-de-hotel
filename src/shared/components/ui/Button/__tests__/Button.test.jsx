import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

// ============================================================================
// TEST SUITE: BUTTON COMPONENT
// ============================================================================

describe('Button Component', () => {
  // ==========================================================================
  // RENDERIZAÇÃO BÁSICA
  // ==========================================================================

  describe('Renderização Básica', () => {
    it('deve renderizar com children', () => {
      render(<Button>Reservar</Button>);
      
      const button = screen.getByRole('button', { name: /reservar/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Reservar');
    });

    it('deve aplicar className customizada', () => {
      render(<Button className="custom-class">Teste</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('deve passar props adicionais para o elemento', () => {
      render(<Button data-testid="test-button">Teste</Button>);
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // VARIANTES
  // ==========================================================================

  describe('Variantes', () => {
    it('deve usar variant primary por padrão', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('primary');
    });

    it('deve aplicar classe secondary quando variant="secondary"', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('secondary');
    });

    it('deve aplicar classe outline quando variant="outline"', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('outline');
    });
  });

  // ==========================================================================
  // TAMANHOS
  // ==========================================================================

  describe('Tamanhos', () => {
    it('deve usar size md por padrão', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('md');
    });

    it('deve aplicar classe sm quando size="sm"', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('sm');
    });

    it('deve aplicar classe lg quando size="lg"', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('lg');
    });
  });

  // ==========================================================================
  // ESTADO DISABLED
  // ==========================================================================

  describe('Estado Disabled', () => {
    it('deve estar desabilitado quando disabled=true', () => {
      render(<Button disabled>Desabilitado</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('não deve chamar onClick quando desabilitado', async () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Desabilitado
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // EVENTO ONCLICK
  // ==========================================================================

  describe('Evento onClick', () => {
    it('deve chamar onClick quando clicado', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clicar</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve passar o evento para onClick', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clicar</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // ==========================================================================
  // TIPO DO BOTÃO
  // ==========================================================================

  describe('Type', () => {
    it('deve ter type="button" por padrão', () => {
      render(<Button>Botão</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('deve aceitar type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('deve aceitar type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  // ==========================================================================
  // FULL WIDTH
  // ==========================================================================

  describe('Full Width', () => {
    it('deve aplicar classe fullWidth quando fullWidth=true', () => {
      render(<Button fullWidth>Largura Total</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fullWidth');
    });

    it('não deve aplicar fullWidth quando false', () => {
      render(<Button>Normal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('fullWidth');
    });
  });

  // ==========================================================================
  // ESTADO DE CARREGAMENTO
  // ==========================================================================

  describe('Loading State', () => {
    it('deve mostrar spinner quando loading=true', () => {
      render(<Button loading>Carregando</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Verificar se o spinner está presente
      const spinner = document.querySelector(`.${styles.spinner}`);
      expect(spinner).toBeInTheDocument();
    });

    it('deve manter o texto visível durante loading', () => {
      render(<Button loading>Salvar</Button>);
      
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });

    it('não deve chamar onClick durante loading', async () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Carregando
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe('Acessibilidade', () => {
    it('deve ter role="button"', () => {
      render(<Button>Botão</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve ser focusable', async () => {
      render(<Button>Foco</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.tab();
      
      expect(button).toHaveFocus();
    });

    it('deve aceitar ariaLabel', () => {
      render(<Button ariaLabel="Fechar modal">✕</Button>);
      
      const button = screen.getByRole('button', { name: /fechar modal/i });
      expect(button).toBeInTheDocument();
    });

    it('deve ter aria-disabled quando disabled', () => {
      render(<Button disabled>Desabilitado</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('deve ter aria-busy quando loading', () => {
      render(<Button loading>Carregando</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  // ==========================================================================
  // FORWARD REF
  // ==========================================================================

  describe('forwardRef', () => {
    it('deve encaminhar ref corretamente', () => {
      const ref = React.createRef();
      render(<Button ref={ref}>Com ref</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // ==========================================================================
  // SNAPSHOT (OPCIONAL)
  // ==========================================================================

  it('deve corresponder ao snapshot', () => {
    const { container } = render(
      <Button variant="primary" size="md">
        Snapshot
      </Button>
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});