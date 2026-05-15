import React, { useState, useEffect } from 'react';
import styles from './FormQuarto.module.css';

const tiposQuarto = [
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suíte' },
  { value: 'family', label: 'Família' }
];

const statusLista = [
  { value: 'available', label: 'Disponível' },
  { value: 'occupied', label: 'Ocupado' },
  { value: 'maintenance', label: 'Manutenção' }
];

const amenitiesOptions = [
  { id: 'wifi', label: 'Wi-Fi Grátis', icon: '📶' },
  { id: 'tv', label: 'TV LCD', icon: '📺' },
  { id: 'ar', label: 'Ar Condicionado', icon: '❄️' },
  { id: 'frigobar', label: 'Frigobar', icon: '🍺' },
  { id: 'cofre', label: 'Cofre', icon: '🔒' },
  { id: 'cafe', label: 'Cafeteira', icon: '☕' },
  { id: 'secador', label: 'Secador', icon: '💨' },
  { id: 'frigideira', label: 'Frigideira', icon: '🍳' }
];

const FormQuarto = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    room_number: '',
    type: 'standard',
    floor: '',
    price_per_night: '',
    capacity: 2,
    description: '',
    amenities: [],
    status: 'available'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        room_number: initialData.room_number || '',
        type: initialData.type || 'standard',
        floor: initialData.floor || '',
        price_per_night: initialData.price_per_night || '',
        capacity: initialData.capacity || 2,
        description: initialData.description || '',
        amenities: initialData.amenities || [],
        status: initialData.status || 'available'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.room_number) newErrors.room_number = 'Número do quarto é obrigatório';
    if (!formData.floor) newErrors.floor = 'Andar é obrigatório';
    if (!formData.price_per_night) newErrors.price_per_night = 'Preço é obrigatório';
    if (formData.price_per_night <= 0) newErrors.price_per_night = 'Preço deve ser maior que zero';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Enviar como JSON, não FormData
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Número do Quarto *</label>
          <input
            type="text"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            className={`${styles.input} ${errors.room_number ? styles.inputError : ''}`}
            placeholder="Ex: 101"
          />
          {errors.room_number && <span className={styles.errorText}>{errors.room_number}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tipo *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={styles.select}
          >
            {tiposQuarto.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Andar *</label>
          <input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className={`${styles.input} ${errors.floor ? styles.inputError : ''}`}
            placeholder="Ex: 1"
          />
          {errors.floor && <span className={styles.errorText}>{errors.floor}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Preço por Noite (MTn) *</label>
          <input
            type="number"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            className={`${styles.input} ${errors.price_per_night ? styles.inputError : ''}`}
            placeholder="Ex: 3500"
          />
          {errors.price_per_night && <span className={styles.errorText}>{errors.price_per_night}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Capacidade (pessoas)</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className={styles.input}
            min="1"
            max="10"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            {statusLista.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          rows="3"
          placeholder="Descreva as características do quarto..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Comodidades</label>
        <div className={styles.amenitiesGrid}>
          {amenitiesOptions.map(amenity => (
            <button
              key={amenity.id}
              type="button"
              onClick={() => handleAmenityToggle(amenity.id)}
              className={`${styles.amenityBtn} ${formData.amenities.includes(amenity.id) ? styles.amenityActive : ''}`}
            >
              <span className={styles.amenityIcon}>{amenity.icon}</span>
              <span>{amenity.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar Quarto' : 'Criar Quarto')}
        </button>
      </div>
    </form>
  );
};

export default FormQuarto;
