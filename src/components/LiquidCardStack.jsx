import { useState } from 'react';

function LiquidCardStack() {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const cards = [
        {
            id: 1,
            title: 'The Ascent',
            artist: 'Generdyn',
            time: '3:23',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            gradient: 'from-cyan-400 to-blue-600',
        },
        {
            id: 2,
            title: 'Midnight Dreams',
            artist: 'Luna Wave',
            time: '4:15',
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
            gradient: 'from-purple-400 to-pink-600',
        },
        {
            id: 3,
            title: 'Ocean Breeze',
            artist: 'Coastal Sounds',
            time: '3:47',
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
            gradient: 'from-teal-400 to-emerald-600',
        },
        {
            id: 4,
            title: 'Neon Nights',
            artist: 'Synthwave Co.',
            time: '5:02',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            gradient: 'from-orange-400 to-red-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Header */}
            <div className="relative z-10 mb-12 text-center">
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Liquid Card Stack
                </h1>
                <p className="text-gray-400 text-lg">Apple-styled fluid design with glassmorphism</p>
            </div>

            {/* Card Stack Container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="relative" style={{ perspective: '1000px' }}>
                    {cards.map((card, index) => {
                        const isHovered = hoveredIndex === index;
                        const offset = index * 20;
                        const scale = 1 - index * 0.05;
                        const opacity = 1 - index * 0.15;

                        return (
                            <div
                                key={card.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="absolute w-full transition-all duration-700 ease-out cursor-pointer"
                                style={{
                                    transform: isHovered
                                        ? `translateY(${offset - 30}px) scale(${scale + 0.05}) rotateX(${index * 2}deg)`
                                        : `translateY(${offset}px) scale(${scale}) rotateX(0deg)`,
                                    zIndex: cards.length - index,
                                    opacity: isHovered ? 1 : opacity,
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* Liquid glow effect */}
                                <div
                                    className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${isHovered ? 'opacity-80 scale-105' : 'opacity-40'
                                        }`}
                                    style={{
                                        background: `linear-gradient(135deg, ${card.gradient.includes('cyan') ? '#06b6d4, #2563eb' :
                                            card.gradient.includes('purple') ? '#a855f7, #ec4899' :
                                                card.gradient.includes('teal') ? '#14b8a6, #059669' :
                                                    '#fb923c, #dc2626'
                                            })`,
                                    }}
                                ></div>

                                {/* Main card with glassmorphism */}
                                <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20`}></div>

                                    {/* Liquid shimmer effect */}
                                    <div
                                        className={`absolute inset-0 opacity-0 transition-opacity duration-700 ${isHovered ? 'opacity-30' : ''
                                            }`}
                                        style={{
                                            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                                            backgroundSize: '200% 200%',
                                            animation: isHovered ? 'shimmer 2s infinite' : 'none',
                                        }}
                                    ></div>

                                    {/* Card content */}
                                    <div className="relative p-6">
                                        <div className="flex items-center gap-5">
                                            {/* Album art with liquid border */}
                                            <div className="relative group">
                                                <div className={`absolute -inset-1 bg-gradient-to-br ${card.gradient} rounded-2xl blur-md transition-all duration-500 ${isHovered ? 'opacity-100 blur-lg' : 'opacity-60'
                                                    }`}></div>
                                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl">
                                                    <img
                                                        src={card.image}
                                                        alt={card.title}
                                                        className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Song info */}
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-lg mb-1 transition-all duration-500 ${isHovered ? 'text-white' : 'text-white/90'
                                                    }`}>
                                                    {card.title}
                                                </h3>
                                                <p className="text-sm text-gray-300/80">{card.artist}</p>
                                            </div>

                                            {/* Time and play button */}
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm text-gray-300/70">{card.time}</span>
                                                <button
                                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg transition-all duration-500 ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100'
                                                        }`}
                                                >
                                                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ${isHovered ? 'w-3/5' : 'w-1/3'
                                                    }`}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Spacer to prevent layout collapse */}
                <div style={{ height: `${cards.length * 20 + 200}px` }}></div>
            </div>

            {/* Add shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% -200%;
                    }
                    100% {
                        background-position: 200% 200%;
                    }
                }
            `}</style>
        </div>
    );
}

export default LiquidCardStack;
