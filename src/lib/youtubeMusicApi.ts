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

export const fetchTrendingSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending?key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch trending songs');
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
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to search songs');
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
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};
