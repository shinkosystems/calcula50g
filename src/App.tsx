// @sos-edit: false
import React, { useEffect } from 'react';
import { Shell } from './components/Layout/Shell';
import { Display } from './components/Display/Display';
import { Keypad } from './components/Keypad/Keypad';
import { HistoryPanel } from './components/History/HistoryPanel';
import { VariablesPanel } from './components/Variables/VariablesPanel';
import { GraphPanel } from './components/Graph/GraphPanel';
import { useCalculator } from './hooks/useCalculator';
import './styles/global.css';

const App: React.FC = () => {
  const {
    expression,
    result,
    memory,
    angleMode,
    setAngleMode,
    activePanel,
    setActivePanel,
    variables,
    setVariable,
    removeVariable,
    clearVariables,
    history,
    clearHistory,
    handleButtonClick,
    insertVariableIntoExpression,
    loadHistoryEntry,
    evaluate
  } = useCalculator();

  // Mapear eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar teclas se o usuário estiver digitando em um formulário (ex: inputs de variável/gráfico)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        handleButtonClick(key, 'number');
      } else if (key === '.') {
        handleButtonClick('.', 'number');
      } else if (key === '+') {
        handleButtonClick('+', 'operator');
      } else if (key === '-') {
        handleButtonClick('−', 'operator');
      } else if (key === '*') {
        handleButtonClick('×', 'operator');
      } else if (key === '/') {
        handleButtonClick('÷', 'operator');
      } else if (key === '%') {
        handleButtonClick('%', 'operator');
      } else if (key === '^') {
        handleButtonClick('xʸ', 'function');
      } else if (key === '(' || key === ')') {
        handleButtonClick(key, 'operator');
      } else if (key === 'Enter') {
        e.preventDefault();
        evaluate();
      } else if (key === 'Backspace') {
        handleButtonClick('DEL', 'action');
      } else if (key === 'Escape') {
        handleButtonClick('AC', 'action');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleButtonClick, evaluate]);

  // Escolhe qual painel lateral renderizar (Gráfico agora renderiza fora)
  const renderPanel = () => {
    switch (activePanel) {
      case 'history':
        return (
          <HistoryPanel
            history={history}
            onSelectEntry={loadHistoryEntry}
            onClearHistory={clearHistory}
          />
        );
      case 'variables':
        return (
          <VariablesPanel
            variables={variables}
            onSetVariable={setVariable}
            onRemoveVariable={removeVariable}
            onSelectVariable={insertVariableIntoExpression}
            onClearVariables={clearVariables}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Shell
        activePanel={activePanel === 'graph' ? null : activePanel}
        setActivePanel={setActivePanel}
        angleMode={angleMode}
        setAngleMode={setAngleMode}
        panelContent={renderPanel()}
      >
        <Display
          expression={expression}
          result={result}
          angleMode={angleMode}
          hasMemory={memory !== 0}
        />
        <Keypad onButtonClick={handleButtonClick} />
      </Shell>

      {/* Modal de Gráficos em Tela Inteira */}
      {activePanel === 'graph' && (
        <div className="graph-fullscreen-overlay animate-fade-in">
          <div className="graph-fullscreen-container animate-scale-in">
            <GraphPanel 
              initialExpression={expression} 
              onClose={() => setActivePanel(null)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
