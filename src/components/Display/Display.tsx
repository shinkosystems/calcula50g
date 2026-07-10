/* @sos-edit: false */
import React from 'react';
import './Display.css';

interface DisplayProps {
  expression: string;
  result: string;
  angleMode: 'DEG' | 'RAD';
  hasMemory: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  angleMode,
  hasMemory
}) => {
  return (
    <div className="calc-display">
      <div className="display-status">
        <span className={`status-badge ${angleMode === 'DEG' ? 'active-deg' : 'active-rad'}`}>
          {angleMode}
        </span>
        {hasMemory && (
          <span className="status-badge active-m">
            M
          </span>
        )}
      </div>
      <div className="display-expression-container">
        <div className="display-expression" title={expression}>
          {expression || '0'}
        </div>
      </div>
      <div className="display-result-container">
        <div className={`display-result ${result ? 'has-result' : ''}`}>
          {result || '0'}
        </div>
      </div>
    </div>
  );
};
