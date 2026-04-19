/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { motion, useInView } from "motion/react";
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

function HeroField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let W = el.clientWidth, H = el.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500);
    camera.position.set(0, 0, 85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const LINE_COUNT = 13;
    const PTS = 280;
    const SPAN = 170;

    // Each line: fundamental + 2 harmonics + slow voice-activity envelope
    const params = Array.from({ length: LINE_COUNT }, (_, i) => {
      const norm = i / (LINE_COUNT - 1); // 0..1
      return {
        yBase: (norm - 0.5) * 64,
        amp: 1.2 + Math.sin(i * 1.7) * 0.9,
        freq: 1.8 + i * 0.22,
        phase: i * 0.83,
        speed: 0.28 + i * 0.018,
        // lines near center are slightly brighter
        opacity: 0.09 + (1 - Math.abs(norm - 0.5) * 2) * 0.07,
      };
    });

    const geos: THREE.BufferGeometry[] = [];

    for (const p of params) {
      const positions = new Float32Array(PTS * 3);
      const colors = new Float32Array(PTS * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geos.push(geo);

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: p.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Line(geo, mat));
    }

    const update = (t: number) => {
      params.forEach((p, li) => {
        const pos = geos[li].attributes.position.array as Float32Array;
        const col = geos[li].attributes.color.array as Float32Array;
        // slow breath: voice-activity envelope per line
        const env = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.18 + p.phase * 1.4));

        for (let j = 0; j < PTS; j++) {
          const x = (j / (PTS - 1) - 0.5) * SPAN;
          const ph = (j / PTS) * Math.PI * 2 * p.freq;
          const disp = env * p.amp * (
            Math.sin(ph + t * p.speed + p.phase) +
            0.38 * Math.sin(ph * 2.3 - t * p.speed * 1.5 + p.phase * 0.5) +
            0.14 * Math.cos(ph * 4.1 + t * p.speed * 0.7)
          );
          pos[j * 3] = x;
          pos[j * 3 + 1] = p.yBase + disp;
          pos[j * 3 + 2] = 0;

          // edge fade + brightness peaks at displacement extremes
          const edgeFade = 1 - Math.pow(Math.abs(j / (PTS - 1) - 0.5) * 2, 2.5);
          const dispNorm = Math.abs(disp) / (p.amp * 1.5 * env + 0.001);
          const b = edgeFade * (0.35 + dispNorm * 0.65);
          col[j * 3] = b;
          col[j * 3 + 1] = b * 0.28;
          col[j * 3 + 2] = b * 0.02;
        }
        geos[li].attributes.position.needsUpdate = true;
        geos[li].attributes.color.needsUpdate = true;
      });
    };

    update(0);

    let t = 0, last = performance.now();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const now = performance.now();
      t += (now - last) * 0.001;
      last = now;
      update(t);
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      geos.forEach(g => g.dispose());
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}

function SignalField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let W = el.clientWidth;
    let H = el.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.007);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
    camera.position.set(0, 42, 72);
    camera.lookAt(0, -4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const COLS = 72;
    const ROWS = 48;
    const SPACING = 2.6;

    const hSeg = ROWS * (COLS - 1);
    const vSeg = COLS * (ROWS - 1);
    const totalVerts = (hSeg + vSeg) * 2;

    const positions = new Float32Array(totalVerts * 3);
    const colors = new Float32Array(totalVerts * 3);
    const gridY = new Float32Array(ROWS * COLS);

    const update = (t: number) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = (c - COLS / 2) * SPACING;
          const z = (r - ROWS / 2) * SPACING;
          const d = Math.sqrt(x * x + z * z) * 0.05;
          gridY[r * COLS + c] =
            Math.sin(d * 2.8 - t * 1.6) * Math.exp(-d * 0.28) * 11 +
            Math.sin(x * 0.11 + t * 0.65) * 2.8 +
            Math.cos(z * 0.09 - t * 0.48) * 2.2;
        }
      }

      let vi = 0;
      const setVert = (r: number, c: number) => {
        const x = (c - COLS / 2) * SPACING;
        const z = (r - ROWS / 2) * SPACING;
        const y = gridY[r * COLS + c];
        positions[vi * 3] = x;
        positions[vi * 3 + 1] = y;
        positions[vi * 3 + 2] = z;
        const n = Math.max(0, Math.min(1, (y + 11) / 22));
        const b = 0.04 + n * 0.96;
        colors[vi * 3] = b;
        colors[vi * 3 + 1] = b * (0.04 + n * 0.27);
        colors[vi * 3 + 2] = b * (0.18 - n * 0.17);
        vi++;
      };

      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS - 1; c++) { setVert(r, c); setVert(r, c + 1); }
      for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS - 1; r++) { setVert(r, c); setVert(r + 1, c); }
    };

    update(0);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    scene.add(new THREE.LineSegments(geo, mat));

    let t = 0;
    let animId: number;
    let last = performance.now();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const now = performance.now();
      t += (now - last) * 0.001 * 0.85;
      last = now;
      update(t);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      geo.dispose(); mat.dispose(); renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}

function scrollTo(id: string) {
  const el = id ? document.getElementById(id) : document.documentElement;
  (el ?? document.documentElement).scrollIntoView({ behavior: "smooth", block: "start" });
}

function navClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollTo(id);
}


export default function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, margin: "-100px" });

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
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-32 px-6 md:px-16 text-center overflow-hidden">
        <HeroField />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none z-[1]" />
        <div className="space-y-10 max-w-5xl relative z-[2]">
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
            className="text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Charles calls your leads, books the meeting, and hands your closer a perfect briefing. Powered by <span className="text-white font-medium italic">Durum Intelligence</span> and <span className="text-white font-medium italic">PitchLabs Voice</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <button className="w-full sm:w-auto bg-white text-black px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all cursor-pointer group flex items-center justify-center gap-3">
              Deploy Your Agent <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto border border-white/20 text-white px-12 py-6 text-sm font-black uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange transition-all cursor-pointer flex items-center justify-center gap-3">
              Watch Demo <ChevronRight size={18} />
            </button>
          </motion.div>
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

          <div ref={chartRef} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 h-[400px]">
             <div className="flex justify-between items-center mb-8 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Clients Booked / Week</span>
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
                <AreaChart key={chartInView ? 1 : 0} data={performanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                  <Area type="monotone" dataKey="humans" stroke="#444" strokeWidth={2} fillOpacity={0} isAnimationActive={chartInView} animationDuration={4000} animationEasing="ease-out" />
                  <Area type="monotone" dataKey="charles" stroke="#FF4E00" strokeWidth={3} fillOpacity={1} fill="url(#colorCharles)" isAnimationActive={chartInView} animationDuration={4000} animationEasing="ease-out" />
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
      <section className="py-40 px-6 md:px-16 text-center relative overflow-hidden">
        <SignalField />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505] pointer-events-none z-[1]" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-12 relative z-[2]"
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
