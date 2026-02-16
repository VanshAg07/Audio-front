import { useState, useRef, useEffect } from 'react';

function AudioClipPlayer({ src, duration, onDelete }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };


    const handleSeek = (e) => {
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl transition-all hover:bg-white/10 group">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
            />

            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all active:scale-95 flex-shrink-0"
                >
                    {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Timeline / Progress Section */}
                <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-end text-[10px] uppercase tracking-widest font-bold text-white/30 mb-0.5">
                        <span className="text-blue-400/60">{formatTime(currentTime)}</span>
                        <span>{formatTime(audioRef.current?.duration || duration || 0)}</span>
                    </div>

                    <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={audioRef.current?.duration || duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer overflow-hidden accent-blue-500 outline-none transition-all group-hover:h-2"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 ${(currentTime / (audioRef.current?.duration || duration || 1)) * 100}%, rgba(255,255,255,0.1) 0%)`
                            }}
                        />
                    </div>
                </div>

                {/* Delete Button */}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400/40 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                        title="Delete clip"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>

            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                    cursor: pointer;
                    border: 2px solid #3b82f6;
                    transition: all 0.2s;
                    opacity: 0;
                }
                .group:hover input[type='range']::-webkit-slider-thumb {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}

export default AudioClipPlayer;
