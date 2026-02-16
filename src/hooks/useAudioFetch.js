import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

const STYLES = [
    { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', colors: ['#06b6d4', '#2563eb'] },
    { image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', colors: ['#a855f7', '#ec4899'] },
    { image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', colors: ['#14b8a6', '#059669'] },
    { image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', colors: ['#fb923c', '#dc2626'] },
    { image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', colors: ['#6366f1', '#8b5cf6'] },
    { image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', colors: ['#f43f5e', '#e11d48'] },
    { image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=400&fit=crop', colors: ['#f59e0b', '#d97706'] },
    { image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop', colors: ['#1e40af', '#7c3aed'] },
    { image: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', colors: ['#06b6d4', '#10b981'] },
];

export const useAudioFetch = (token, username) => {
    const navigate = useNavigate();
    const [audioList, setAudioList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyAudio = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/my-audio`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch audio');

            const data = await response.json();
            const mappedData = data.map((item, index) => {
                const sequentialTitle = `Audio ${data.length - index}`;

                // Deterministic style based on ID so images don't shift when new items are added
                const idHash = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const styleIndex = idHash % STYLES.length;

                return {
                    id: item._id,
                    title: (item.originalname && item.originalname !== 'recording.webm')
                        ? item.originalname
                        : sequentialTitle,
                    artist: username,
                    url: item.url,
                    ...STYLES[styleIndex]
                };
            });

            setAudioList(mappedData);
        } catch (err) {
            console.error('Error fetching audio:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token, username, navigate]);

    const deleteAudio = useCallback(async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/my-audio/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to delete audio');

            setAudioList(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting audio:', err);
            setError(err.message);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchMyAudio();
    }, [fetchMyAudio]);

    return { audioList, isLoading, error, refetch: fetchMyAudio, deleteAudio };
};
