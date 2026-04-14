import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiShield, FiLock, FiSave } from 'react-icons/fi';
import styles from './ModalUtilizador.module.css';

const ModalUtilizador = ({ isOpen, onClose, utilizador, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    password: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Definição dos perfis com ícones
  const perfis = [
    { value: 'admin', label: 'Administrador', icon: '👑', desc: 'Acesso total ao sistema' },
    { value: 'receptionist', label: 'Rececionista', icon: '🛎️', desc: 'Gestão de reservas e quartos' },
    { value: 'financial', label: 'Financeiro', icon: '💰', desc: 'Gestão de pagamentos e relatórios' }
  ];

  useEffect(() => {
    if (isOpen && utilizador) {
      setFormData({
        name: utilizador.name || '',
        email: utilizador.email || '',
        phone: utilizador.phone || '',
        role: utilizador.role || 'receptionist',
        password: '',
        is_active: utilizador.is_active !== undefined ? utilizador.is_active : true
      });
    } else if (isOpen && !utilizador) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'receptionist',
        password: '',
        is_active: true
      });
    }
  }, [isOpen, utilizador]);

  const validarFormulario = () => {
    const novosErros = {};
    if (!formData.name.trim()) novosErros.name = 'Nome é obrigatório';
    if (!formData.email.trim()) novosErros.email = 'Email é obrigatório';
    if (!utilizador && !formData.password) novosErros.password = 'Senha é obrigatória para novo utilizador';
    if (formData.password && formData.password.length < 6) novosErros.password = 'Senha deve ter pelo menos 6 caracteres';
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    const token = localStorage.getItem('admin_token');
    const url = utilizador 
      ? `http://localhost:5000/api/admin/utilizadores/${utilizador.id}`
      : 'http://localhost:5000/api/admin/utilizadores';
    const method = utilizador ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(utilizador ? 'Utilizador atualizado com sucesso!' : 'Utilizador criado com sucesso!');
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Erro ao salvar utilizador');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar utilizador');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {utilizador ? 'Editar Utilizador' : 'Novo Utilizador'}
            </h2>
            <p className={styles.modalSubtitle}>
              {utilizador ? 'Edite as informações do utilizador' : 'Adicione um novo utilizador ao sistema'}
            </p>
          </div>
          <button onClick={onClose} className={styles.modalClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Nome */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiUser /> Nome Completo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                placeholder="Nome do utilizador"
              />
              {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiMail /> Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            </div>

            {/* Telefone */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiPhone /> Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={styles.formInput}
                placeholder="84 123 4567"
              />
            </div>

            {/* Perfil de Acesso - Cards com ícones */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiShield /> Perfil de Acesso <span className={styles.required}>*</span>
              </label>
              <div className={styles.roleGrid}>
                {perfis.map(perfil => (
                  <label
                    key={perfil.value}
                    className={`${styles.roleCard} ${formData.role === perfil.value ? styles.roleCardActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={perfil.value}
                      checked={formData.role === perfil.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className={styles.roleRadio}
                    />
                    <div className={styles.roleIcon}>{perfil.icon}</div>
                    <div className={styles.roleLabel}>{perfil.label}</div>
                    <div className={styles.roleDesc}>{perfil.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Senha (apenas para novo utilizador) */}
            {!utilizador && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiLock /> Senha Inicial <span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                  placeholder="********"
                />
                {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
                <p className={styles.fieldHint}>Mínimo 6 caracteres. O utilizador será solicitado a alterar no primeiro login.</p>
              </div>
            )}

            {/* Estado (apenas para edição) */}
            {utilizador && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Estado</label>
                <div className={styles.statusSwitch}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: true })}
                    className={`${styles.statusBtn} ${formData.is_active ? styles.statusBtnActive : ''}`}
                  >
                    Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: false })}
                    className={`${styles.statusBtn} ${!formData.is_active ? styles.statusBtnInactive : ''}`}
                  >
                    Inativo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.btnSave}>
              <FiSave size={18} />
              {loading ? 'Salvando...' : (utilizador ? 'Atualizar' : 'Criar Utilizador')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUtilizador;
