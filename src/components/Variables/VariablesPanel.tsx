/* @sos-edit: false */
import React, { useState } from 'react';
import './VariablesPanel.css';

interface VariablesPanelProps {
  variables: Record<string, string>;
  onSetVariable: (name: string, value: string) => boolean;
  onRemoveVariable: (name: string) => void;
  onSelectVariable: (name: string) => void;
  onClearVariables: () => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  onSetVariable,
  onRemoveVariable,
  onSelectVariable,
  onClearVariables
}) => {
  const [varName, setVarName] = useState('');
  const [varValue, setVarValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = varName.trim();
    const trimmedValue = varValue.trim();

    if (!trimmedName || !trimmedValue) {
      setErrorMsg('Preencha todos os campos');
      return;
    }

    // Regra: nome de variável deve ser apenas letras, sem números ou caracteres especiais
    if (!/^[a-zA-Z]+$/.test(trimmedName)) {
      setErrorMsg('O nome deve conter apenas letras (A-Z)');
      return;
    }

    // Evitar nome de funções nativas
    const reservedWords = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'cbrt', 'pi', 'e', 'ANS'];
    if (reservedWords.includes(trimmedName.toLowerCase())) {
      setErrorMsg('Nome reservado pela calculadora');
      return;
    }

    const success = onSetVariable(trimmedName, trimmedValue);
    if (success) {
      setVarName('');
      setVarValue('');
    } else {
      setErrorMsg('Erro ao salvar variável');
    }
  };

  const varList = Object.entries(variables);

  return (
    <div className="panel-container variables-panel animate-fade-in">
      <div className="panel-header">
        <h3>Variáveis</h3>
        {varList.length > 0 && (
          <button className="panel-clear-btn" onClick={onClearVariables}>
            Limpar tudo
          </button>
        )}
      </div>

      <div className="panel-content">
        <form className="var-form" onSubmit={handleSubmit}>
          <div className="form-inputs">
            <input
              type="text"
              placeholder="Nome (ex: x)"
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
              maxLength={8}
            />
            <input
              type="text"
              placeholder="Valor (ex: 5.4)"
              value={varValue}
              onChange={(e) => setVarValue(e.target.value)}
            />
          </div>
          <button type="submit" className="var-submit-btn">
            Salvar
          </button>
        </form>

        {errorMsg && <div className="var-error-msg">{errorMsg}</div>}

        <div className="var-section-title">Minhas Variáveis</div>

        {varList.length === 0 ? (
          <div className="panel-empty-state">
            <span className="empty-icon">🏷️</span>
            <p>Nenhuma variável criada</p>
            <span className="empty-hint">Defina acima para usar em expressões (ex: x + 2)</span>
          </div>
        ) : (
          <div className="variables-list">
            {varList.map(([name, value]) => (
              <div key={name} className="var-item">
                <div 
                  className="var-info" 
                  onClick={() => onSelectVariable(name)}
                  title="Clique para inserir na calculadora"
                >
                  <span className="var-name">{name}</span>
                  <span className="var-value" title={value}>{value}</span>
                </div>
                <button
                  className="var-delete-btn"
                  onClick={() => onRemoveVariable(name)}
                  title="Remover variável"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
