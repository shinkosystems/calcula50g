/* @sos-edit: false */
import React from 'react';
import type { HistoryEntry } from '../../types/calculator';
import './HistoryPanel.css';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelectEntry: (expression: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectEntry,
  onClearHistory
}) => {
  return (
    <div className="panel-container history-panel animate-fade-in">
      <div className="panel-header">
        <h3>Histórico</h3>
        {history.length > 0 && (
          <button className="panel-clear-btn" onClick={onClearHistory}>
            Limpar tudo
          </button>
        )}
      </div>

      <div className="panel-content">
        {history.length === 0 ? (
          <div className="panel-empty-state">
            <span className="empty-icon">⏳</span>
            <p>Nenhum cálculo recente</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="history-item"
                onClick={() => onSelectEntry(entry.expression)}
                title="Clique para carregar no display"
              >
                <div className="history-header">
                  <span className="history-time">{entry.timestamp}</span>
                </div>
                <div className="history-expr">{entry.expression}</div>
                <div className="history-res">= {entry.result}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
