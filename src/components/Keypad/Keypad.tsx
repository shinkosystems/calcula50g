/* @sos-edit: false */
import React from 'react';
import { Button } from './Button';
import type { ButtonType } from '../../types/calculator';
import './Keypad.css';

interface KeypadProps {
  onButtonClick: (label: string, type: ButtonType) => void;
}

interface ButtonConfig {
  label: string;
  type: ButtonType;
}

export const Keypad: React.FC<KeypadProps> = ({ onButtonClick }) => {
  const buttons: ButtonConfig[] = [
    // Linha 1 - Memória
    { label: 'MC', type: 'memory' },
    { label: 'MR', type: 'memory' },
    { label: 'M+', type: 'memory' },
    { label: 'M-', type: 'memory' },
    { label: 'MS', type: 'memory' },

    // Linha 2 - Trig / Log básicas
    { label: 'sin', type: 'function' },
    { label: 'cos', type: 'function' },
    { label: 'tan', type: 'function' },
    { label: 'log', type: 'function' },
    { label: 'ln', type: 'function' },

    // Linha 3 - Trig Inversas / Raízes
    { label: 'sin⁻¹', type: 'function' },
    { label: 'cos⁻¹', type: 'function' },
    { label: 'tan⁻¹', type: 'function' },
    { label: '√', type: 'function' },
    { label: '∛', type: 'function' },

    // Linha 4 - Constantes / Parenteses
    { label: 'π', type: 'function' },
    { label: 'e', type: 'function' },
    { label: '(', type: 'operator' },
    { label: ')', type: 'operator' },
    { label: '%', type: 'operator' },

    // Linha 5 - Potências / Exponencial
    { label: 'xʸ', type: 'function' },
    { label: 'x²', type: 'function' },
    { label: 'x³', type: 'function' },
    { label: '10ˣ', type: 'function' },
    { label: 'eˣ', type: 'function' },

    // Numpad e operadores básicos
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: 'DEL', type: 'action' },
    { label: 'AC', type: 'action' },

    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '×', type: 'operator' },
    { label: '÷', type: 'operator' },

    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator' },
    { label: '−', type: 'operator' },

    { label: '±', type: 'action' },
    { label: '0', type: 'number' },
    { label: '.', type: 'number' },
    { label: 'ANS', type: 'action' },
    { label: '=', type: 'equals' }
  ];

  return (
    <div className="calc-keypad">
      {buttons.map((btn, index) => (
        <Button
          key={`${btn.label}-${index}`}
          label={btn.label}
          type={btn.type}
          onClick={onButtonClick}
        />
      ))}
    </div>
  );
};
