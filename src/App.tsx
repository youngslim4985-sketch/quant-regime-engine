import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Mic, MicOff, BookOpen, 
  BarChart3, Activity, ShieldAlert, Play, Square,
  BrainCircuit, History, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Metrics {
  total_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  max_drawdown: number;
  equity_curve: { index: number; value: number }[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'voice'>('dashboard');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [journal, setJournal] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<string>('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, journalRes] = await Promise.all([
        axios.get('/api/analytics'),
        axios.get('/api/journal')
      ]);
      setMetrics(metricsRes.data);
      setJournal(journalRes.data.content);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Voice Recognition Setup
  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setLastCommand(text);
      try {
        const res = await axios.post('/api/voice', { command: text });
        setVoiceResponse(res.data.response);
        fetchData(); // Refresh data in case status changed
      } catch (error) {
        setVoiceResponse("Error processing voice command.");
      }
    };

    recognition.start();
  };

  const simulateTrade = async () => {
    const actions = ['LONG', 'SHORT'];
    const regimes = ['Bullish Trend', 'Bearish Trend', 'Mean Reverting', 'High Volatility'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const state = regimes[Math.floor(Math.random() * regimes.length)];
    const pnl = (Math.random() * 2000) - 800;
    const price = 50000 + (Math.random() * 1000);
    const explanation = `Automated trade triggered by ${state} detection. Entering ${action} at ${price.toFixed(2)}.`;

    await axios.post('/api/trades', { action, price, state, pnl, explanation });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans selection:bg-emerald-500/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 border-r border-white/5 bg-[#0A0A0A] flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
          <Activity className="text-emerald-500 w-6 h-6" />
        </div>
        
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<BarChart3 className="w-5 h-5" />}
          label="Stats"
        />
        <NavButton 
          active={activeTab === 'journal'} 
          onClick={() => setActiveTab('journal')}
          icon={<BookOpen className="w-5 h-5" />}
          label="Journal"
        />
        <NavButton 
          active={activeTab === 'voice'} 
          onClick={() => setActiveTab('voice')}
          icon={<Mic className="w-5 h-5" />}
          label="Voice"
        />

        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={fetchData}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 hover:bg-white/5 text-white/40 hover:text-white",
              isLoading && "animate-spin"
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/50 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-medium tracking-tight">HedgeFund <span className="text-emerald-500 italic serif">Alpha</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono">Real-time Quant Analytics</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={simulateTrade}
              className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2"
            >
              <Play className="w-3 h-3 fill-current" />
              SIMULATE TRADE
            </button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">Live Engine</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard 
                    label="Total PnL" 
                    value={`$${metrics?.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    trend={metrics?.total_pnl && metrics.total_pnl >= 0 ? 'up' : 'down'}
                  />
                  <MetricCard 
                    label="Win Rate" 
                    value={`${((metrics?.win_rate || 0) * 100).toFixed(1)}%`}
                    subValue={`${metrics?.win_rate && metrics.win_rate > 0.5 ? 'Outperforming' : 'Neutral'}`}
                  />
                  <MetricCard 
                    label="Avg Win/Loss" 
                    value={`$${metrics?.avg_win.toFixed(0)} / $${Math.abs(metrics?.avg_loss || 0).toFixed(0)}`}
                    subValue={`Ratio: ${((metrics?.avg_win || 0) / Math.abs(metrics?.avg_loss || 1)).toFixed(2)}`}
                  />
                  <MetricCard 
                    label="Max Drawdown" 
                    value={`$${Math.abs(metrics?.max_drawdown || 0).toLocaleString()}`}
                    trend="down"
                    subValue="Risk Exposure"
                  />
                </div>

                {/* Equity Curve Chart */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-medium italic serif">Equity Curve</h3>
                      <p className="text-xs text-white/40">Cumulative performance across all logged trades</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
                        Growth
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics?.equity_curve || []}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="index" 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `T-${val}`}
                        />
                        <YAxis 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-medium italic serif">AI Trade Journal</h2>
                    <p className="text-sm text-white/40">Deep analysis and reflections on every execution</p>
                  </div>
                  <History className="text-white/20 w-8 h-8" />
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                  {journal || "No journal entries yet. Execute a trade to begin logging."}
                </div>
              </motion.div>
            )}

            {activeTab === 'voice' && (
              <motion.div 
                key="voice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-medium italic serif">Voice Assistant</h2>
                  <p className="text-white/40 max-w-md mx-auto">
                    Control your hedge fund platform hands-free. Ask about PnL, market regimes, or toggle trading status.
                  </p>
                </div>

                <div className="relative">
                  <AnimatePresence>
                    {isListening && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"
                      />
                    )}
                  </AnimatePresence>
                  
                  <button 
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className={cn(
                      "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                      isListening 
                        ? "bg-emerald-500 border-emerald-400 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.4)]" 
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {isListening ? (
                      <Mic className="w-12 h-12 text-black animate-pulse" />
                    ) : (
                      <MicOff className="w-12 h-12 text-white/40" />
                    )}
                  </button>
                </div>

                <div className="w-full max-w-2xl space-y-6">
                  {lastCommand && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono">You said</p>
                      <p className="text-lg italic serif">"{lastCommand}"</p>
                    </div>
                  )}

                  {voiceResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-mono">Alpha Assistant</p>
                      </div>
                      <p className="text-lg text-emerald-100">{voiceResponse}</p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  <div className="px-4 py-2 border border-white/5 rounded-lg">"What's our PnL?"</div>
                  <div className="px-4 py-2 border border-white/5 rounded-lg">"Current regime?"</div>
                  <div className="px-4 py-2 border border-white/5 rounded-lg">"Turn off trading"</div>
                  <div className="px-4 py-2 border border-white/5 rounded-lg">"Enable system"</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-emerald-500" : "text-white/30 hover:text-white"
      )}
    >
      <div className={cn(
        "p-3 rounded-xl transition-all duration-300",
        active ? "bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "group-hover:bg-white/5"
      )}>
        {icon}
      </div>
      <span className="text-[9px] uppercase tracking-tighter font-bold">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -right-[21px] top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full"
        />
      )}
    </button>
  );
}

function MetricCard({ label, value, subValue, trend }: { label: string; value: string; subValue?: string; trend?: 'up' | 'down' }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono">{label}</p>
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
        {trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-2xl font-medium tracking-tight group-hover:text-emerald-500 transition-colors">{value}</h4>
        {subValue && <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">{subValue}</p>}
      </div>
    </div>
  );
}
