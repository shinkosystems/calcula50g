// @sos-edit: false
import { useState, useEffect } from 'react';

export const useVariables = () => {
  const [variables, setVariables] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('calc_variables');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('calc_variables', JSON.stringify(variables));
  }, [variables]);

  const setVariable = (name: string, value: string) => {
    // Validar nome da variável: apenas letras, sem espaços
    const cleanName = name.trim().replace(/[^a-zA-Z]/g, '');
    if (!cleanName) return false;

    setVariables(prev => ({
      ...prev,
      [cleanName]: value.trim()
    }));
    return true;
  };

  const removeVariable = (name: string) => {
    setVariables(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const clearVariables = () => {
    setVariables({});
  };

  return {
    variables,
    setVariable,
    removeVariable,
    clearVariables
  };
};
