"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  Search,
  Home,
  Library,
  Settings,
  MoreHorizontal,
  Share2,
  Download,
  Clock,
  User,
  Music,
  Disc,
  ListMusic,
  Radio
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const MOCK_TRACKS = [
  { id: 1, title: "Neon Horizon", artist: "Synthwave Collective", album: "Cyber Dreams", duration: "3:45", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop", liked: true },
  { id: 2, title: "Midnight Drive", artist: "Lazer Boiz", album: "Outrun Nights", duration: "4:12", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&auto=format&fit=crop", liked: false },
  { id: 3, title: "Digital Rain", artist: "Vaporwave God", album: "Ethereal Plaza", duration: "2:58", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=300&auto=format&fit=crop", liked: true },
  { id: 4, title: "Binary Sunset", artist: "Retro Girl", album: "80's Future", duration: "3:21", cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop", liked: false },
  { id: 5, title: "Chrome Hearts", artist: "Steel Pulse", album: "Metal Veins", duration: "5:01", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop", liked: true },
];

const CATEGORIES = ["All", "Synthwave", "Chill", "Rock", "Pop", "Jazz"];

// --- Components ---

export default function InfinityMusicPlayer() {
  const [activeTab, setActiveTab] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [isLiked, setIsLiked] = useState(MOCK_TRACKS[0].liked);

  // Simulate progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayTrack = (track: typeof MOCK_TRACKS[0]) => {
    setCurrentTrack(track);
    setIsLiked(track.liked);
    setProgress(0);
    setIsPlaying(true);
    setShowFullPlayer(true);
  };

  const handleNext = () => {
    const currentIndex = MOCK_TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % MOCK_TRACKS.length;
    handlePlayTrack(MOCK_TRACKS[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = MOCK_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length;
    handlePlayTrack(MOCK_TRACKS[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden relative flex flex-col selection:bg-purple-500 selection:text-white">
      {/* --- Background Gradients & Effects --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex-1 flex flex-col h-screen pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView 
              key="home"
              onPlayTrack={handlePlayTrack} 
            />
          )}
          {activeTab === 'search' && (
            <SearchView key="search" />
          )}
          {activeTab === 'library' && (
            <LibraryView key="library" onPlayTrack={handlePlayTrack} />
          )}
        </AnimatePresence>
      </div>

      {/* --- Mini Player / Bottom Bar --- */}
      <MiniPlayer 
        track={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        onPlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onClick={() => setShowFullPlayer(true)}
      />

      {/* --- Navigation Bar --- */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* --- Full Screen Player Overlay --- */}
      <AnimatePresence>
        {showFullPlayer && (
          <FullPlayer 
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            isLiked={isLiked}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            volume={volume}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={() => setShowFullPlayer(false)}
            onToggleLike={() => setIsLiked(!isLiked)}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            onToggleRepeat={() => setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none')}
            onSeek={(p) => setProgress(p)}
            onVolumeChange={(v) => setVolume(v)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Views ---

function HomeView({ onPlayTrack }: { onPlayTrack: (t: any) => void }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 overflow-y-auto p-6 pb-4 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Welcome back</h2>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Listener</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/10 shadow-lg shadow-purple-500/20">
          <User size={18} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
              activeCategory === cat 
                ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Album */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10 rounded-3xl" />
        <div className="h-64 w-full rounded-3xl overflow-hidden relative group">
           <img 
             src={MOCK_TRACKS[0].cover} 
             alt="Featured" 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-900/30 to-transparent" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20">
           <span className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2 block">Featured Playlist</span>
           <h3 className="text-3xl font-black mb-4">Neon Nights Collection</h3>
           <button 
             onClick={() => onPlayTrack(MOCK_TRACKS[0])}
             className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
           >
             <Play size={20} fill="currentColor" /> Play Now
           </button>
        </div>
      </div>

      {/* Trending Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Trending Now</h3>
          <button className="text-purple-400 text-sm font-medium">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {MOCK_TRACKS.slice(0, 4).map((track, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={track.id}
              className="group cursor-pointer"
              onClick={() => onPlayTrack(track)}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                 <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/50 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                       <Play size={24} fill="black" className="ml-1" />
                    </div>
                 </div>
              </div>
              <h4 className="font-semibold truncate">{track.title}</h4>
              <p className="text-sm text-slate-400 truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recently Played List */}
      <div className="pb-8">
        <h3 className="text-xl font-bold mb-4">Recently Played</h3>
        <div className="space-y-4">
          {MOCK_TRACKS.map((track) => (
            <div 
              key={track.id} 
              className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => onPlayTrack(track)}
            >
              <img src={track.cover} alt={track.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate group-hover:text-purple-400 transition-colors">{track.title}</h4>
                <p className="text-sm text-slate-400 truncate">{track.artist}</p>
              </div>
              <div className="text-sm text-slate-500 font-medium">{track.duration}</div>
              <Heart size={18} className={cn("text-slate-500 hover:text-white transition-colors", track.liked && "fill-red-500 text-red-500")} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SearchView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold pt-4">Search</h2>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="What do you want to listen to?"
          className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Top Genres</h3>
        <div className="grid grid-cols-2 gap-3">
           {["Synthwave", "Pop", "Hip Hop", "Rock", "Jazz", "Classical"].map((genre, i) => (
             <div key={genre} className="h-20 rounded-xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center p-4 relative overflow-hidden group cursor-pointer border border-white/10">
                <span className="font-bold text-lg z-10">{genre}</span>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 group-hover:scale-110 transition-transform" />
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
}

function LibraryView({ onPlayTrack }: { onPlayTrack: (t: any) => void }){
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold pt-4">Your Library</h2>
      <div className="space-y-2">
        {MOCK_TRACKS.map(t => (
          <div key={t.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
            <img src={t.cover} alt={t.title} className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{t.title}</h4>
              <p className="text-sm text-slate-400 truncate">{t.artist}</p>
            </div>
            <Play size={24} className="text-green-400" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Components ---

function MiniPlayer({ track, isPlaying, progress, onPlay, onNext, onClick }) {
  return (
    <div className="absolute bottom-16 left-4 right-4 z-20">
      <div 
        onClick={onClick}
        className="bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-2xl cursor-pointer"
      >
        <motion.img 
          src={track.cover} alt={track.title}
          className="w-12 h-12 rounded-lg object-cover"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{track.title}</h4>
          <p className="text-xs text-slate-400 truncate">{track.artist}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); onPlay(); }} className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 px-6 pb-6 pt-4 z-30">
      <div className="flex justify-around items-center">
        {[ 
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'library', icon: Library, label: 'Library' },
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === item.id ? "text-white" : "text-slate-500"
            )}
          >
            <item.icon size={24} className={cn(activeTab === item.id && "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FullPlayer({
  track,
  isPlaying,
  progress,
  isLiked,
  isShuffle,
  repeatMode,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onClose,
  onToggleLike,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onVolumeChange
}: {
  track: typeof MOCK_TRACKS[0];
  isPlaying: boolean;
  progress: number;
  isLiked: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onToggleLike: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (p: number) => void;
  onVolumeChange: (v: number) => void;
}) {
  const [localProgress, setLocalProgress] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(Number(e.target.value));
  };

  const handleSeekCommit = () => {
    setIsDragging(false);
    onSeek(localProgress);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
    >
      {/* Dynamic Background based on art */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={track.cover} className="w-full h-full object-cover scale-150 opacity-30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-8">
          <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
            <SkipBack size={20} className="rotate-90" />
          </button>
          <div className="text-center">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Now Playing</p>
          </div>
          <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Artwork */}
        <div className="flex-1 flex items-center justify-center py-8">
          <motion.div 
            className="relative"
            animate={{ y: isPlaying ? [0, -10, 0] : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
             <div className="absolute inset-0 bg-purple-600/30 blur-[60px] rounded-full scale-90" />
             <motion.div
               className="w-72 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10"
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             >
               <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
             </motion.div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">{track.title}</h2>
            <p className="text-lg text-slate-400">{track.artist}</p>
          </div>
          <button onClick={onToggleLike} className="mt-2">
            <Heart size={28} className={cn("transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
             <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={isDragging ? localProgress : progress} 
               onChange={handleSeekChange}
               onMouseDown={() => setIsDragging(true)}
               onMouseUp={handleSeekCommit}
               onTouchStart={() => setIsDragging(true)}
               onTouchEnd={handleSeekCommit}
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
             />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onToggleShuffle} 
            className={cn("text-slate-400", isShuffle && "text-purple-500")}
          >
            <Shuffle size={22} />
          </button>
          
          <button onClick={onPrev}>
            <SkipForward size={32} className="rotate-180" />
          </button>
          
          <button 
            onClick={onTogglePlay}
            className="h-16 w-16 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button onClick={onNext}>
            <SkipForward size={32} />
          </button>
          
          <button 
            onClick={onToggleRepeat} 
            className={cn("text-slate-400", repeatMode !== 'none' && "text-purple-500")}
          >
            <Repeat size={22} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mb-8">
          {volume === 0 ? <VolumeX size={20} className="text-slate-400" /> : <Volume2 size={20} className="text-slate-400" />}
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 rounded-full" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
