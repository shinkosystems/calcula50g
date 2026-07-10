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

      const chartInstance = plotFn({
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

      // ---- Pós-processamento SVG para destacar eixos cartesianos ----
      const svg = targetRef.current.querySelector('svg');
      if (!svg || !chartInstance) return;

      // Obter o grupo de conteúdo (canvas interno do SVG) e margens do chart
      const meta = (chartInstance as any).meta;
      const margin = meta?.margin ?? { left: 40, top: 20, right: 20, bottom: 30 };
      const xScale = meta?.xScale;
      const yScale = meta?.yScale;

      // Calcular posições em pixel de x=0 e y=0
      const zeroX = xScale ? xScale(0) : null;
      const zeroY = yScale ? yScale(0) : null;

      // Dimensões internas do canvas de plotagem
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Detectar tema escuro
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const axisColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.88)';
      const labelColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)';

      // Criar/atualizar o grupo de overlays dentro do canvas de conteúdo
      const contentGroup = svg.querySelector('.function-plot-canvas');
      if (contentGroup && zeroX !== null && zeroY !== null) {
        // Remover overlays anteriores para evitar duplicatas em redimensionamento
        contentGroup.querySelectorAll('.cartesian-overlay').forEach(el => el.remove());

        const ns = 'http://www.w3.org/2000/svg';

        // --- Definições de setas ---
        let defs = svg.querySelector('defs');
        if (!defs) {
          defs = document.createElementNS(ns, 'defs');
          svg.insertBefore(defs, svg.firstChild);
        }
        // Remover marcadores anteriores para redesenhar com cor correta
        ['arrow-x', 'arrow-y'].forEach(id => {
          const prev = defs!.querySelector(`#${id}`);
          if (prev) prev.remove();
        });

        const makeArrow = (id: string) => {
          const marker = document.createElementNS(ns, 'marker');
          marker.setAttribute('id', id);
          marker.setAttribute('viewBox', '0 0 10 10');
          marker.setAttribute('refX', '8');
          marker.setAttribute('refY', '5');
          marker.setAttribute('markerWidth', '8');
          marker.setAttribute('markerHeight', '8');
          marker.setAttribute('orient', 'auto-start-reverse');
          const path = document.createElementNS(ns, 'path');
          path.setAttribute('d', 'M 0 1 L 9 5 L 0 9 z');
          path.setAttribute('fill', axisColor);
          marker.appendChild(path);
          defs!.appendChild(marker);
          return marker;
        };
        makeArrow('arrow-x');
        makeArrow('arrow-y');

        const overlayGroup = document.createElementNS(ns, 'g');
        overlayGroup.setAttribute('class', 'cartesian-overlay');

        // --- Linha do Eixo X (horizontal passando por y=0) ---
        const lineX = document.createElementNS(ns, 'line');
        lineX.setAttribute('x1', '0');
        lineX.setAttribute('y1', String(zeroY));
        lineX.setAttribute('x2', String(innerWidth));
        lineX.setAttribute('y2', String(zeroY));
        lineX.setAttribute('stroke', axisColor);
        lineX.setAttribute('stroke-width', '2');
        lineX.setAttribute('marker-end', 'url(#arrow-x)');
        overlayGroup.appendChild(lineX);

        // --- Linha do Eixo Y (vertical passando por x=0) ---
        const lineY = document.createElementNS(ns, 'line');
        lineY.setAttribute('x1', String(zeroX));
        lineY.setAttribute('y1', String(innerHeight));
        lineY.setAttribute('x2', String(zeroX));
        lineY.setAttribute('y2', '0');
        lineY.setAttribute('stroke', axisColor);
        lineY.setAttribute('stroke-width', '2');
        lineY.setAttribute('marker-end', 'url(#arrow-y)');
        overlayGroup.appendChild(lineY);

        // --- Ponto de origem (0, 0) ---
        const originDot = document.createElementNS(ns, 'circle');
        originDot.setAttribute('cx', String(zeroX));
        originDot.setAttribute('cy', String(zeroY));
        originDot.setAttribute('r', '4');
        originDot.setAttribute('fill', axisColor);
        overlayGroup.appendChild(originDot);

        // --- Labels "X" e "Y" nas pontas dos eixos ---
        const labelX = document.createElementNS(ns, 'text');
        labelX.setAttribute('x', String(innerWidth + 14));
        labelX.setAttribute('y', String(zeroY + 4));
        labelX.setAttribute('fill', labelColor);
        labelX.setAttribute('font-size', '13');
        labelX.setAttribute('font-weight', '700');
        labelX.setAttribute('font-family', "'JetBrains Mono', monospace");
        labelX.textContent = 'x';
        overlayGroup.appendChild(labelX);

        const labelY = document.createElementNS(ns, 'text');
        labelY.setAttribute('x', String(zeroX - 10));
        labelY.setAttribute('y', '-6');
        labelY.setAttribute('fill', labelColor);
        labelY.setAttribute('font-size', '13');
        labelY.setAttribute('font-weight', '700');
        labelY.setAttribute('font-family', "'JetBrains Mono', monospace");
        labelY.textContent = 'y';
        overlayGroup.appendChild(labelY);

        contentGroup.appendChild(overlayGroup);
      }

      // --- Estilizar labels dos ticks ---
      svg.querySelectorAll('.axis text').forEach(el => {
        (el as SVGTextElement).style.fill = labelColor;
        (el as SVGTextElement).style.fontSize = '11px';
        (el as SVGTextElement).style.fontFamily = "'JetBrains Mono', monospace";
        (el as SVGTextElement).style.fontWeight = '500';
      });

      // --- Suavizar grid lines e eixos de borda ---
      svg.querySelectorAll('.grid line').forEach(el => {
        (el as SVGLineElement).style.stroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      });
      svg.querySelectorAll('.axis path.domain').forEach(el => {
        (el as SVGPathElement).style.display = 'none'; // Esconde domínio da borda — substituído pelos overlays
      });
      svg.querySelectorAll('.axis .tick line').forEach(el => {
        (el as SVGLineElement).style.stroke = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
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
