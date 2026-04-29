/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';
import { Music, Gamepad2, Github } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-neon-blue selection:text-zinc-950">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Gamepad2 className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none italic">
                NEON<span className="text-neon-blue">BEATS</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Analog Drift System</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Arcade</a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Playlist</a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Market</a>
          </nav>

          <div className="flex items-center gap-4">
             <button className="text-zinc-500 hover:text-white transition-colors">
               <Github className="w-5 h-5" />
             </button>
             <div className="h-6 w-[1px] bg-zinc-800" />
             <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-white">Player_01</p>
                 <p className="text-[10px] text-zinc-500 font-mono">LVL 42 VIP</p>
               </div>
               <div className="w-8 h-8 rounded-full border border-neon-blue/30 bg-zinc-900 overflow-hidden">
                 <img 
                    src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Neon" 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                 />
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center">
        
        {/* Game Container (Center) */}
        <section className="flex-1 w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex justify-center"
          >
            <SnakeGame />
          </motion.div>
          
          {/* Status Bar Below Game */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-[400px]">
            {[
              { label: 'Speed', value: '1.2x', color: 'text-neon-blue' },
              { label: 'Combo', value: 'x4', color: 'text-neon-purple' },
              { label: 'Bounty', value: '$240', color: 'text-neon-green' },
              { label: 'Rank', value: '#12', color: 'text-neon-pink' },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-zinc-500">{stat.label}</span>
                <span className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar (Music) */}
        <aside className="w-full lg:w-auto flex flex-col gap-6 sticky top-28">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-neon-blue" />
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] font-bold">Now Playing</h2>
            </div>
            <MusicPlayer />
          </motion.div>

          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
             <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">Live Activity</h3>
             <ul className="space-y-4">
               {[
                 { user: 'CyberPnk_99', action: 'set a high score of 420', time: '2m' },
                 { user: 'NeuralLink', action: 'started playing Cyber Dreams', time: '5m' },
                 { user: 'X_Ghost', action: 'unlocked "Neon Master" badge', time: '12m' },
               ].map((item, i) => (
                 <li key={i} className="flex gap-3 text-xs leading-tight">
                   <div className="w-8 h-8 rounded bg-zinc-800 flex-shrink-0" />
                   <div>
                     <p><span className="text-neon-blue font-bold">{item.user}</span> {item.action}</p>
                     <p className="text-zinc-600 font-mono mt-1">{item.time} ago</p>
                   </div>
                 </li>
               ))}
             </ul>
          </div>
        </aside>
      </main>

      {/* Footer / Taskbar */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /> System Online</span>
            <span>Latency: 24ms</span>
          </div>
          <div className="hidden sm:block">
            Crafted for the Neon Grid &copy; 2026
          </div>
          <div className="flex items-center gap-4">
            <span>v1.2.0-beta</span>
            <span>Uptime: 14:02:11</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

