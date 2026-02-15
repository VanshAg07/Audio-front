import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useCallback, useEffect } from 'react';
import withAuth from '../hoc/withAuth';
import { useAudioFetch } from '../hooks/useAudioFetch';
import { useAuth } from '../hooks/useAuth';
import MusicCard from '../components/MusicCard';

function IdentifyingSongs({ token, username }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const { audioList, isLoading } = useAudioFetch(token, username);
    const { logout } = useAuth();

    // Refs for direct DOM manipulation (no re-renders during gesture)
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const visualizerRef = useRef(null);
    const headerRef = useRef(null);
    const hintRef = useRef(null);
    const stackContainerRef = useRef(null);
    const musicSectionRef = useRef(null);
    const stackCardRefs = useRef([]);

    const progress = useRef(0);
    const touchStartY = useRef(null);
    const animFrame = useRef(null);
    const isCollapsing = useRef(false);
    const wheelAccum = useRef(0);
    const wheelTimeout = useRef(null);
    const isAnimating = useRef(false);

    const MAX_STACK_VISIBLE = 4;

    const handleLogout = () => {
        logout();
    };

    // ---- Direct DOM update (runs every frame during gesture, no setState) ----
    const applyProgress = useCallback((p) => {
        const viz = visualizerRef.current;
        if (viz) {
            const vizOpacity = 1 - p * 2;
            const vizScale = 1 - p * 0.5;
            const vizTransY = -p * 100;
            viz.style.opacity = Math.max(0, vizOpacity);
            viz.style.transform = `translate3d(0,${vizTransY}px,0) scale(${vizScale})`;
            viz.style.flex = `${1 - p}`;
            viz.style.pointerEvents = p > 0.5 ? 'none' : 'auto';
        }

        const hdr = headerRef.current;
        if (hdr) {
            hdr.style.transform = `translate3d(0,-${p * 50}px,0)`;
            hdr.style.opacity = 1 - p * 1.5;
        }

        const hint = hintRef.current;
        if (hint) hint.style.opacity = Math.max(0, 1 - p * 4);

        const ms = musicSectionRef.current;
        if (ms) {
            const travelDistance = -80;
            ms.style.transform = `translate3d(0,${p * travelDistance}px,0)`;
            ms.style.flex = `${p}`;
        }

        stackCardRefs.current.forEach((el, index) => {
            if (!el) return;
            const isVisibleInStack = index < MAX_STACK_VISIBLE;

            // Stack position (p=0)
            const stackOffset = isVisibleInStack ? index * 14 : (MAX_STACK_VISIBLE - 1) * 14;
            const stackScale = isVisibleInStack ? 1 - index * 0.035 : 1 - (MAX_STACK_VISIBLE - 1) * 0.035;
            const stackOpacity = index === 0 ? 1 : (isVisibleInStack ? 1 - index * 0.2 : 0);

            // List position (p=1)
            const listOffset = index * 88;
            const listScale = 1;
            const listOpacity = 1;

            // Interpolation
            const indexDelay = index * 0.02;
            const itemP = Math.max(0, Math.min(1, (p - indexDelay) / (1 - indexDelay || 1)));
            const easedItemP = 1 - Math.pow(1 - itemP, 3);

            const translateY = stackOffset + (listOffset - stackOffset) * easedItemP;
            const scale = stackScale + (listScale - stackScale) * easedItemP;
            const opacity = stackOpacity + (listOpacity - stackOpacity) * easedItemP;

            el.style.transform = `translate3d(0,${translateY}px,0) scale(${scale})`;
            el.style.opacity = opacity;
            el.style.zIndex = audioList.length - index;

            if (opacity > 0.01) {
                el.style.visibility = 'visible';
            } else if (!isVisibleInStack) {
                el.style.visibility = 'hidden';
            }
        });

        const sc = stackContainerRef.current;
        if (sc) {
            const baseHeight = MAX_STACK_VISIBLE * 14 + 88;
            const fullHeight = window.innerHeight - 120;
            const targetHeight = baseHeight + (fullHeight - baseHeight) * p;
            sc.style.height = `${targetHeight}px`;
        }
    }, [audioList.length]);

    // ---- Snap animation to 0 or 1 ----
    const animateTo = useCallback((target) => {
        if (animFrame.current) cancelAnimationFrame(animFrame.current);
        isAnimating.current = true;
        const start = progress.current;
        const startTime = performance.now();
        const distance = Math.abs(target - start);
        const duration = Math.max(250, distance * 500);

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 5);
            const value = start + (target - start) * eased;
            progress.current = value;
            applyProgress(value);

            if (t < 1) {
                animFrame.current = requestAnimationFrame(step);
            } else {
                progress.current = target;
                applyProgress(target);
                isCollapsing.current = false;
                isAnimating.current = false;
                setExpanded(target === 1);
            }
        };
        animFrame.current = requestAnimationFrame(step);
    }, [applyProgress]);

    const handleStartListening = () => {
        if (!expanded && progress.current < 0.2) {
            navigate('/listening');
        }
    };

    // ---- Touch/Wheel handlers ----
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        if (animFrame.current) cancelAnimationFrame(animFrame.current);
        isAnimating.current = true;
    };

    const handleTouchMove = (e) => {
        if (touchStartY.current === null) return;
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY.current - currentY;

        if (expanded && !isCollapsing.current) {
            const sc = stackContainerRef.current;
            if (sc && sc.scrollTop > 0) {
                isAnimating.current = false;
                return;
            }
            if (deltaY < -5) {
                isCollapsing.current = true;
                e.preventDefault();
            } else {
                return;
            }
        }

        e.preventDefault();
        isAnimating.current = true;

        let p;
        if (isCollapsing.current) {
            p = Math.max(0, Math.min(1, 1 - Math.abs(deltaY) / 300));
        } else {
            p = Math.max(0, Math.min(1, deltaY / 300));
        }

        progress.current = p;
        applyProgress(p);
    };

    const handleTouchEnd = () => {
        touchStartY.current = null;
        const threshold = isCollapsing.current ? 0.7 : 0.3;
        animateTo(progress.current > threshold ? 1 : 0);
        isCollapsing.current = false;
    };

    const handleWheel = (e) => {
        const sc = stackContainerRef.current;
        if (expanded && !isCollapsing.current) {
            if ((sc && sc.scrollTop > 0) || e.deltaY > 0) {
                isAnimating.current = false;
                return;
            }
            isCollapsing.current = true;
        }

        if (isCollapsing.current || !expanded) {
            e.preventDefault();
            isAnimating.current = true;
            if (animFrame.current) cancelAnimationFrame(animFrame.current);

            wheelAccum.current += e.deltaY;
            const sensitivity = 400;
            const p = expanded
                ? Math.max(0, Math.min(1, 1 - wheelAccum.current / sensitivity))
                : Math.max(0, Math.min(1, wheelAccum.current / sensitivity));

            progress.current = p;
            applyProgress(p);

            if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
            wheelTimeout.current = setTimeout(() => {
                const threshold = expanded ? 0.7 : 0.3;
                animateTo(progress.current > threshold ? 1 : 0);
                wheelAccum.current = 0;
                isCollapsing.current = false;
            }, 150);
        }
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('wheel', handleWheel);
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleWheel]);

    useEffect(() => {
        if (!expanded && listRef.current) listRef.current.scrollTop = 0;
        if (!isAnimating.current) applyProgress(expanded ? 1 : 0);
    }, [expanded, applyProgress, audioList.length]);

    return (
        <div
            ref={containerRef}
            className="h-screen bg-[#070B1A] text-white flex flex-col relative overflow-hidden select-none"
            style={{ touchAction: 'none' }}
        >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div ref={headerRef} className="flex justify-between items-start px-6 pt-6 pb-2 relative z-20 flex-shrink-0">
                <div>
                    <h1 className="text-[28px] font-bold transition-all duration-300" style={{ opacity: expanded ? 0.6 : 1, transform: `scale(${expanded ? 0.9 : 1})` }}>
                        Identifying
                    </h1>
                    <h2 className="text-[28px] font-bold -mt-1">
                        {expanded ? 'My Music' : 'Songs'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                        <img src={`https://i.pravatar.cc/150?u=${username}`} alt="User" />
                    </div>
                </div>
            </div>

            {/* Visualizer */}
            <div ref={visualizerRef} className="flex items-center justify-center relative z-10 min-h-0 overflow-hidden" style={{ flex: 1 }}>
                <button onClick={handleStartListening} className="relative flex items-center justify-center">
                    <div className="absolute rounded-full w-[270px] h-[270px] bg-blue-500/20 blur-[28px] animate-pulse" />
                    <div className="relative rounded-full bg-[#080C1A] z-10 flex items-center justify-center w-[230px] h-[230px] shadow-2xl border border-white/5">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Music List Container */}
            <div
                ref={musicSectionRef}
                className="relative z-10 px-6 pb-6 flex flex-col flex-shrink-0 will-change-transform"
                style={{
                    flex: expanded ? '1' : '0 0 auto',
                    minHeight: expanded ? '0' : 'auto',
                    transition: expanded && !isAnimating.current ? 'flex 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">My Music</h3>
                    <button className="text-sm text-blue-400 font-medium">View all</button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div
                        ref={stackContainerRef}
                        className={`relative scrollbar-hide ${expanded ? 'overflow-y-auto' : 'overflow-hidden'}`}
                        style={{
                            height: expanded ? 'auto' : `${MAX_STACK_VISIBLE * 14 + 88}px`,
                            maxHeight: expanded ? '100%' : 'none'
                        }}
                    >
                        <style>{`
                            .scrollbar-hide::-webkit-scrollbar { display: none; }
                            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                        `}</style>
                        <div ref={listRef} className="flex flex-col gap-3 min-h-full pb-10">
                            {audioList.map((card, index) => (
                                <div
                                    key={card.id}
                                    ref={(el) => { stackCardRefs.current[index] = el; }}
                                    className="absolute w-full left-0 origin-center will-change-transform"
                                    style={{
                                        transform: `translate3d(0,${index < MAX_STACK_VISIBLE ? index * 14 : (MAX_STACK_VISIBLE - 1) * 14}px,0) scale(${index < MAX_STACK_VISIBLE ? 1 - index * 0.035 : 1 - (MAX_STACK_VISIBLE - 1) * 0.035})`,
                                        zIndex: audioList.length - index,
                                        opacity: index === 0 ? 1 : (index < MAX_STACK_VISIBLE ? 1 - index * 0.2 : 0)
                                    }}
                                >
                                    <MusicCard card={card} />
                                </div>
                            ))}
                            {audioList.length === 0 && <p className="text-center text-white/20 py-10">No recordings yet</p>}
                        </div>
                    </div>
                )}
            </div>

            {!expanded && (
                <div ref={hintRef} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50">
                    <div className="w-8 h-1 rounded-full bg-white/20 animate-bounce" />
                    <span className="text-[10px] tracking-widest uppercase">Swipe up</span>
                </div>
            )}

            {expanded && (
                <button className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 text-sm"
                    onClick={() => animateTo(0)}>↓ Collapse</button>
            )}
        </div>
    );
}

export default withAuth(IdentifyingSongs);
