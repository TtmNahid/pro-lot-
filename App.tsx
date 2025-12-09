import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import InstrumentDetails from './components/InstrumentDetails';
import AIHelper from './components/AIHelper';
import { Instrument, CalculationResult } from './types';
import { INSTRUMENTS } from './constants';
import { Calculator as CalcIcon } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentInstrument, setCurrentInstrument] = useState<Instrument>(INSTRUMENTS[2]); // Default AVAX as per screenshot
  const [balance, setBalance] = useState<string>('5000');
  const [riskPercent, setRiskPercent] = useState<string>('0.5');
  const [riskCash, setRiskCash] = useState<string>('25.00');
  const [slDistance, setSlDistance] = useState<string>('0.15');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Handlers for bidirectional Risk updates
  const handleBalanceChange = (val: string) => {
    setBalance(val);
    if (val && riskPercent) {
      const b = parseFloat(val);
      const p = parseFloat(riskPercent);
      if (!isNaN(b) && !isNaN(p)) {
        setRiskCash((b * (p / 100)).toFixed(2));
      }
    }
  };

  const handleRiskPercentChange = (val: string) => {
    setRiskPercent(val);
    if (balance && val) {
      const b = parseFloat(balance);
      const p = parseFloat(val);
      if (!isNaN(b) && !isNaN(p)) {
        setRiskCash((b * (p / 100)).toFixed(2));
      }
    }
  };

  const handleRiskCashChange = (val: string) => {
    setRiskCash(val);
    if (balance && val) {
      const b = parseFloat(balance);
      const c = parseFloat(val);
      if (!isNaN(b) && !isNaN(c) && b !== 0) {
        setRiskPercent(((c / b) * 100).toFixed(2));
      }
    }
  };

  // Calculation Logic
  useEffect(() => {
    const calculate = () => {
      const riskAmount = parseFloat(riskCash);
      const distance = parseFloat(slDistance);

      if (isNaN(riskAmount) || isNaN(distance) || distance === 0 || riskAmount <= 0) {
        setResult(null);
        return;
      }

      // Formula: Risk / Distance = Units
      const rawUnits = riskAmount / distance;

      // Apply Step Size
      const step = currentInstrument.stepSize;
      const stepDecimals = (step.toString().split('.')[1] || '').length;
      
      // Round down to nearest step to be safe
      const steppedUnits = Math.floor(rawUnits / step + 0.0000001) * step;
      const formattedLots = parseFloat(steppedUnits.toFixed(stepDecimals));

      let isValid = true;
      let message = 'Calculation successful';

      if (formattedLots < currentInstrument.minSize) {
        isValid = false;
        message = `Below Min Size (${currentInstrument.minSize})`;
      } else if (formattedLots > currentInstrument.maxSize) {
        isValid = false;
        message = `Exceeds Max Size (${currentInstrument.maxSize})`;
      }

      setResult({
        lots: formattedLots,
        isValid,
        message,
        actualRisk: formattedLots * distance
      });
    };

    calculate();
  }, [riskCash, slDistance, currentInstrument]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0B0E14] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-blue-500">
               <CalcIcon className="w-5 h-5" />
               <h1 className="text-xl font-bold tracking-tight text-blue-400">Pro Lot Calculator</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Optimized for BTC, ETH, SOL, AVAX, AAVE, LINK, ADA</p>
          </div>

          {/* Load Preset Mockup */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Load Preset:</span>
            <div className="bg-[#151A25] px-3 py-1.5 rounded border border-slate-700 text-sm text-slate-300 flex items-center gap-2">
               {currentInstrument.symbol.split('/')[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Inputs) - Spans 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <Calculator 
              instrument={currentInstrument}
              setInstrument={setCurrentInstrument}
              balance={balance}
              setBalance={handleBalanceChange}
              riskPercent={riskPercent}
              setRiskPercent={handleRiskPercentChange}
              riskCash={riskCash}
              setRiskCash={handleRiskCashChange}
              slDistance={slDistance}
              setSlDistance={setSlDistance}
            />
          </div>

          {/* Right Column (Results) - Spans 8 columns */}
          <div className="lg:col-span-8">
             <InstrumentDetails 
                result={result} 
                instrument={currentInstrument}
                riskCash={riskCash}
             />
          </div>
        </div>
      </main>

      <AIHelper />
    </div>
  );
};

export default App;