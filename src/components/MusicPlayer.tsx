import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Pulse',
    artist: 'AI Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Cyber Dreams',
    artist: 'Neural Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1633545505417-709de7688001?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Synth Wave Escape',
    artist: 'Digital Echo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl w-full max-w-md neon-border-blue transition-all duration-300">
      <div className="flex flex-col items-center space-y-6">
        {/* Album Art */}
        <div className="relative w-48 h-48 group">
          <motion.div
            key={currentTrackIndex}
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
            className="w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 border-neon-blue/20"
          >
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
            )}
          </motion.div>
          {!isPlaying && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <Play className="w-12 h-12 text-white fill-current opacity-70" />
             </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center w-full">
          <h3 className="text-xl font-bold text-white neon-glow-blue truncate">
            {currentTrack.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-1 flex items-center justify-center gap-2">
            <MusicIcon className="w-3 h-3" />
            {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-8">
          <button
            onClick={skipBackward}
            className="text-zinc-400 hover:text-neon-blue transition-colors outline-none cursor-pointer"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-neon-blue text-zinc-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
          <button
            onClick={skipForward}
            className="text-zinc-400 hover:text-neon-blue transition-colors outline-none cursor-pointer"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-3 w-full px-4">
          <Volume2 className="w-5 h-5 text-zinc-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
          />
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={skipForward}
        />
      </div>
    </div>
  );
}
