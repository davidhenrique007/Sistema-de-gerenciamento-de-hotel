import React, { useState, useEffect } from 'react';
import styles from '../styles/Checkout.module.css';

const servicosDisponiveis = [
  {
    id: 'cafe_manha',
    nome: 'Café da manhã',
    descricao: 'Café da manhã completo com opções regionais',
    preco: 120,
    tipo: 'por_noite',
    categoria: 'alimentacao',
    icone: '🍳'
  },
  {
    id: 'spa',
    nome: 'Spa & Bem-estar',
    descricao: 'Sessão de massagem relaxante',
    preco: 350,
    tipo: 'por_noite',
    categoria: 'bem_estar',
    icone: '💆'
  },
  {
    id: 'piscina',
    nome: 'Piscina aquecida',
    descricao: 'Acesso à piscina aquecida',
    preco: 200,
    tipo: 'por_noite',
    categoria: 'lazer',
    icone: '🏊'
  },
  {
    id: 'academia',
    nome: 'Academia moderna',
    descricao: 'Equipamentos modernos e acompanhamento',
    preco: 150,
    tipo: 'por_noite',
    categoria: 'bem_estar',
    icone: '💪'
  },
  {
    id: 'translado',
    nome: 'Translado aeroporto',
    descricao: 'Ida e volta ao aeroporto',
    preco: 500,
    tipo: 'unico',
    categoria: 'conveniencia',
    icone: '🚗'
  },
  {
    id: 'wifi_premium',
    nome: 'Wi-Fi Premium',
    descricao: 'Internet de alta velocidade',
    preco: 50,
    tipo: 'por_noite',
    categoria: 'conveniencia',
    icone: '📶'
  }
];

const ServicosAdicionais = ({ nights, servicosSelecionados, onServicosChange }) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [servicosTemp, setServicosTemp] = useState([]);

  useEffect(() => {
    setServicosTemp(servicosSelecionados || []);
  }, [servicosSelecionados]);

  const categorias = [
    { id: 'todos', nome: 'Todos', icone: '✨' },
    { id: 'alimentacao', nome: 'Alimentação', icone: '🍽️' },
    { id: 'bem_estar', nome: 'Bem-estar', icone: '💆' },
    { id: 'lazer', nome: 'Lazer', icone: '🎯' },
    { id: 'conveniencia', nome: 'Conveniência', icone: '📱' }
  ];

  const handleToggleServico = (servico) => {
    const novosServicos = servicosTemp.some(s => s.id === servico.id)
      ? servicosTemp.filter(s => s.id !== servico.id)
      : [...servicosTemp, servico];
    
    setServicosTemp(novosServicos);
    onServicosChange(novosServicos);
  };

  const isSelecionado = (servicoId) => {
    return servicosTemp.some(s => s.id === servicoId);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const servicosFiltrados = categoriaAtiva === 'todos'
    ? servicosDisponiveis
    : servicosDisponiveis.filter(s => s.categoria === categoriaAtiva);

  const totalServicos = servicosTemp.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' 
      ? servico.preco * nights 
      : servico.preco;
    return total + preco;
  }, 0);

  return (
    <div className={styles.servicosContainer}>
      <div className={styles.servicosHeader}>
        <h3 className={styles.servicosTitle}>
          ✨ Serviços Adicionais
        </h3>
        <p className={styles.servicosSubtitle}>
          Personalize sua estadia com serviços exclusivos
        </p>
      </div>

      {/* Categorias */}
      <div className={styles.categoriasContainer}>
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoriaButton} ${categoriaAtiva === cat.id ? styles.categoriaAtiva : ''}`}
            onClick={() => setCategoriaAtiva(cat.id)}
          >
            <span>{cat.icone}</span>
            <span>{cat.nome}</span>
          </button>
        ))}
      </div>

      {/* Lista de Serviços */}
      <div className={styles.servicosGrid}>
        {servicosFiltrados.map(servico => {
          const precoPorNoite = servico.tipo === 'por_noite' 
            ? `${formatCurrency(servico.preco)} / noite`
            : formatCurrency(servico.preco);
          
          const precoTotal = servico.tipo === 'por_noite' 
            ? servico.preco * nights
            : servico.preco;

          return (
            <div 
              key={servico.id} 
              className={`${styles.servicoCard} ${isSelecionado(servico.id) ? styles.servicoSelecionado : ''}`}
            >
              <div className={styles.servicoIcon}>{servico.icone}</div>
              <div className={styles.servicoInfo}>
                <h4 className={styles.servicoNome}>{servico.nome}</h4>
                <p className={styles.servicoDescricao}>{servico.descricao}</p>
                <div className={styles.servicoPreco}>
                  <span className={styles.precoPorNoite}>{precoPorNoite}</span>
                  {isSelecionado(servico.id) && (
                    <span className={styles.precoTotal}>
                      Total: {formatCurrency(precoTotal)}
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`${styles.servicoButton} ${isSelecionado(servico.id) ? styles.buttonRemover : styles.buttonAdicionar}`}
                onClick={() => handleToggleServico(servico)}
              >
                {isSelecionado(servico.id) ? 'Remover' : 'Adicionar'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Resumo dos Serviços */}
      {servicosTemp.length > 0 && (
        <div className={styles.servicosResumo}>
          <div className={styles.resumoHeader}>
            <span>📋 Serviços selecionados ({servicosTemp.length})</span>
            <span className={styles.resumoTotal}>Total: {formatCurrency(totalServicos)}</span>
          </div>
          <div className={styles.resumoLista}>
            {servicosTemp.map(servico => (
              <div key={servico.id} className={styles.resumoItem}>
                <span>{servico.icone} {servico.nome}</span>
                <span>
                  {servico.tipo === 'por_noite' 
                    ? `${formatCurrency(servico.preco)} x ${nights} noites`
                    : formatCurrency(servico.preco)}
                  = {formatCurrency(servico.tipo === 'por_noite' ? servico.preco * nights : servico.preco)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosAdicionais;