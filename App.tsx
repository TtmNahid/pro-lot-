import React, { useState, useEffect, useCallback } from 'react';
import Calculator from './components/Calculator';
import InstrumentDetails from './components/InstrumentDetails';
import AIHelper from './components/AIHelper';
import AuthModal from './components/AuthModal';
import { Instrument, CalculationResult } from './types';
import { INSTRUMENTS } from './constants';
import { Calculator as CalcIcon, LogOut, LogIn, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

const App: React.FC = () => {
  // State
  const [currentInstrument, setCurrentInstrument] = useState<Instrument>(INSTRUMENTS[2]); // Default AVAX
  const [balance, setBalance] = useState<string>('5000');
  const [riskPercent, setRiskPercent] = useState<string>('0.5');
  const [riskCash, setRiskCash] = useState<string>('25.00');
  const [slDistance, setSlDistance] = useState<string>('0.15');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Auth State
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load User & Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserSettings(session.user);
      } else {
        setIsSettingsLoaded(true); // Nothing to load, ready to go
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserSettings(session.user);
      } else {
        setUser(null);
        // Reset defaults on logout if needed, or keep last state
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load settings from Supabase Table
  const loadUserSettings = async (currentUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Error loading settings:', error);
      }

      if (data) {
        if (data.balance) setBalance(data.balance.toString());
        if (data.risk_percent) setRiskPercent(data.risk_percent.toString());
        if (data.risk_cash) setRiskCash(data.risk_cash.toString());
        if (data.sl_distance) setSlDistance(data.sl_distance.toString());
        if (data.instrument_symbol) {
          const inst = INSTRUMENTS.find(i => i.symbol === data.instrument_symbol);
          if (inst) setCurrentInstrument(inst);
        }
      }
    } catch (err) {
      console.error('Unexpected error loading settings:', err);
    } finally {
      setIsSettingsLoaded(true);
    }
  };

  // Sync settings to Supabase Table (Debounced)
  useEffect(() => {
    if (!user || !isSettingsLoaded) return;

    setSyncStatus('saving');

    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          balance: parseFloat(balance) || 0,
          risk_percent: parseFloat(riskPercent) || 0,
          risk_cash: parseFloat(riskCash) || 0,
          sl_distance: parseFloat(slDistance) || 0,
          instrument_symbol: currentInstrument.symbol,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error("Failed to sync settings:", error);
        setSyncStatus('error');
      } else {
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 2000); // Reset to idle after 2s
      }
    }, 1500); // Save after 1.5s of inactivity

    return () => clearTimeout(timer);
  }, [user, isSettingsLoaded, balance, riskPercent, riskCash, slDistance, currentInstrument]);


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

          <div className="flex items-center gap-4">
            
            {/* Load Preset Mockup */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Load Preset:</span>
              <div className="bg-[#151A25] px-3 py-1.5 rounded border border-slate-700 text-sm text-slate-300 flex items-center gap-2">
                 {currentInstrument.symbol.split('/')[0]}
              </div>
            </div>

            {/* Auth Button */}
            {user ? (
               <div className="flex items-center gap-3">
                 
                 {/* Sync Status Indicator */}
                 {syncStatus !== 'idle' && (
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-[#151A25] rounded border border-slate-800 animate-in fade-in duration-300">
                      {syncStatus === 'saving' && (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Syncing</span>
                        </>
                      )}
                      {syncStatus === 'saved' && (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Saved</span>
                        </>
                      )}
                      {syncStatus === 'error' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Error</span>
                        </>
                      )}
                    </div>
                 )}

                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs text-slate-400">Signed in as</span>
                    <span className="text-sm font-semibold text-white">{user.email?.split('@')[0]}</span>
                 </div>
                 <button 
                  onClick={() => supabase.auth.signOut()}
                  className="bg-[#151A25] hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-colors p-2 rounded-lg border border-slate-700 text-slate-400"
                  title="Sign Out"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
               </div>
            ) : (
               <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
               >
                 <LogIn className="w-4 h-4" />
                 <span>Login</span>
               </button>
            )}

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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};

export default App;