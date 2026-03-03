import React from 'react';
import './home.css';

/**
 * HomePage - Página principal do Hotel Paradise
 * 
 * Estrutura inicial com placeholders:
 * - Header (será substituído pelo componente Header)
 * - Hero (banner principal)
 * - RoomsSection (seção de quartos)
 * - ReservationForm (formulário de reserva)
 * - ServicesSection (serviços adicionais)
 * - Footer (rodapé)
 * 
 * Esta estrutura será preenchida nos próximos dias.
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Header Placeholder */}
      <header className="home-page__header-placeholder">
        <div className="container">
          <h1>Hotel Paradise</h1>
          <nav>
            <ul>
              <li><a href="/">Início</a></li>
              <li><a href="#rooms">Quartos</a></li>
              <li><a href="#services">Serviços</a></li>
              <li><a href="#contact">Contato</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="home-page__main">
        {/* Hero Placeholder */}
        <section className="home-page__hero-placeholder">
          <div className="container">
            <h2>Bem-vindo ao Hotel Paradise</h2>
            <p>O paraíso perfeito para suas férias dos sonhos</p>
          </div>
        </section>

        {/* Rooms Section Placeholder */}
        <section id="rooms" className="home-page__section">
          <div className="container">
            <h2 className="section-title">Nossos Quartos</h2>
            <p className="section-subtitle">
              Escolha o quarto perfeito para sua estadia
            </p>
            <div className="home-page__placeholder-card">
              <p>Em breve: lista de quartos disponíveis</p>
            </div>
          </div>
        </section>

        {/* Reservation Form Placeholder */}
        <section id="reservation" className="home-page__section home-page__section--highlight">
          <div className="container">
            <h2 className="section-title">Faça sua Reserva</h2>
            <div className="home-page__placeholder-form">
              <p>Em breve: formulário de reserva</p>
            </div>
          </div>
        </section>

        {/* Services Section Placeholder */}
        <section id="services" className="home-page__section">
          <div className="container">
            <h2 className="section-title">Serviços Adicionais</h2>
            <p className="section-subtitle">
              Personalize sua estadia com nossos serviços exclusivos
            </p>
            <div className="home-page__placeholder-grid">
              <p>Em breve: lista de serviços</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Placeholder */}
      <footer className="home-page__footer-placeholder">
        <div className="container">
          <p>&copy; 2025 Hotel Paradise. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;