export interface Instrument {
  symbol: string;
  name: string;
  assetType: string;
  currency: string;
  precision: number;
  marginRate: string;
  lotSize: number; // The contract size (usually 1.0)
  minSize: number;
  maxSize: number;
  stepSize: number;
}

export interface CalculationResult {
  lots: number;
  isValid: boolean;
  message: string;
  actualRisk: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
