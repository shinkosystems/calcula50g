// @sos-edit: false
import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../types/calculator';

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  const addEntry = (expression: string, result: string) => {
    if (!expression || !result || result === 'Erro') return;

    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      expression,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => {
      // Filtrar para evitar duplicadas consecutivas idênticas
      if (prev.length > 0 && prev[0].expression === expression) {
        return prev;
      }
      // Limitar a no máximo 50 itens
      return [newEntry, ...prev.slice(0, 49)];
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addEntry,
    clearHistory
  };
};
