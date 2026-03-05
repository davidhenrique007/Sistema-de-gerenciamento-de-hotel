import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/ui/Modal';
import styles from './RoomDetailsModal.module.css';

const RoomDetailsModal = ({ room, isOpen, onClose }) => {
  // ==========================================================================
  // HOOKS - TODOS CHAMADOS INCONDICIONALMENTE (MESMO COM room null)
  // ==========================================================================
  const [currentImage, setCurrentImage] = useState(null);

  // useEffect para atualizar a imagem quando o room mudar
  useEffect(() => {
    if (room) {
      setCurrentImage(room.images.main);
    }
  }, [room]);

  // ==========================================================================
  // SE NÃO TEM QUARTO, NÃO RENDERIZA (mas hooks já foram chamados)
  // ==========================================================================
  if (!room) return null;

  const handleThumbnailClick = (imgSrc) => {
    setCurrentImage(imgSrc);
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: room.price.currency,
    minimumFractionDigits: 0,
  }).format(room.price.amount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className={styles.container}>
        {/* Cabeçalho com título e botão fechar */}
        <div className={styles.header}>
          <h2>Quarto {room.number} - {room.typeLabel}</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        {/* Galeria de imagens */}
        <div className={styles.gallery}>
          <img 
            src={currentImage || room.images.main} 
            alt="Quarto" 
            className={styles.mainImage} 
          />
          
          <div className={styles.thumbnails}>
            <img 
              src={room.images.main} 
              alt="Principal"
              className={`${styles.thumbnail} ${currentImage === room.images.main ? styles.activeThumbnail : ''}`}
              onClick={() => handleThumbnailClick(room.images.main)}
            />
            
            {room.images.gallery.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Foto ${index + 1}`}
                className={`${styles.thumbnail} ${currentImage === img ? styles.activeThumbnail : ''}`}
                onClick={() => handleThumbnailClick(img)}
              />
            ))}
          </div>
        </div>

        {/* Informações do quarto */}
        <div className={styles.info}>
          <p className={styles.description}>{room.description}</p>
          
          <div className={styles.details}>
            <p>👥 Capacidade: {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}</p>
            <p>📏 Tamanho: {room.size}m²</p>
            <p>🛏️ Cama: {room.bedType}</p>
          </div>
          
          <div className={styles.amenities}>
            <h4>Comodidades</h4>
            <div className={styles.amenitiesGrid}>
              {room.amenities.map((item, idx) => (
                <span key={idx} className={styles.amenity}>✓ {item}</span>
              ))}
            </div>
          </div>

          <div className={styles.price}>
            <span>Preço por noite:</span>
            <strong>{formattedPrice}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;