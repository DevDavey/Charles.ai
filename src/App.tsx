/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Phone, 
  Database, 
  Globe, 
  MessageSquare, 
  ArrowRight, 
  Check, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const performanceData = [
  { name: "Week 1", humans: 12, charles: 15 },
  { name: "Week 2", humans: 10, charles: 28 },
  { name: "Week 3", humans: 14, charles: 45 },
  { name: "Week 4", humans: 11, charles: 72 },
  { name: "Week 5", humans: 13, charles: 98 },
  { name: "Week 6", humans: 12, charles: 120 },
];

function scrollTo(id: string) {
  const el = id ? document.getElementById(id) : document.documentElement;
  (el ?? document.documentElement).scrollIntoView({ behavior: "smooth", block: "start" });
}

function navClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollTo(id);
}

type CallLine = {
  delay: number;
  spk: "C" | "M";
  ts: string;
  text: string;
  sentiment: number;
  propensity: number;
  intent: "NEUTRAL" | "EXPLORING" | "RESISTANT" | "INTERESTED" | "COMMITTED";
  keywords?: string[];
  event?: "objection" | "painpoint" | "booked";
};

const CALL_LINES: CallLine[] = [
  { delay: 800,  spk: "C", ts: "00:08", text: "Bonjour Martin, c'est Charles — référencement B2B Québec.", sentiment: 0.65, propensity: 5.2, intent: "NEUTRAL" },
  { delay: 2400, spk: "M", ts: "00:14", text: "Oui bonjour. De quoi il s'agit?", sentiment: 0.52, propensity: 5.2, intent: "NEUTRAL" },
  { delay: 4200, spk: "C", ts: "00:21", text: "On automatise la prise de RDV B2B. Combien de personnes en prospection?", sentiment: 0.68, propensity: 5.8, intent: "EXPLORING" },
  { delay: 6200, spk: "M", ts: "00:31", text: "Trois. Mais c'est trop cher pour nous en Q3.", sentiment: 0.41, propensity: 4.9, intent: "RESISTANT", keywords: ["budget", "Q3", "trop_cher"], event: "objection" },
  { delay: 8400, spk: "C", ts: "00:40", text: "C'est le budget ou le timing?", sentiment: 0.60, propensity: 5.6, intent: "RESISTANT" },
  { delay: 10400, spk: "M", ts: "00:49", text: "Les deux. Firme offshore l'an passé — ça nous a coûté des clients.", sentiment: 0.37, propensity: 6.3, intent: "RESISTANT", keywords: ["offshore", "client_churn"], event: "painpoint" },
  { delay: 12400, spk: "C", ts: "00:57", text: "C'est exactement ce qu'on entend. 20 min pour vous montrer?", sentiment: 0.73, propensity: 7.9, intent: "INTERESTED" },
  { delay: 14000, spk: "M", ts: "01:02", text: "Ouais, envoyez quelque chose.", sentiment: 0.76, propensity: 8.5, intent: "INTERESTED" },
  { delay: 15400, spk: "C", ts: "01:08", text: "Je vous bloque jeudi 24 avril 10h00 — ça vous convient?", sentiment: 0.84, propensity: 9.3, intent: "COMMITTED" },
  { delay: 16800, spk: "M", ts: "01:12", text: "Oui, c'est parfait.", sentiment: 0.93, propensity: 9.8, intent: "COMMITTED", event: "booked" },
];

const INTENT_META: Record<string, { color: string; bg: string; label: string }> = {
  NEUTRAL:    { color: "text-zinc-400",   bg: "bg-zinc-400",   label: "NEUTRAL" },
  EXPLORING:  { color: "text-blue-400",   bg: "bg-blue-400",   label: "EXPLORING" },
  RESISTANT:  { color: "text-amber-400",  bg: "bg-amber-400",  label: "RESISTANT" },
  INTERESTED: { color: "text-brand-orange", bg: "bg-brand-orange", label: "INTERESTED" },
  COMMITTED:  { color: "text-green-400",  bg: "bg-green-400",  label: "COMMITTED" },
};

function LiveCallCard() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let timerInterval: ReturnType<typeof setInterval>;
    let active = true;

    function start() {
      if (!active) return;
      setVisibleLines([]);
      setEvents([]);
      setElapsed(0);
      timerInterval = setInterval(() => { if (active) setElapsed(e => e + 1); }, 1000);

      CALL_LINES.forEach((line, i) => {
        timeouts.push(setTimeout(() => {
          if (!active) return;
          setVisibleLines(prev => [...prev, i]);
          if (line.event) {
            const t = setTimeout(() => {
              if (active) setEvents(prev => [...prev, line.event!]);
            }, 700);
            timeouts.push(t);
          }
        }, line.delay));
      });

      timeouts.push(setTimeout(() => { clearInterval(timerInterval); start(); }, 23000));
    }

    start();
    return () => { active = false; timeouts.forEach(clearTimeout); clearInterval(timerInterval); };
  }, []);

  const latestLine = visibleLines.length > 0 ? CALL_LINES[visibleLines[visibleLines.length - 1]] : null;
  const sentiment  = latestLine?.sentiment  ?? 0.5;
  const propensity = latestLine?.propensity ?? 0;
  const intent     = latestLine?.intent     ?? "NEUTRAL";
  const allKeywords = [...new Set(visibleLines.flatMap(i => CALL_LINES[i].keywords ?? []))];
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const intentMeta = INTENT_META[intent];

  return (
    <div className="w-[500px] h-[640px] border border-white/10 bg-[#070707] rounded-tl-[60px] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]"></div>
          <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] font-mono">Live Call</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[10px] font-black text-white tracking-tight">Martin Tremblay</p>
            <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-mono">CFO · Tremblay Logistique</p>
          </div>
          <span className="text-[13px] font-mono text-zinc-500 tabular-nums font-bold">{fmt(elapsed)}</span>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="grid grid-cols-2 gap-px bg-white/[0.04] shrink-0">
        {[
          { label: "SENTIMENT", value: sentiment, display: sentiment.toFixed(2), color: "from-amber-500 to-green-400" },
          { label: "PROPENSITY", value: propensity / 10, display: `${propensity.toFixed(1)}/10`, color: "from-brand-orange to-amber-400" },
        ].map(({ label, value, display, color }) => (
          <div key={label} className="bg-[#070707] px-6 py-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[7px] uppercase tracking-[0.25em] text-zinc-700 font-black font-mono">{label}</span>
              <motion.span
                key={display}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black font-mono tabular-nums text-white"
              >
                {display}
              </motion.span>
            </div>
            <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Body: Transcript + Intelligence */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Transcript */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden px-6 py-4 gap-[7px] border-r border-white/[0.04]">
          {CALL_LINES.map((line, i) =>
            visibleLines.includes(i) ? (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-[8px] font-black font-mono shrink-0 w-3 ${line.spk === "C" ? "text-brand-orange" : "text-zinc-600"}`}>
                    {line.spk}
                  </span>
                  <span className="text-[7px] font-mono text-zinc-700 shrink-0 tabular-nums">{line.ts}</span>
                  <p className={`text-[9px] leading-snug font-mono ${line.spk === "C" ? "text-zinc-300" : "text-zinc-500"}`}>
                    {line.text}
                  </p>
                </div>
                {line.keywords && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-1 ml-11 mt-1 flex-wrap"
                  >
                    {line.keywords.map(kw => (
                      <span key={kw} className="text-[6px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-sm uppercase tracking-wider font-black font-mono">
                        {kw}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : null
          )}
        </div>

        {/* Intelligence Side Panel */}
        <div className="w-[136px] shrink-0 flex flex-col px-4 py-5 gap-5 bg-white/[0.01]">

          {/* Intent */}
          <div className="space-y-2">
            <span className="text-[6px] uppercase tracking-[0.25em] text-zinc-700 font-black font-mono block">Intent</span>
            <motion.div key={intent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${intentMeta.bg}`}></div>
              <span className={`text-[9px] font-black font-mono ${intentMeta.color}`}>{intentMeta.label}</span>
            </motion.div>
          </div>

          {/* Flagged Terms */}
          <div className="space-y-2">
            <span className="text-[6px] uppercase tracking-[0.25em] text-zinc-700 font-black font-mono block">Flagged</span>
            <div className="flex flex-col gap-1.5">
              {allKeywords.length === 0
                ? <span className="text-[8px] font-mono text-zinc-800">—</span>
                : allKeywords.map((kw, i) => (
                  <motion.div key={kw} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="w-1 h-1 bg-amber-500/60 rounded-full shrink-0"></div>
                    <span className="text-[8px] font-mono text-zinc-500">{kw}</span>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Signal Bars */}
          <div className="space-y-2 mt-auto">
            <span className="text-[6px] uppercase tracking-[0.25em] text-zinc-700 font-black font-mono block">Signal</span>
            {[
              { label: "engagement", val: Math.round(sentiment * 100) },
              { label: "close_prob",  val: Math.round(propensity * 10) },
              { label: "trust_idx",   val: Math.min(100, Math.round((sentiment * 0.6 + propensity * 0.04) * 100)) },
            ].map(({ label, val }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[6px] font-mono text-zinc-700">{label}</span>
                  <span className="text-[6px] font-mono text-zinc-600 tabular-nums">{val}%</span>
                </div>
                <div className="w-full h-[2px] bg-white/5">
                  <motion.div animate={{ width: `${val}%` }} transition={{ duration: 0.9 }} className="h-full bg-white/25 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* DURUM badge */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[6px] uppercase tracking-[0.2em] text-zinc-800 font-black font-mono">DURUM.AI</span>
          </div>
        </div>
      </div>

      {/* Intelligence Event Log */}
      <div className="border-t border-white/[0.06] px-6 py-3 space-y-1.5 shrink-0 bg-black/30">
        <span className="text-[6px] uppercase tracking-[0.25em] text-zinc-800 font-black font-mono block mb-2">Intelligence Log</span>
        {!events.length && (
          <p className="text-[8px] font-mono text-zinc-800">Awaiting triggers...</p>
        )}
        {events.includes("objection") && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-mono text-[8px]"
          >
            <span className="text-amber-500 shrink-0">⚡</span>
            <span className="text-zinc-700 tabular-nums shrink-0">00:31</span>
            <span className="text-amber-400 font-black">OBJECTION_LOGGED</span>
            <span className="text-zinc-700 ml-auto italic shrink-0">trop_cher · Q3</span>
          </motion.div>
        )}
        {events.includes("painpoint") && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-mono text-[8px]"
          >
            <span className="text-brand-orange shrink-0">●</span>
            <span className="text-zinc-700 tabular-nums shrink-0">00:49</span>
            <span className="text-brand-orange font-black">PAIN_POINT_DETECTED</span>
            <span className="text-zinc-700 ml-auto italic shrink-0">offshore_vendor</span>
          </motion.div>
        )}
        {events.includes("booked") && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-mono text-[8px]"
          >
            <span className="text-green-400 shrink-0">✓</span>
            <span className="text-zinc-700 tabular-nums shrink-0">01:12</span>
            <span className="text-green-400 font-black">APPOINTMENT_CONFIRMED</span>
            <span className="text-zinc-400 ml-auto shrink-0">Apr 24 · 10:00</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-brand-orange selection:text-white flex flex-col">
      {/* Background Mesh Gradients */}
      <div className="fixed top-[-200px] right-[-100px] w-[600px] h-[600px] mesh-gradient-blue opacity-10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] mesh-gradient-orange opacity-5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-[100] backdrop-blur-sm border-b border-white/5 bg-black/20">
        <a href="#" onClick={(e) => navClick(e, "")} className="text-2xl font-black tracking-tighter flex items-center gap-2 italic text-white no-underline">
          <div className="w-3 h-3 bg-brand-orange rounded-full animate-pulse"></div>
          CHARLES.AI
        </a>
        <div className="hidden md:flex gap-10 text-xs uppercase tracking-[0.15em] font-bold text-zinc-300">
          <a href="#intel" onClick={(e) => navClick(e, "intel")} className="hover:text-white transition-colors">How It Works</a>
          <a href="#voice" onClick={(e) => navClick(e, "voice")} className="hover:text-white transition-colors">Voice</a>
          <a href="#performance" onClick={(e) => navClick(e, "performance")} className="hover:text-white transition-colors">Results</a>
          <a href="#pricing" onClick={(e) => navClick(e, "pricing")} className="hover:text-white transition-colors">Pricing</a>
        </div>
        <button className="px-8 py-2.5 bg-brand-orange border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          Join Waitlist
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-12 min-h-screen pt-32 px-6 md:px-16 items-center">
        <div className="col-span-1 md:col-span-7 space-y-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10vw] md:text-[118px] leading-[0.88] font-black tracking-tighter italic uppercase"
          >
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="block text-zinc-500"
            >
              Stop chasing.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="block text-white"
            >
              Start{" "}
              <span
                className="text-brand-orange"
                style={{ textShadow: "0 0 80px rgba(255,78,0,0.45)" }}
              >
                scaling.
              </span>
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-zinc-400 font-light max-w-xl leading-relaxed"
          >
            Charles calls your leads, books the meeting, and hands your closer a perfect briefing. Powered by <span className="text-white font-medium italic">Durum Intelligence</span> and <span className="text-white font-medium italic">PitchLabs Voice</span>.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-8"
          >
            <button className="w-full sm:w-auto bg-white text-black px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all cursor-pointer group flex items-center justify-center gap-3">
              Deploy Your Agent <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
               <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Target Market</span>
                  <span className="text-lg font-bold italic">Quebec Network</span>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="col-span-1 md:col-span-5 hidden md:flex justify-end pt-20">
          <LiveCallCard />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="intel" className="scroll-mt-24 py-32 px-6 md:px-16 bg-white/[0.01] border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#3B28CC_0%,_transparent_70%)] opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-24 relative z-10">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                <Database size={32} />
              </div>
            </div>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              Powered by<br/>
              <span className="text-zinc-600">Durum Intelligence.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-ax mx-auto text-center">
              Charles doesn't just read a script. He digests the lifecycle of every lead through <span className="text-white font-medium">Durum.ai</span> before the call even begins.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left: Component Breakdown */}
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange">The Discovery-to-Close protocol</span>
                  <h3 className="text-4xl font-bold tracking-tighter uppercase italic">Your Closer's<br/>Cheat Sheet.</h3>
                  <p className="text-zinc-500 font-light leading-relaxed">
                    We built the tool we wished we had. Charles doesn't just book the meeting — he runs real discovery. Every call surfaces pain points, logs objections, and produces a structured brief so can walk in knowing exactly what to say.
                  </p>
               </div>

               <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-px h-12 bg-brand-orange/30 mt-2"></div>
                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Active Pain Discovery</h4>
                       <p className="text-xs text-zinc-500 font-light leading-relaxed">Charles asks the right questions mid-call to uncover what's actually broken — budget pressure, team bottlenecks, failed past solutions. It's captured, not guessed.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 opacity-60">
                    <div className="w-px h-12 bg-zinc-800 mt-2"></div>
                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Objection Logging</h4>
                       <p className="text-xs text-zinc-500 font-light leading-relaxed">Every "trop cher," or "on va y penser" is flagged and categorized in real time. Your closer sees exactly what pushed back and how hard — before they dial.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 opacity-40">
                    <div className="w-px h-12 bg-zinc-800 mt-2"></div>
                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Closer Brief</h4>
                       <p className="text-xs text-zinc-500 font-light leading-relaxed">After the call, Durum auto-generates a structured summary: what they care about, what they're afraid of, and the exact angle your closer should lead with on the follow-up.</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Closer Brief Output */}
            <div className="lg:col-span-7 border border-white/10 bg-black p-8 rounded-3xl relative">
               <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">CLOSER_BRIEF_GENERATED</span>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-full bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange font-black text-sm italic">MT</div>
                     <div>
                        <p className="text-sm font-black tracking-tight">Martin Tremblay</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">CFO · Tremblay Logistique · Laval, QC</p>
                     </div>
                     <div className="ml-auto px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full">Meeting Set</div>
                  </div>

                  <div className="space-y-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Pain Points Surfaced</span>
                     <div className="space-y-2">
                        {[
                          "Paying 3 setters ~$4k/mo each — booking ~35 appts total",
                          "Cash flow strain on net-60 contracts with main client",
                          "Tried an offshore call centre last year — quality killed the brand"
                        ].map((pt, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                             <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0"></div>
                             <p className="text-[11px] text-zinc-400 font-light leading-relaxed">{pt}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Objections Raised</span>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                           <span className="text-[8px] text-zinc-600 uppercase font-bold">Primary</span>
                           <p className="text-xs font-mono text-amber-400">"trop cher pour Q3"</p>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                           <span className="text-[8px] text-zinc-600 uppercase font-bold">Secondary</span>
                           <p className="text-xs font-mono text-zinc-400">"besoin d'en parler à mon associé"</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-5 bg-brand-orange/5 border border-brand-orange/20 rounded-xl space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Recommended Close Angle</span>
                     <p className="text-xs text-zinc-300 font-light leading-relaxed">
                       Lead with ROI math: $12k/mo in setter payroll for 35 appts vs. Charles at a fraction of that for 120+. Price objection is cover — the real fear is quality after the offshore failure. Address that head-on.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Section */}
      <section id="voice" className="scroll-mt-24 py-32 px-6 md:px-16 bg-[#080808] border-y border-white/5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-20 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end"
          >
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange">The PitchLabs Origin</span>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85]">
                Built From<br/>The Best<br/><span className="text-brand-orange">Closer</span><br/>In Quebec.
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-xl text-zinc-400 font-light leading-relaxed">
                Most AI voices are trained on generic datasets. Charles was trained on <span className="text-white font-medium">thousands of hours of real sales calls</span> from one source — <span className="text-white font-medium italic">Charles Gosselin</span>, one of Quebec's most decorated closers.
              </p>
              <p className="text-zinc-500 font-light leading-relaxed">
                Every pause, every pivot, every FR/EN code-switch — captured, analyzed, and distilled into a voice model that doesn't just sound human. It sounds like the best version of a Quebec closer who's been in the room a thousand times.
              </p>
            </div>
          </motion.div>

          {/* Charles Gosselin card + stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="lg:col-span-5 border border-white/10 bg-black rounded-2xl p-8 space-y-8"
            >
              <div className="flex items-center gap-5 border-b border-white/5 pb-8">
                <div className="w-14 h-14 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-black text-xl italic">
                  CG
                </div>
                <div>
                  <p className="font-black text-lg italic tracking-tight">Charles Gosselin</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Master Closer · Quebec</p>
                </div>
                <div className="ml-auto px-3 py-1 border border-brand-orange/30 bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest rounded-full">
                  Voice Source
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-3xl font-black italic">3,200<span className="text-brand-orange">+</span></div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Hours of Calls Analyzed</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black italic">15<span className="text-brand-orange">yr</span></div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Career in Quebec Sales</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black italic">FR<span className="text-zinc-600">/</span>EN</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Native Code-Switching</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black italic">#1</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Setter in His Vertical</div>
                </div>
              </div>

              <blockquote className="border-l-2 border-brand-orange pl-5 italic text-sm text-zinc-400 font-light leading-relaxed">
                "The nuance that closes deals isn't taught — it's earned. We built Charles so every team gets access to that edge from day one."
                <footer className="mt-3 text-[10px] text-zinc-600 uppercase font-bold not-italic tracking-widest">— Charles Gosselin</footer>
              </blockquote>
            </motion.div>

            {/* Feature list */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  icon: <Phone size={20} />,
                  title: "Real Call DNA",
                  body: "PitchLabs didn't synthesize a generic voice. It reverse-engineered 3,200+ hours of proven closes — every hesitation, every warm push, every objection handle — and encoded them into a model trained exclusively on winning calls.",
                },
                {
                  icon: <MessageSquare size={20} />,
                  title: "Quebec Cultural Fluency",
                  body: "Gosselin's calls span Montréal, Québec City, Sherbrooke, and the regions. Charles inherited that geographic range — he knows when to lean FR-CA hard and when to slide bilingual without friction.",
                },
                {
                  icon: <Zap size={20} />,
                  title: "Dynamic Tone Mirroring",
                  body: "Trained on thousands of live pivots, Charles reads prospect energy in real time. Hurried? He's crisp. Skeptical? He slows down and builds. It's not scripted — it's pattern-matched to what actually works.",
                },
                {
                  icon: <TrendingUp size={20} />,
                  title: "Objection Muscle Memory",
                  body: "The most common objections — price, timing, \"on va y penser\" — are baked into Charles's response architecture because Gosselin faced and overcame them thousands of times.",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-5 p-6 border border-white/5 bg-white/[0.02] rounded-xl hover:border-white/10 transition-colors"
                >
                  <div className="p-2 bg-white/5 rounded-lg text-brand-orange shrink-0 h-fit">{f.icon}</div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">{f.title}</h4>
                    <p className="text-xs text-zinc-500 font-light leading-relaxed">{f.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="performance" className="scroll-mt-24 py-32 px-6 md:px-16 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange">The Advantage</span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic leading-tight">
              Human setters dial.<br/>Charles <span className="text-zinc-500">evolves.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light max-w-lg leading-relaxed">
              Every call makes Charles sharper. It learns in real time — what objections kill deals, which openers build trust, what cadence closes faster — and recalibrates before the next dial.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-black italic">24/7</div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Always On</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-black italic">&lt;30s</div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Follow-Up Response</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-black italic">2x</div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Data for Closers</div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 h-[400px]">
             <div className="flex justify-between items-center mb-8 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Appointments Booked / Week</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                    <span className="text-[8px] uppercase font-bold text-zinc-500">Humans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                    <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Charles.ai</span>
                  </div>
                </div>
             </div>
             <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorCharles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4E00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF4E00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #ffffff10", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="charles" stroke="#FF4E00" strokeWidth={3} fillOpacity={1} fill="url(#colorCharles)" />
                  <Area type="monotone" dataKey="humans" stroke="#444" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-24 py-32 px-6 md:px-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <span className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange">Simple Pricing</span>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              No Reps.<br/><span className="text-zinc-600">No Overhead.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
              One flat monthly seat. Cancel anytime. Charles works 24/7 — your human setters do not.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="border border-white/10 bg-white/[0.02] p-8 rounded-2xl space-y-8 flex flex-col"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Demo</span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black italic">FREE</span>
                </div>
                <p className="text-xs text-zinc-500 font-light">Hear Charles call one of your real leads — no credit card, no commitment.</p>
              </div>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-zinc-400 flex-1">
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> 1 Live Demo Call</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> PitchLabs Voice</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Durum Intelligence</li>
              </ul>
              <button className="w-full border border-white/20 py-4 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
                Try our Demo
              </button>
            </motion.div>

            {/* Growth — highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-brand-orange/50 bg-brand-orange/5 p-8 rounded-2xl space-y-8 flex flex-col relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-orange text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                Private Beta
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Growth</span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black italic">$997</span>
                  <span className="text-zinc-500 text-sm mb-1">/mo</span>
                </div>
                <p className="text-xs text-zinc-500 font-light">Unlimited leads. Charles calls every new contact in under 30 seconds.</p>
              </div>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-zinc-400 flex-1">
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> 600 Calls / Month</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> 30 Second Lead Response Time</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> PitchLabs Voice</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Durum Intelligence</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Full Call Recording + Briefs</li>
              </ul>
              <button className="w-full bg-brand-orange text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer">
                Apply Now
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-white/10 bg-white/[0.02] p-8 rounded-2xl space-y-8 flex flex-col"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Enterprise</span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black italic">Custom</span>
                </div>
                <p className="text-xs text-zinc-500 font-light">White-label our API and deploy Charles under your own brand at scale.</p>
              </div>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-zinc-400 flex-1">
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> White-Label API Access</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Unlimited Calls</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Custom Voice Persona</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Dedicated Infra + SLA</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-green-500 shrink-0" /> Full Durum Integration</li>
              </ul>
              <button className="w-full border border-white/20 py-4 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Tunnel */}
      <section className="py-40 px-6 md:px-16 text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-12"
        >
          <h2 className="text-6xl md:text-[120px] font-black italic uppercase italic tracking-tighter leading-[0.8]">
            READY TO<br/>REPLACE THE<br/><span className="text-brand-orange">BOTTLENECK?</span>
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button className="bg-brand-orange text-white px-16 py-8 text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,78,0,0.3)] cursor-pointer">
              Apply for Private Beta
            </button>
            <button className="border border-white/20 px-16 py-8 text-lg font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
              Download One-Pager
            </button>
          </div>
          <div className="pt-20 flex justify-center gap-16 opacity-30 grayscale saturate-0 items-center">
             <div className="flex items-center gap-2 font-bold italic tracking-tighter text-2xl uppercase">
               <Database size={20} /> Durum.ai
             </div>
             <div className="flex items-center gap-2 font-bold italic tracking-tighter text-2xl uppercase">
               PitchLabs
             </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-sm font-black italic opacity-60">CHARLES.AI</div>
        <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
          &copy; 2026 CHARLES.AI // POWERED BY DURUM + PITCHLABS.
        </div>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
}
