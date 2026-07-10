/* @sos-edit: false */
import React, { useState, useEffect, useRef } from 'react';
import functionPlotModule from 'function-plot';
import './GraphPanel.css';

interface GraphPanelProps {
  initialExpression?: string;
  onClose?: () => void;
}

export const GraphPanel: React.FC<GraphPanelProps> = ({ initialExpression = '', onClose }) => {
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
      // Altura dinâmica baseada na tela do usuário para aproveitar o espaço do modal de tela inteira
      const height = Math.min(550, Math.max(300, window.innerHeight - 350));

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

      // Adicionar setas nas pontas dos eixos e formatar linhas principais
      const svg = targetRef.current.querySelector('svg');
      if (svg) {
        let defs = svg.querySelector('defs');
        if (!defs) {
          defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          svg.insertBefore(defs, svg.firstChild);
        }

        const markerId = 'arrow-marker';
        if (!defs.querySelector(`#${markerId}`)) {
          const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
          marker.setAttribute('id', markerId);
          marker.setAttribute('viewBox', '0 0 10 10');
          marker.setAttribute('refX', '5');
          marker.setAttribute('refY', '5');
          marker.setAttribute('markerWidth', '6');
          marker.setAttribute('markerHeight', '6');
          marker.setAttribute('orient', 'auto-start-reverse');

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
          path.setAttribute('fill', 'currentColor');
          
          marker.appendChild(path);
          defs.appendChild(marker);
        }

        // Seta no final do Eixo X (direita)
        const xAxisDomain = svg.querySelector('.x.axis .domain');
        if (xAxisDomain) {
          xAxisDomain.setAttribute('marker-end', `url(#${markerId})`);
        }

        // Seta no início do Eixo Y (para cima)
        const yAxisDomain = svg.querySelector('.y.axis .domain');
        if (yAxisDomain) {
          yAxisDomain.setAttribute('marker-start', `url(#${markerId})`);
        }
      }
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
        {onClose && (
          <button className="graph-close-btn" onClick={onClose} title="Fechar Painel">
            Fechar ✕
          </button>
        )}
      </div>

      <div className="panel-content">
        <div className="graph-controls-column">
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

        <div className="graph-plot-column">
          <div className="plot-container-wrapper">
            <div id="plot" ref={targetRef} className="plot-canvas"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
