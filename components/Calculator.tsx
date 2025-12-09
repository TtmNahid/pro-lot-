import React, { useState } from 'react';
import { Instrument } from '../types';
import { INSTRUMENTS } from '../constants';
import { DollarSign, Percent, ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface CalculatorProps {
  instrument: Instrument;
  setInstrument: (i: Instrument) => void;
  balance: string;
  setBalance: (val: string) => void;
  riskPercent: string;
  setRiskPercent: (val: string) => void;
  riskCash: string;
  setRiskCash: (val: string) => void;
  slDistance: string;
  setSlDistance: (val: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({
  instrument,
  setInstrument,
  balance,
  setBalance,
  riskPercent,
  setRiskPercent,
  riskCash,
  setRiskCash,
  slDistance,
  setSlDistance
}) => {
  const [showSpecs, setShowSpecs] = useState(true);

  return (
    <div className="space-y-6">
      
      {/* Account Variables Card */}
      <div className="bg-[#151A25] rounded-lg p-5 border border-slate-800 shadow-sm">
        <h3 className="text-[#2EB88A] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Account Variables
        </h3>
        
        <div className="space-y-4">
          {/* Balance */}
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Balance</label>
            <div className="relative group">
              <span className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">$</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded p-2.5 pl-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Risk % */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase mb-1 flex justify-between">
                Risk %
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded p-2.5 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                  placeholder="0.0"
                />
                <div className="absolute right-1 top-1 bottom-1 w-6 bg-[#1F2937] rounded flex items-center justify-center border border-slate-600">
                  <Percent className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Risk Cash */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Risk Cash ($)</label>
              <div className="relative group">
                 <input
                  type="number"
                  value={riskCash}
                  onChange={(e) => setRiskCash(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 text-[#2EB88A] font-bold rounded p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Distance Card */}
      <div className="bg-[#151A25] rounded-lg p-5 border border-slate-800 shadow-sm">
        <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Trade Distance
        </h3>
        
        <div>
          <label className="block text-slate-500 text-xs font-bold uppercase mb-1 flex justify-between">
            Stop Loss Distance ($)
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">USD Move</span>
          </label>
          <div className="relative group">
            <input
              type="number"
              value={slDistance}
              onChange={(e) => setSlDistance(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded p-2.5 pl-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-700"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">
            Enter the dollar amount the price must move to hit your Stop Loss.
          </p>
        </div>
      </div>

      {/* Instrument Specs Card */}
      <div className="bg-[#151A25] rounded-lg border border-slate-800 shadow-sm overflow-hidden">
        <button 
          onClick={() => setShowSpecs(!showSpecs)}
          className="w-full p-5 flex justify-between items-center bg-[#151A25] hover:bg-[#1A202E] transition-colors"
        >
          <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
             <Settings className="w-4 h-4" /> Instrument Specs
          </h3>
          {showSpecs ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        
        {showSpecs && (
          <div className="p-5 pt-0 border-t border-slate-800/50 space-y-4">
             <div className="mt-4">
               <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Symbol</label>
               <select
                 value={instrument.symbol}
                 onChange={(e) => {
                   const inst = INSTRUMENTS.find(i => i.symbol === e.target.value);
                   if(inst) setInstrument(inst);
                 }}
                 className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
               >
                 {INSTRUMENTS.map(i => (
                   <option key={i.symbol} value={i.symbol}>{i.symbol}</option>
                 ))}
               </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Contract Size</label>
                  <input
                    type="text"
                    readOnly
                    value={instrument.lotSize}
                    className="w-full bg-[#0B0E14]/50 border border-slate-700 text-slate-400 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Lot Step (Precision)</label>
                   <input
                    type="text"
                    readOnly
                    value={instrument.stepSize}
                    className="w-full bg-[#0B0E14]/50 border border-slate-700 text-slate-400 rounded p-2 text-sm"
                  />
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Calculator;