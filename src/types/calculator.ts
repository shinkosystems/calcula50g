// @sos-edit: false
export type ButtonType = 'number' | 'operator' | 'function' | 'action' | 'memory' | 'equals';
export type AngleMode = 'DEG' | 'RAD';
export type PanelType = 'history' | 'variables' | 'graph' | null;

export interface CalculatorState {
  expression: string;
  result: string;
  history: HistoryEntry[];
  variables: Record<string, string>;
  memory: number;
  angleMode: AngleMode;
  activePanel: PanelType;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}
