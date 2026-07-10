/* @sos-edit: false */
import React, { useState, useEffect, useRef } from 'react';
import functionPlotModule from 'function-plot';
import './GraphPanel.css';

interface GraphPanelProps {
  initialExpression?: string;
}

export const GraphPanel: React.FC<GraphPanelProps> = ({ initialExpression = '' }) => {
  const [fnInput, setFnInput] = useState('x^2');
  const [activeFn, setActiveFn] = useState('x^2');
  const [error, setError] = useState('');
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tenta limpar a expressão inicial se fornecida
    if (initialExpression) {
      // Se a expressão contém x, assume que é uma função de x
      const cleanExpr = initialExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e');
      
      if (cleanExpr.includes('x')) {
        setFnInput(cleanExpr);
        setActiveFn(cleanExpr);
      }
    }
  }, [initialExpression]);

  const drawPlot = () => {
    if (!targetRef.current) return;
    setError('');

    try {
      // Limpar conteúdo anterior antes de plotar para evitar bugs do SVG
      targetRef.current.innerHTML = '';

      const width = targetRef.current.clientWidth || 300;
      const height = 300;

      // Traduzir multiplicação implícita ou caracteres que function-plot pode reclamar
      // ex: 2x -> 2*x
      const mathExpr = activeFn
        .replace(/(\d)(x)/g, '$1*$2')
        .replace(/sin\(/g, 'sin(')
        .replace(/cos\(/g, 'cos(')
        .replace(/tan\(/g, 'tan(');

      // Resolução segura de importação (CJS / ESM interop)
      const plotFn = typeof functionPlotModule === 'function'
        ? functionPlotModule
        : (functionPlotModule as any).default;

      if (typeof plotFn !== 'function') {
        throw new Error('A biblioteca de plotagem de gráficos não pôde ser iniciada como uma função.');
      }

      plotFn({
        target: targetRef.current,
        width,
        height,
        grid: true,
        xAxis: { domain: [-6, 6] },
        yAxis: { domain: [-6, 6] },
        disableZoom: false,
        data: [
          {
            fn: mathExpr,
            color: '#06b6d4', // Cyan neon
            graphType: 'polyline'
          }
        ]
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Expressão inválida para gráfico de f(x)');
    }
  };

  useEffect(() => {
    drawPlot();
    
    // Observer para redimensionar gráfico
    const handleResize = () => {
      drawPlot();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeFn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fnInput.trim()) {
      setActiveFn(fnInput.trim());
    }
  };

  return (
    <div className="panel-container graph-panel animate-fade-in">
      <div className="panel-header">
        <h3>Plotagem de Gráficos</h3>
      </div>

      <div className="panel-content">
        <form className="graph-form" onSubmit={handleSubmit}>
          <div className="graph-input-group">
            <span className="fn-label">f(x) =</span>
            <input
              type="text"
              value={fnInput}
              onChange={(e) => setFnInput(e.target.value)}
              placeholder="ex: x^2 - 4"
            />
          </div>
          <button type="submit" className="graph-plot-btn">
            Plotar
          </button>
        </form>

        {error && <div className="graph-error-msg">{error}</div>}

        <div className="plot-container-wrapper">
          <div id="plot" ref={targetRef} className="plot-canvas"></div>
        </div>

        <div className="graph-tips">
          <h4>💡 Dicas de Formato:</h4>
          <ul>
            <li>Use <strong>x</strong> como a variável independente</li>
            <li>Potência: <code>x^2</code></li>
            <li>Multiplicação: <code>2*x</code> ou <code>2x</code></li>
            <li>Funções: <code>sin(x)</code>, <code>cos(x)</code>, <code>log(x)</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
