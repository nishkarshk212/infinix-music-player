const API_BASE_URL = 'https://youtube-api-music-production.up.railway.app';
const API_KEY = 'Fjs0FFlYvlaeCGBT4U~-luLmb404Sdun';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  liked: boolean;
}

// Mock data for demonstration
const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Neon Horizon',
    artist: 'Synthwave Collective',
    album: 'Cyber Dreams',
    duration: '3:45',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop',
    liked: true
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Lazer Boiz',
    album: 'Outrun Nights',
    duration: '4:12',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&auto=format&fit=crop',
    liked: false
  },
  {
    id: '3',
    title: 'Digital Rain',
    artist: 'Vaporwave God',
    album: 'Ethereal Plaza',
    duration: '2:58',
    cover: 'https://images.unsplash.com/photo-1493225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
    liked: true
  },
  {
    id: '4',
    title: 'Binary Sunset',
    artist: 'Retro Girl',
    album: '80\'s Future',
    duration: '3:21',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop',
    liked: false
  },
  {
    id: '5',
    title: 'Chrome Hearts',
    artist: 'Steel Pulse',
    album: 'Metal Veins',
    duration: '5:01',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
    liked: true
  }
];

export const fetchTrendingSongs = async (): Promise<Song[]> => {
  try {
    // First try to fetch from the real API
    const response = await fetch(`${API_BASE_URL}/trending?key=${API_KEY}`);
    if (response.ok) {
      const data = await response.json();
      return data.map((song: any) => ({
        id: song.id || song.videoId,
        title: song.title,
        artist: song.artists || song.artist,
        album: song.album || 'Unknown Album',
        duration: song.duration || '3:00',
        cover: song.thumbnail || song.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
        liked: false
      }));
    }
  } catch (error) {
    console.error('Error fetching trending songs from API, using mock data:', error);
  }
  
  // Fallback to mock data
  return MOCK_SONGS;
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    // First try to fetch from the real API
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&key=${API_KEY}`);
    if (response.ok) {
      const data = await response.json();
      return data.map((song: any) => ({
        id: song.id || song.videoId,
        title: song.title,
        artist: song.artists || song.artist,
        album: song.album || 'Unknown Album',
        duration: song.duration || '3:00',
        cover: song.thumbnail || song.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
        liked: false
      }));
    }
  } catch (error) {
    console.error('Error searching songs from API, using mock data:', error);
  }
  
  // Fallback to mock data
  return MOCK_SONGS.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  );
};
