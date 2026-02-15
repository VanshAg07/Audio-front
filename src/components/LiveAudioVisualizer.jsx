import { useRef, useEffect, useCallback } from 'react';

function LiveAudioVisualizer({
    mediaRecorder,
    width = 200,
    height = 60,
    barWidth = 3,
    gap = 2,
    barColor = '#22d3ee',
    fftSize = 512,
    smoothingTimeConstant = 0.8,
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const audioCtxRef = useRef(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const totalBarWidth = barWidth + gap;
        const barCount = Math.floor(canvas.width / totalBarWidth);
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step] || 0;
            const barHeight = (value / 255) * canvas.height * 0.9;
            const x = i * totalBarWidth;
            const y = (canvas.height - barHeight) / 2;

            ctx.fillStyle = barColor;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, Math.max(barHeight, 2), 1);
            ctx.fill();
        }

        animationRef.current = requestAnimationFrame(draw);
    }, [barWidth, gap, barColor]);

    useEffect(() => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;

        const source = audioCtx.createMediaStreamSource(mediaRecorder.stream);
        source.connect(analyser);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            source.disconnect();
            audioCtx.close();
        };
    }, [mediaRecorder, fftSize, smoothingTimeConstant, draw]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ width: `${width}px`, height: `${height}px` }}
        />
    );
}

export default LiveAudioVisualizer;
