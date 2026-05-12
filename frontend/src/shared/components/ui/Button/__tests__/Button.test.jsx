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
      exportpect(button).toBeInTheDocument();
      exportpect(button).toHaveTexporttContent('Reservar');
    });

    it('deve aplicar className customizada', () => {
      render(<Button className="custom-class">Teste</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('custom-class');
    });

    it('deve passar props adicionais para o elemento', () => {
      render(<Button data-testid="test-button">Teste</Button>);
      
      const button = screen.getByTestId('test-button');
      exportpect(button).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // VARIANTES
  // ==========================================================================

  describe('Variantes', () => {
    it('deve usar variant primary por padrão', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('primary');
    });

    it('deve aplicar classe secondary quando variant="secondary"', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('secondary');
    });

    it('deve aplicar classe outline quando variant="outline"', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('outline');
    });
  });

  // ==========================================================================
  // TAMANHOS
  // ==========================================================================

  describe('Tamanhos', () => {
    it('deve usar size md por padrão', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('md');
    });

    it('deve aplicar classe sm quando size="sm"', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('sm');
    });

    it('deve aplicar classe lg quando size="lg"', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('lg');
    });
  });

  // ==========================================================================
  // ESTADO DISABLED
  // ==========================================================================

  describe('Estado Disabled', () => {
    it('deve estar desabilitado quando disabled=true', () => {
      render(<Button disabled>Desabilitado</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toBeDisabled();
      exportpect(button).toHaveAttribute('aria-disabled', 'true');
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

      exportpect(handleClick).not.toHaveBeenCalled();
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

      exportpect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve passar o evento para onClick', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clicar</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      exportpect(handleClick).toHaveBeenCalledWith(exportpect.any(Object));
    });
  });

  // ==========================================================================
  // TIPO DO BOTÃO
  // ==========================================================================

  describe('Type', () => {
    it('deve ter type="button" por padrão', () => {
      render(<Button>Botão</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveAttribute('type', 'button');
    });

    it('deve aceitar type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveAttribute('type', 'submit');
    });

    it('deve aceitar type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveAttribute('type', 'reset');
    });
  });

  // ==========================================================================
  // FULL WIDTH
  // ==========================================================================

  describe('Full Width', () => {
    it('deve aplicar classe fullWidth quando fullWidth=true', () => {
      render(<Button fullWidth>Largura Total</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('fullWidth');
    });

    it('não deve aplicar fullWidth quando false', () => {
      render(<Button>Normal</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).not.toHaveClass('fullWidth');
    });
  });

  // ==========================================================================
  // ESTADO DE CARREGAMENTO
  // ==========================================================================

  describe('Loading State', () => {
    it('deve mostrar spinner quando loading=true', () => {
      render(<Button loading>Carregando</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveClass('loading');
      exportpect(button).toBeDisabled();
      exportpect(button).toHaveAttribute('aria-busy', 'true');
      
      // Verificar se o spinner está presente
      const spinner = document.querySelector(`.${styles.spinner}`);
      exportpect(spinner).toBeInTheDocument();
    });

    it('deve manter o texportto visível durante loading', () => {
      render(<Button loading>Salvar</Button>);
      
      exportpect(screen.getByTexportt('Salvar')).toBeInTheDocument();
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

      exportpect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe('Acessibilidade', () => {
    it('deve ter role="button"', () => {
      render(<Button>Botão</Button>);
      
      exportpect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve ser focusable', async () => {
      render(<Button>Foco</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.tab();
      
      exportpect(button).toHaveFocus();
    });

    it('deve aceitar ariaLabel', () => {
      render(<Button ariaLabel="Fechar modal">Fechar</Button>);
      
      const button = screen.getByRole('button', { name: /fechar modal/i });
      exportpect(button).toBeInTheDocument();
    });

    it('deve ter aria-disabled quando disabled', () => {
      render(<Button disabled>Desabilitado</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('deve ter aria-busy quando loading', () => {
      render(<Button loading>Carregando</Button>);
      
      const button = screen.getByRole('button');
      exportpect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  // ==========================================================================
  // FORWARD REF
  // ==========================================================================

  describe('forwardRef', () => {
    it('deve encaminhar ref corretamente', () => {
      const ref = React.createRef();
      render(<Button ref={ref}>Com ref</Button>);
      
      exportpect(ref.current).toBeInstanceOf(HTMLButtonElement);
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
    
    exportpect(container.firstChild).toMatchSnapshot();
  });
});