import React from 'react';
import './Navigation.css';

const Navigation = ({ activeModule, onModuleChange }) => {
  return (
    <nav className="navigation">
      <button
        className={`nav-button ${activeModule === 'budget' ? 'active' : ''}`}
        onClick={() => onModuleChange('budget')}
      >
        <span className="nav-icon">💰</span>
        <span className="nav-text">Presupuesto</span>
      </button>
      
      <button
        className={`nav-button ${activeModule === 'investment' ? 'active' : ''}`}
        onClick={() => onModuleChange('investment')}
      >
        <span className="nav-icon">📈</span>
        <span className="nav-text">Inversiones</span>
      </button>
    </nav>
  );
};

export default Navigation;
