import React from 'react';
import Modal from '../../../../shared/components/ui/Modal';
import styles from './RoomDetailsModal.module.css';

const RoomDetailsModal = ({ room, isOpen, onClose }) => {
  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className={styles.container}>
        <h2>Quarto {room.number} - {room.typeLabel}</h2>
        
        <div className={styles.gallery}>
          <img src={room.images.main} alt="Principal" className={styles.mainImage} />
          <div className={styles.thumbnails}>
            {room.images.gallery.map((img, index) => (
              <img key={index} src={img} alt={`Foto ${index + 1}`} />
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <p>{room.description}</p>
          <p>Capacidade: {room.capacity} pessoas</p>
          <p>Tamanho: {room.size}m²</p>
          <p>Cama: {room.bedType}</p>
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;