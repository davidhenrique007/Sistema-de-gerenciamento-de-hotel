import React from 'react';
import styles from './Admin.module.css';

const Pagina = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>'@ + $page.Replace(".jsx","") + @"</h1>
      <p>Conteúdo em desenvolvimento</p>
    </div>
  );
};

export default Pagina;
