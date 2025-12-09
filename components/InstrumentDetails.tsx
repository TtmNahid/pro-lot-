import React from 'react';
import { CalculationResult, Instrument } from '../types';

interface Props {
  result: CalculationResult | null;
  instrument: Instrument;
  riskCash: string;
}

const InstrumentDetails: React.FC<Props> = ({ result, instrument, riskCash }) => {
  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Main Result Card */}
      <div className="relative bg-[#151A25] rounded-xl border border-slate-800 shadow-lg p-10 flex flex-col items-center justify-center min-h-[360px] overflow-hidden">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <h2 className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mb-4">
          Required Position Size
        </h2>

        {result ? (
           <div className="text-center">
             <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-bold text-white font-mono tracking-tighter drop-shadow-2xl">
                  {result.lots}
                </span>
                <span className="text-xl text-slate-500 font-bold uppercase">Lots</span>
             </div>
             
             {result.isValid ? (
               <div className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-[#0B0E14] rounded-full border border-slate-700/50">
                 <span className="text-slate-400 text-sm">
                   = <span className="text-white font-mono">{result.lots}</span> Units of <span className="text-blue-400">{instrument.symbol}</span>
                 </span>
               </div>
             ) : (
                <div className="mt-6 text-red-400 font-medium bg-red-900/10 px-4 py-2 rounded-lg border border-red-500/20">
                  {result.message}
                </div>
             )}
           </div>
        ) : (
          <div className="text-slate-600 text-lg">Enter parameters...</div>
        )}
      </div>

      {/* Result Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Risk Amount */}
        <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Risk Amount</span>
           <span className="text-xl font-bold text-[#F87171] font-mono">
             ${parseFloat(riskCash || '0').toFixed(2)}
           </span>
        </div>

        {/* Standard Lots */}
        <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Standard Lots</span>
           <span className="text-xl font-bold text-white font-mono">
             {result ? result.lots : '0'}
           </span>
        </div>

        {/* Mini Lots (10x) */}
        <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mini Lots</span>
           <span className="text-xl font-bold text-slate-300 font-mono">
             {result ? (result.lots * 10).toFixed(1).replace(/\.0$/, '') : '0'}
           </span>
        </div>

        {/* Micro Lots (100x) */}
         <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Micro Lots</span>
           <span className="text-xl font-bold text-slate-300 font-mono">
             {result ? (result.lots * 100).toFixed(0) : '0'}
           </span>
        </div>

      </div>
    </div>
  );
};

export default InstrumentDetails;