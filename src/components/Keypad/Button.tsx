/* @sos-edit: false */
import React from 'react';
import type { ButtonType } from '../../types/calculator';
import './Button.css';

interface ButtonProps {
  label: string;
  type: ButtonType;
  onClick: (label: string, type: ButtonType) => void;
}

export const Button: React.FC<ButtonProps> = ({ label, type, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Adiciona feedback háptico sutil se disponível (em dispositivos móveis)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch (err) {
        // Ignorar falhas de vibração se bloqueado pelo browser
      }
    }

    // Criar efeito ripple (ondas)
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('btn-ripple');

    // Remover qualquer ripple anterior antes de adicionar um novo
    const ripple = button.getElementsByClassName('btn-ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    onClick(label, type);
  };

  return (
    <button
      className={`calc-btn btn-${type}`}
      onClick={handleClick}
    >
      <span className="btn-text">{label}</span>
    </button>
  );
};
