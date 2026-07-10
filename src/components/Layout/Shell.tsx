/* @sos-edit: false */
import React, { useState, useEffect } from 'react';
import type { PanelType, AngleMode } from '../../types/calculator';
import './Shell.css';

interface ShellProps {
  children: React.ReactNode;
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  angleMode: AngleMode;
  setAngleMode: (mode: AngleMode) => void;
  panelContent: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  activePanel,
  setActivePanel,
  angleMode,
  setAngleMode,
  panelContent
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('calc_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handlePanelToggle = (panel: PanelType) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <div className="calc-shell">
      <header className="shell-header">
        <div className="header-brand">
          <span className="brand-icon">🧮</span>
          <h2>SŌS Calc</h2>
        </div>

        <div className="header-actions">
          {/* Alternador DEG/RAD */}
          <button
            className={`action-btn angle-toggle ${angleMode}`}
            onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
            title={`Alternar modo de ângulo (Atual: ${angleMode})`}
          >
            {angleMode}
          </button>

          {/* Abas dos Painéis Laterais */}
          <button
            className={`action-btn panel-tab ${activePanel === 'history' ? 'active' : ''}`}
            onClick={() => handlePanelToggle('history')}
            title="Histórico"
          >
            ⏳
          </button>
          <button
            className={`action-btn panel-tab ${activePanel === 'variables' ? 'active' : ''}`}
            onClick={() => handlePanelToggle('variables')}
            title="Variáveis"
          >
            🏷️
          </button>
          <button
            className={`action-btn panel-tab ${activePanel === 'graph' ? 'active' : ''}`}
            onClick={() => handlePanelToggle('graph')}
            title="Gráfico"
          >
            📈
          </button>

          {/* Alternador de Tema */}
          <button
            className="action-btn theme-toggle"
            onClick={toggleTheme}
            title="Alternar Tema"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="shell-body">
        <div className="calculator-area">
          {children}
        </div>
        
        {activePanel && (
          <div className="sidebar-area animate-slide-right">
            <div className="sidebar-close-overlay" onClick={() => setActivePanel(null)} />
            <div className="sidebar-content-wrapper">
              <button className="sidebar-mobile-close" onClick={() => setActivePanel(null)}>
                Fechar ✕
              </button>
              {panelContent}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
