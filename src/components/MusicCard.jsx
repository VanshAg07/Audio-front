import React, { useState, useRef } from 'react';

const Visualizer = React.memo(({ isPlaying, colors }) => {
    return (
        <div className="flex items-end gap-[2px] h-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                        background: colors ? colors[0] : '#3b82f6',
                        height: isPlaying ? '100%' : '30%',
                        animation: isPlaying ? `visualizer ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none',
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes visualizer {
                    0% { height: 20%; }
                    100% { height: 100%; }
                }
            `}</style>
        </div>
    );
});

const MusicCard = React.memo(function MusicCard({ card, onPlayStateChange, onDelete }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
        if (onPlayStateChange) onPlayStateChange(!isPlaying);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this recording?')) {
            onDelete(card.id);
        }
    };

    const colors = card.colors || ['#3b82f6', '#2dd4bf'];

    return (
        <div className="relative group">
            <audio ref={audioRef} src={card.url} onEnded={() => setIsPlaying(false)} />
            <div className="absolute -inset-1 rounded-2xl blur-xl opacity-20 transition-opacity" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }} />
            <div className={`relative backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden bg-white/5`}>
                <div className="flex items-center gap-3 p-1.5">
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={card.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'} alt={card.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{card.title}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-white/50">{card.artist}</p>
                            {isPlaying && <Visualizer isPlaying={isPlaying} colors={colors} />}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                        <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 hover:border-red-400/40 transition-all active:scale-90 group/del"
                            title="Delete recording"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover/del:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MusicCard;
