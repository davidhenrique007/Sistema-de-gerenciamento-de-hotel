// frontend/src/features/home/pages/admin/components/grafico/BotaoExportarGrafico.jsx
import React, { useState, useRef } from 'react';
import styles from './BotaoExportarGrafico.module.css';

const BotaoExportarGrafico = ({ chartRef, titulo, onExport }) => {
  const [exportando, setExportando] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const exportarComoPNG = async () => {
    if (!chartRef?.current) return;
    
    setExportando(true);
    
    try {
      const element = chartRef.current;
      const originalWidth = element.style.width;
      const originalHeight = element.style.height;
      
      element.style.width = '1200px';
      element.style.height = 'auto';
      
      const canvas = await import('html-to-image').then(module => 
        module.toPng(element, { quality: 0.95, pixelRatio: 2 })
      );
      
      element.style.width = originalWidth;
      element.style.height = originalHeight;
      
      const link = document.createElement('a');
      const dataAtual = new Date().toISOString().split('T')[0];
      link.download = `grafico-${titulo.toLowerCase().replace(/\s/g, '-')}-${dataAtual}.png`;
      link.href = canvas;
      link.click();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      if (onExport) onExport();
    } catch (error) {
      console.error('Erro ao exportar gráfico:', error);
      alert('Erro ao exportar imagem. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={exportarComoPNG}
        disabled={exportando}
        className={styles.exportBtn}
      >
        {exportando ? (
          <>
            <span className={styles.spinner}></span>
            Exportando...
          </>
        ) : (
          <>
            <span className={styles.icon}>📸</span>
            Exportar como PNG
          </>
        )}
      </button>
      
      {showSuccess && (
        <div className={styles.successToast}>
          ✅ Gráfico exportado com sucesso!
        </div>
      )}
    </div>
  );
};

export default BotaoExportarGrafico;