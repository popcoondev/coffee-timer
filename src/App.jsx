import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { 
  Play, Square, RotateCcw, Droplets, Thermometer, 
  Timer, Scale, ChevronLeft, Settings, 
  Info, Coffee, Gauge, ListChecks, ChevronRight, Clock, AlertCircle,
  Wind, ThermometerSnowflake, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components for Optimization ---

const TimerDisplay = memo(({ elapsed, view, isHolding }) => {
  const format = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="flex flex-col items-center py-4 text-white">
      <div className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1 text-center opacity-50">
        {isHolding ? '一時停止中' : '経過時間'}
      </div>
      <div 
        className={`text-8xl font-black font-mono tracking-tighter tabular-nums leading-none transition-all duration-700 ${isHolding ? 'text-orange-500 scale-95 opacity-50' : 'text-white'}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {format(elapsed)}
      </div>
    </div>
  );
});

const YabaneStep = memo(({ active, completed, type, amount, view }) => {
  const baseClasses = "relative flex items-center h-10 px-3 flex-1 min-w-[60px] transition-all duration-500";
  const colors = completed 
    ? (view === 'brewing' || view === 'result' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 text-white')
    : active 
      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      : (view === 'brewing' || view === 'result' ? 'bg-white/5 text-zinc-600' : 'bg-zinc-100 text-zinc-400');

  return (
    <div className={`${baseClasses} ${colors}`}
         style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)' }}>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-[7px] font-black uppercase leading-none">{type === 'Taste' ? '味' : '濃度'}</span>
        <span className="text-[10px] font-bold leading-none mt-0.5">{amount}g</span>
      </div>
    </div>
  );
});

const DotGridSelector = ({ padPos, setPadPos }) => {
  const gridSize = 10;
  const dots = Array.from({ length: gridSize * gridSize });
  const containerRef = useRef(null);

  const handleInteraction = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX !== undefined && clientY !== undefined) {
      setPadPos({
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-square bg-zinc-100 rounded-3xl p-6 shadow-inner overflow-hidden border border-zinc-200 cursor-crosshair group touch-none"
      onMouseDown={(e) => {
        handleInteraction(e);
        const move = (ev) => handleInteraction(ev);
        const up = () => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      }}
      onTouchStart={handleInteraction}
      onTouchMove={handleInteraction}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-400 tracking-[0.3em] uppercase z-10">3人前 (多め)</div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-400 tracking-[0.3em] uppercase z-10">1人前 (少なめ)</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black text-zinc-400 tracking-[0.3em] uppercase z-10">浅煎り</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-black text-zinc-400 tracking-[0.3em] uppercase z-10">深煎り</div>
      <div className="grid grid-cols-10 gap-2 h-full w-full">
        {dots.map((_, i) => {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const dotX = col / (gridSize - 1);
          const dotY = 1 - (row / (gridSize - 1));
          const dist = Math.sqrt(Math.pow(dotX - padPos.x, 2) + Math.pow(dotY - padPos.y, 2));
          const opacity = Math.max(0.2, 1 - dist * 2);
          const isTarget = dist < 0.15;
          return (
            <motion.div
              key={i}
              className="rounded-sm aspect-square transition-colors duration-300"
              animate={{ backgroundColor: isTarget ? '#3b82f6' : '#d4d4d8', opacity: isTarget ? 1 : opacity }}
            />
          );
        })}
      </div>
      <motion.div 
        className="absolute pointer-events-none"
        animate={{ left: `${padPos.x * 100}%`, bottom: `${padPos.y * 100}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        style={{ x: '-50%', y: '50%' }}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 border border-blue-500/20 rounded-full animate-ping" />
          <div className="absolute w-8 h-8 border border-blue-500/30 rounded-full" />
          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-white" />
        </div>
      </motion.div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('config'); 
  const [padPos, setPadPos] = useState({ x: 0.5, y: 0.5 }); 
  const [flavor, setFlavor] = useState('Balanced'); 
  const [strength, setStrength] = useState('Medium'); 
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  // Wake Lock Ref
  const wakeLockRef = useRef(null);

  const coffeeWeight = Math.round(8 + (padPos.y * 28));
  const totalWater = coffeeWeight * 15;
  const waterTemp = Math.round(93 - (padPos.x * 11));
  
  const grind = useMemo(() => {
    let grindLabel = '';
    let grindDesc = '';

    if (padPos.y < 0.33) { // Primarily 1 serving
      if (padPos.x < 0.5) { // Light roast
        grindLabel = '中細挽き'; // Medium-fine
        grindDesc = 'グラニュー糖程度';
      } else { // Dark roast
        grindLabel = '中挽き'; // Medium
        grindDesc = 'ザラメ程度';
      }
    } else if (padPos.y < 0.66) { // Primarily 2 servings
      if (padPos.x < 0.5) { // Light roast
        grindLabel = '中挽き'; // Medium
        grindDesc = 'ザラメ程度';
      } else { // Dark roast
        grindLabel = '中粗挽き'; // Medium-coarse
        grindDesc = '粗塩程度';
      }
    } else { // Primarily 3 servings
      if (padPos.x < 0.5) { // Light roast
        grindLabel = '中粗挽き'; // Medium-coarse
        grindDesc = '粗塩程度';
      } else { // Dark roast
        grindLabel = '粗挽き'; // Coarse
        grindDesc = '岩塩程度';
      }
    }
    return { label: grindLabel, desc: grindDesc };
  }, [padPos.x, padPos.y]);

  const recipe = useMemo(() => {
    const first40 = totalWater * 0.4;
    const second60 = totalWater * 0.6;
    let p1, p2;
    if (flavor === 'Sweet') { p1 = first40 * 0.4; p2 = first40 * 0.6; }
    else if (flavor === 'Bright') { p1 = first40 * 0.6; p2 = first40 * 0.4; }
    else { p1 = first40 * 0.5; p2 = first40 * 0.5; }
    const count = strength === 'Light' ? 2 : strength === 'Strong' ? 4 : 3;
    const size = second60 / count;
    const pours = [p1, p2, ...Array(count).fill(size)];
    let cumulative = 0;
    return pours.map((amount, i) => {
      cumulative += amount;
      return { id: i + 1, amount: Math.round(amount), total: Math.round(cumulative), time: i * 45, type: i < 2 ? 'Taste' : 'Strength' };
    });
  }, [totalWater, flavor, strength]);

  const totalTime = recipe.length * 45;

  // --- Wake Lock Management ---
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          // Fail silently as it's a non-critical feature
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current !== null) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    if (view === 'brewing') {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Cleanup on unmount
    return () => {
      releaseWakeLock();
    };
  }, [view]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval;
    if (isRunning && !isHolding) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isHolding]);

  useEffect(() => {
    if (!isRunning) return;

    const nextIdx = recipe.findIndex((r, i) => {
      const nextTime = recipe[i + 1] ? recipe[i + 1].time : 9999;
      return elapsed >= r.time && elapsed < nextTime;
    });
    if (nextIdx !== -1 && nextIdx !== currentStep) setCurrentStep(nextIdx);
    
    if (elapsed >= totalTime) {
      setIsRunning(false);
      setTimeout(() => setView('result'), 800);
    }
  }, [elapsed, recipe, currentStep, totalTime, isRunning]);

  const format = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const activeStep = recipe[currentStep];
  const stepProgress = activeStep ? ((elapsed - activeStep.time) / 45) * 100 : 0;

  return (
    <motion.div 
      animate={{ backgroundColor: view === 'config' ? '#fafafa' : '#18181b' }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col font-sans select-none overflow-y-auto pb-12"
    >
      <AnimatePresence mode="wait">
        {view === 'config' ? (
          <motion.header 
            key="config-header"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center pt-8 pb-4 px-5 max-w-md mx-auto w-full"
          >
            <h1 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Standard 4:6 Guide</h1>
            <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] font-bold mt-1">4:6メソッドに基づく抽出アシスタント</p>
          </motion.header>
        ) : (
          <motion.div 
            key="brewing-status"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-white/5 border-b border-white/10 grid grid-cols-3 gap-2 sticky top-0 z-20 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-white">温度</span>
              <span className="text-sm font-bold text-orange-400">{waterTemp}℃</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/5">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-white">目標時間</span>
              <span className="text-sm font-bold text-zinc-200">{format(totalTime)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-white">挽き目</span>
              <span className="text-sm font-bold text-zinc-200">{grind.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5">
        {view !== 'config' && (
          <div className="w-full pt-4 flex gap-0.5 overflow-x-auto pb-2 scrollbar-hide">
            {recipe.map((r, i) => (
              <YabaneStep key={r.id} type={r.type} amount={r.amount} active={i === currentStep} completed={view === 'result' || i < currentStep} view={view} />
            ))}
          </div>
        )}

        {view === 'config' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 p-5 border border-zinc-100 flex flex-col gap-4 mt-2 text-zinc-900">
              <div className="flex justify-between items-end px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">粉の量 / 焙煎度</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-zinc-800">{coffeeWeight}g</span>
                    <span className="text-xs font-bold text-zinc-400">/{totalWater}ml</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-zinc-900">目標温度</span>
                  <div className="flex items-center gap-1">
                    <Thermometer size={14} className="text-orange-500" />
                    <span className="text-xl font-black text-zinc-800">{waterTemp}℃</span>
                  </div>
                </div>
              </div>
              <DotGridSelector padPos={padPos} setPadPos={setPadPos} />
              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2"><Gauge size={16} className="text-zinc-400" /><span className="text-xs font-bold text-zinc-700">{grind.label}</span></div>
                <span className="text-[10px] text-zinc-400 font-medium italic">{grind.desc}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-zinc-900">
              <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col items-center gap-3">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">味のプロフィール</span>
                <div className="flex w-full gap-1">
                  {['Bright', 'Balanced', 'Sweet'].map(f => (
                    <button key={f} onClick={() => setFlavor(f)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${flavor === f ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>{f === 'Bright' ? '酸味' : f === 'Sweet' ? '甘味' : 'バランス'}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col items-center gap-3">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">濃さの調整</span>
                <div className="flex w-full gap-1">
                  {['Light', 'Medium', 'Strong'].map(s => (
                    <button key={s} onClick={() => setStrength(s)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${strength === s ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>{s === 'Light' ? '軽' : s === 'Strong' ? '濃' : '中'}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm mt-2">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-zinc-400"/>
                  <span className="text-sm font-bold text-zinc-800">目標時間: {format(totalTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-500">
                  <Droplets size={16}/>
                  <span className="text-sm font-black tracking-tighter uppercase">Total {recipe.length} Pours</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 overflow-x-auto pb-2 scrollbar-hide">
                {recipe.map((r) => (
                  <YabaneStep key={r.id} type={r.type} amount={r.amount} active={false} completed={false} view={view} />
                ))}
              </div>
            </div>

            <button onClick={() => { setElapsed(0); setCurrentStep(0); setIsRunning(true); setView('brewing'); }} className="w-full bg-zinc-900 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-zinc-300 active:scale-95 transition-all flex items-center justify-center gap-3 mt-2">
              <Coffee size={24}/> 抽出を開始する
            </button>
          </div>
        )}

        {view === 'brewing' && (
          <div className="flex flex-col items-center justify-start gap-6 pt-4 flex-1">
            <TimerDisplay elapsed={elapsed} view={view} isHolding={isHolding} />
            <div className="w-full max-w-sm relative h-80">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStep}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                  className={`absolute inset-0 border rounded-[2.5rem] p-8 flex flex-col items-center gap-4 overflow-hidden shadow-2xl transition-all duration-700 ${isHolding ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10'}`}
                >
                  {isHolding && (
                    <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 backdrop-blur-sm z-10 text-white">
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-orange-500 text-xs font-black tracking-widest uppercase"
                      >
                        落ちきるまで待機中
                      </motion.div>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-blue-500 text-[10px] font-black px-4 py-1.5 rounded-br-xl uppercase tracking-widest text-white">STEP {activeStep?.id}</div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">{activeStep?.type === 'Taste' ? '味の調整' : '濃度の調整'}</div>
                  <div className="flex flex-col items-center text-white">
                    <span className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-tighter">目標の累積重量まで注ぐ</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black leading-none">{activeStep?.total}</span>
                      <span className="text-2xl font-bold text-zinc-500">g</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-auto">
                    <div className="h-full bg-blue-500 transition-all duration-1000 ease-linear" style={{ width: `${Math.min(100, stepProgress)}%` }} />
                  </div>
                  <div className="text-sm font-medium text-zinc-400">今回の注水量: <span className="text-white">+{activeStep?.amount}g</span></div>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3 mt-2"
            >
              <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Method Hint</p>
                <p className="text-[10px] text-zinc-300 leading-relaxed mt-1">
                  お湯がドリッパーから完全に落ちきってから次を注ぐのが4:6メソッドの鉄則です。
                </p>
              </div>
            </motion.div>

            <div className="w-full flex flex-col gap-4 mt-auto pb-8">
              <div className="grid grid-cols-2 gap-4 px-2 text-white">
                <button 
                  onClick={() => setIsHolding(!isHolding)}
                  className={`py-8 rounded-3xl font-black transition-all flex flex-col items-center justify-center gap-2 border-2 active:scale-95 ${isHolding ? 'bg-orange-500 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)] text-white' : 'bg-white/5 border-white/10 text-orange-500'}`}
                >
                  <Droplets size={28} className={isHolding ? 'animate-bounce' : ''} />
                  <span className="text-[10px] tracking-widest uppercase">{isHolding ? '再開する' : 'まだ落ちていない'}</span>
                </button>
                <button onClick={() => { setIsRunning(false); setView('config'); setIsHolding(false); }} className="py-8 rounded-3xl font-black bg-white/5 border-2 border-white/10 active:scale-95 transition-all text-zinc-400 flex flex-col items-center justify-center gap-2">
                  <RotateCcw size={24}/>
                  <span className="text-[10px] tracking-widest uppercase">リセット</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'result' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-10 flex-1 text-white"
          >
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-2">
              <Coffee size={40} className="text-white" />
            </div>
            
            <div className="text-center px-4 w-full">
              <h2 className="text-3xl font-black tracking-tighter mb-4 italic">DONE.</h2>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative mb-8">
                <p className="text-white text-lg font-bold leading-relaxed">
                  お疲れ様でした。<br/>最高の一杯を楽しんでください。
                </p>
              </div>

              <div className="flex flex-col gap-4 text-left w-full max-w-sm mx-auto">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">味わうためのポイント</h3>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Wind size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-white mb-1">香りを探してみよう</p>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      立ち上る湯気の中から、フルーツや花、チョコレートのような複雑な香りを探してみてください。
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Sparkles size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-white mb-1 text-white">舌触り（テクスチャ）</p>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      液体が舌を通り抜ける時の滑らかさや、心地よい「重さ」の余韻を感じてみましょう。
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><ThermometerSnowflake size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-white mb-1 text-white">温度による変化</p>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      コーヒーが冷めていくにつれて、より鮮やかになる酸味と甘みの移り変わりを楽しんで。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setElapsed(0); setCurrentStep(0); setView('config'); }}
              className="w-full bg-blue-500 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 mt-6"
            >
              <RotateCcw size={24}/> もう一度淹れる
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default App;