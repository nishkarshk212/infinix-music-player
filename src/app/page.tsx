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
  Search as SearchIcon,
  Home,
  Library,
  MoreHorizontal,
  User,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchTrendingSongs, searchSongs, type Song } from '@/lib/youtubeMusicApi';

// Utility for cleaner classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'home' | 'search' | 'library';

const CATEGORIES = ["All", "Synthwave", "Chill", "Rock", "Pop", "Jazz"];

export default function InfinityMusicPlayer() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [volume, setVolume] = useState<number>(0.7);
  const [progress, setProgress] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [showFullPlayer, setShowFullPlayer] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [library, setLibrary] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch trending songs on mount
  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      const songs = await fetchTrendingSongs();
      setTrendingSongs(songs);
      if (songs.length > 0 && !currentTrack) {
        setCurrentTrack(songs[0]);
        setIsLiked(songs[0].liked);
      }
      setLoading(false);
    };
    loadTrending();
  }, []);

  // Search songs
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      const search = async () => {
        setSearching(true);
        const results = await searchSongs(searchQuery);
        setSearchResults(results);
        setSearching(false);
      };
      const timeoutId = setTimeout(search, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  // Audio player effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      if (isPlaying) {
        audioRef.current.src = currentTrack.audioUrl;
        audioRef.current.play().catch(err => console.error('Playback failed:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(progressPercent) ? 0 : progressPercent);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, handleNext]);

  const handlePlayTrack = (track: Song) => {
    setCurrentTrack(track);
    setIsLiked(track.liked);
    setProgress(0);
    setIsPlaying(true);
    setShowFullPlayer(true);
  };

  const handleNext = () => {
    const allSongs = activeTab === 'home' ? trendingSongs : activeTab === 'search' ? searchResults : library;
    if (allSongs.length === 0) return;
    
    let nextIndex = 0;
    if (currentTrack) {
      const currentIndex = allSongs.findIndex(t => t.id === currentTrack.id);
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * allSongs.length);
      } else {
        nextIndex = (currentIndex + 1) % allSongs.length;
      }
    }
    handlePlayTrack(allSongs[nextIndex]);
  };

  const handlePrev = () => {
    const allSongs = activeTab === 'home' ? trendingSongs : activeTab === 'search' ? searchResults : library;
    if (allSongs.length === 0 || !currentTrack) return;
    
    const currentIndex = allSongs.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    handlePlayTrack(allSongs[prevIndex]);
  };

  const toggleLike = () => {
    if (!currentTrack) return;
    
    setIsLiked(!isLiked);
    
    if (!isLiked && !library.find(s => s.id === currentTrack.id)) {
      setLibrary([...library, { ...currentTrack, liked: true }]);
    } else if (isLiked) {
      setLibrary(library.filter(s => s.id !== currentTrack.id));
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current && currentTrack) {
      const seekTime = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(value);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden relative flex flex-col selection:bg-purple-500 selection:text-white">
      {/* --- Background Gradients & Effects --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* --- Audio Element --- */}
      <audio ref={audioRef} />

      {/* --- Main Content --- */}
      <div className="relative z-10 flex-1 flex flex-col h-screen pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView 
              key="home"
              songs={trendingSongs}
              loading={loading}
              onPlayTrack={handlePlayTrack} 
            />
          )}
          {activeTab === 'search' && (
            <SearchView 
              key="search"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              searching={searching}
              onPlayTrack={handlePlayTrack}
            />
          )}
          {activeTab === 'library' && (
            <LibraryView 
              key="library"
              songs={library}
              onPlayTrack={handlePlayTrack}
            />
          )}
        </AnimatePresence>
      </div>

      {/* --- Mini Player / Bottom Bar --- */}
      {currentTrack && (
        <MiniPlayer 
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          onPlay={() => setIsPlaying(!isPlaying)}
          onClick={() => setShowFullPlayer(true)}
        />
      )}

      {/* --- Navigation Bar --- */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* --- Full Screen Player Overlay --- */}
      <AnimatePresence>
        {showFullPlayer && currentTrack && (
          <FullPlayer 
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            isLiked={isLiked}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            volume={volume}
            audioRef={audioRef}
            formatTime={formatTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={() => setShowFullPlayer(false)}
            onToggleLike={toggleLike}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            onToggleRepeat={() => setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none')}
            onSeek={handleSeek}
            onVolumeChange={(v) => setVolume(v)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Views ---

function HomeView({ songs, loading, onPlayTrack }: { songs: Song[], loading: boolean, onPlayTrack: (track: Song) => void }) {
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      ) : (
        <>
          {/* Featured Album */}
          {songs.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10 rounded-3xl" />
              <div className="h-64 w-full rounded-3xl overflow-hidden relative group">
                 <img 
                   src={songs[0].cover} 
                   alt="Featured" 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-900/30 to-transparent" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 z-20">
                 <span className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2 block">Featured Playlist</span>
                 <h3 className="text-3xl font-black mb-4 truncate">{songs[0].title}</h3>
                 <button 
                   onClick={() => onPlayTrack(songs[0])}
                   className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                 >
                   <Play size={20} fill="currentColor" /> Play Now
                 </button>
              </div>
            </div>
          )}

          {/* Trending Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Trending Now</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {songs.slice(0, 4).map((song, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={song.id}
                  className="group cursor-pointer"
                  onClick={() => onPlayTrack(song)}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                     <img src={song.cover} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/50 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                           <Play size={24} fill="black" className="ml-1" />
                        </div>
                     </div>
                  </div>
                  <h4 className="font-semibold truncate">{song.title}</h4>
                  <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recently Played List */}
          <div className="pb-8">
            <h3 className="text-xl font-bold mb-4">All Songs</h3>
            <div className="space-y-4">
              {songs.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
                  onClick={() => onPlayTrack(song)}
                >
                  <img src={song.cover} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate group-hover:text-purple-400 transition-colors">{song.title}</h4>
                    <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                  </div>
                  <div className="text-sm text-slate-500 font-medium">{song.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function SearchView({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  searching, 
  onPlayTrack 
}: { 
  searchQuery: string; 
  setSearchQuery: (q: string) => void; 
  searchResults: Song[]; 
  searching: boolean; 
  onPlayTrack: (track: Song) => void; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold pt-4">Search</h2>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="What do you want to listen to?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      {searching ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2">
          {searchResults.map((song) => (
            <div 
              key={song.id} 
              className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onPlayTrack(song)}
            >
              <img src={song.cover} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{song.title}</h4>
                <p className="text-sm text-slate-400 truncate">{song.artist}</p>
              </div>
              <Play size={24} className="text-green-400" />
            </div>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <div className="text-center text-slate-500 pt-8">
          No results found for "{searchQuery}"
        </div>
      ) : (
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
      )}
    </motion.div>
  );
}

function LibraryView({ songs, onPlayTrack }: { songs: Song[], onPlayTrack: (track: Song) => void }){
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold pt-4">Your Library</h2>
      {songs.length === 0 ? (
        <div className="text-center text-slate-500 pt-16">
          <Heart size={48} className="mx-auto mb-4 text-slate-700" />
          <p>No liked songs yet</p>
          <p className="text-sm">Like some songs to add them to your library!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <div key={song.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPlayTrack(song)}>
              <img src={song.cover} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{song.title}</h4>
                <p className="text-sm text-slate-400 truncate">{song.artist}</p>
              </div>
              <Play size={24} className="text-green-400" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// --- Components ---

function MiniPlayer({ 
  track, 
  isPlaying, 
  progress, 
  onPlay, 
  onClick 
}: { 
  track: Song; 
  isPlaying: boolean; 
  progress: number; 
  onPlay: () => void; 
  onClick: () => void; 
}) {
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

function BottomNav({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: Tab; 
  setActiveTab: (tab: Tab) => void; 
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 px-6 pb-6 pt-4 z-30">
      <div className="flex justify-around items-center">
        {[ 
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'search', icon: SearchIcon, label: 'Search' },
          { id: 'library', icon: Library, label: 'Library' },
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as Tab)}
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
  audioRef,
  formatTime,
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
  track: Song;
  isPlaying: boolean;
  progress: number;
  isLiked: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  formatTime: (seconds: number) => string;
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

  const currentTime = audioRef.current?.currentTime || 0;
  const duration = audioRef.current?.duration || 0;

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
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
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
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => onVolumeChange(Number(e.target.value))} 
              className="w-full h-full opacity-0 absolute cursor-pointer" 
            />
            <div className="h-full bg-white/50 rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
