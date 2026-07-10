// @sos-edit: false
import { useState, useEffect } from 'react';
import type { ButtonType, AngleMode, PanelType } from '../types/calculator';
import { useVariables } from './useVariables';
import { useHistory } from './useHistory';
import { evaluateExpression } from '../lib/mathEngine';

export const useCalculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [lastSuccessResult, setLastSuccessResult] = useState('0');
  const [memory, setMemory] = useState<number>(() => {
    const saved = localStorage.getItem('calc_memory');
    return saved ? Number(saved) : 0;
  });
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    const saved = localStorage.getItem('calc_angle_mode');
    return (saved as AngleMode) || 'RAD';
  });
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);

  const { variables, setVariable, removeVariable, clearVariables } = useVariables();
  const { history, addEntry, clearHistory } = useHistory();

  useEffect(() => {
    localStorage.setItem('calc_memory', memory.toString());
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('calc_angle_mode', angleMode);
  }, [angleMode]);

  const handleButtonClick = (label: string, type: ButtonType) => {
    if (type === 'number') {
      if (isEvaluated) {
        setExpression(label);
        setIsEvaluated(false);
      } else {
        setExpression(prev => prev + label);
      }
    } else if (type === 'operator') {
      setIsEvaluated(false);
      // Se tiver um resultado anterior e a expressão estiver vazia, encadeia a partir dele
      if (!expression && lastSuccessResult !== '0') {
        setExpression('ANS' + label);
      } else {
        setExpression(prev => prev + label);
      }
    } else if (type === 'function') {
      if (isEvaluated) {
        setExpression(getFunctionSnippet(label));
        setIsEvaluated(false);
      } else {
        setExpression(prev => prev + getFunctionSnippet(label));
      }
    } else if (type === 'memory') {
      handleMemoryAction(label);
    } else if (type === 'action') {
      handleActionClick(label);
    } else if (type === 'equals') {
      evaluate();
    }
  };

  const getFunctionSnippet = (func: string): string => {
    switch (func) {
      case 'sin': return 'sin(';
      case 'cos': return 'cos(';
      case 'tan': return 'tan(';
      case 'sin⁻¹': return 'asin(';
      case 'cos⁻¹': return 'acos(';
      case 'tan⁻¹': return 'atan(';
      case 'log': return 'log10('; // Mapear para base 10
      case 'ln': return 'log(';      // Mapear para log natural no mathjs
      case '√': return '√(';
      case '∛': return '∛(';
      case 'x²': return '^2';
      case 'x³': return '^3';
      case 'xʸ': return '^';
      case 'eˣ': return 'e^';
      case '10ˣ': return '10^';
      default: return func;
    }
  };

  const handleMemoryAction = (action: string) => {
    const currentNumValue = Number(result) || Number(lastSuccessResult) || 0;

    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setExpression(prev => prev + memory.toString());
        setIsEvaluated(false);
        break;
      case 'M+':
        setMemory(prev => prev + currentNumValue);
        break;
      case 'M-':
        setMemory(prev => prev - currentNumValue);
        break;
      case 'MS':
        setMemory(currentNumValue);
        break;
      default:
        break;
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'AC':
        setExpression('');
        setResult('');
        setIsEvaluated(false);
        break;
      case 'DEL':
        setIsEvaluated(false);
        setExpression(prev => {
          if (prev.length === 0) return '';
          
          // Se for deletar funções completas escritas como sin(, cos(, etc., ou de 1 em 1 caractere
          // Vamos deletar apenas o último caractere para o comportamento padrão do cursor
          return prev.slice(0, -1);
        });
        break;
      case 'ANS':
        if (isEvaluated) {
          setExpression('ANS');
          setIsEvaluated(false);
        } else {
          setExpression(prev => prev + 'ANS');
        }
        break;
      case '±':
        if (expression) {
          // Se for expressão inteira avaliada, inverte o sinal do resultado
          if (isEvaluated) {
            const inverted = (Number(result) * -1).toString();
            setExpression(inverted);
            setResult(inverted);
            setIsEvaluated(false);
          } else {
            // Caso contrário, insere um sinal de menos na expressão
            setExpression(prev => {
              if (prev.startsWith('-')) {
                return prev.slice(1);
              }
              return '-' + prev;
            });
          }
        }
        break;
      default:
        break;
    }
  };

  const evaluate = () => {
    if (!expression) return;

    // Criamos um escopo temporário que inclui as variáveis do usuário E o valor de ANS
    const scopeWithAns = {
      ...variables,
      ANS: lastSuccessResult
    };

    const evaluatedResult = evaluateExpression(expression, scopeWithAns, angleMode);
    
    setResult(evaluatedResult);
    setIsEvaluated(true);

    if (evaluatedResult !== 'Erro' && evaluatedResult !== '') {
      setLastSuccessResult(evaluatedResult);
      addEntry(expression, evaluatedResult);
    }
  };

  const insertVariableIntoExpression = (varName: string) => {
    if (isEvaluated) {
      setExpression(varName);
      setIsEvaluated(false);
    } else {
      setExpression(prev => prev + varName);
    }
  };

  const loadHistoryEntry = (expr: string) => {
    setExpression(expr);
    setResult('');
    setIsEvaluated(false);
  };

  return {
    expression,
    setExpression,
    result,
    setResult,
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
  };
};
