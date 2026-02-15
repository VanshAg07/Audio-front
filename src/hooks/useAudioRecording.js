import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [recordedClips, setRecordedClips] = useState([]);

    const timerRef = useRef(null);
    const timeRef = useRef(0);
    const chunksRef = useRef([]);
    const clipsRef = useRef([]);

    // Keep clipsRef in sync for cleanup
    useEffect(() => {
        clipsRef.current = recordedClips;
    }, [recordedClips]);

    const startRecording = useCallback(async () => {
        try {
            setPermissionDenied(false);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedClips(prev => [...prev, { blob, url, duration: timeRef.current }]);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            timeRef.current = 0;
        } catch (err) {
            console.error('Microphone permission denied:', err);
            setPermissionDenied(true);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
        setMediaRecorder(null);
        setIsRecording(false);
    }, [mediaRecorder]);

    const deleteClip = useCallback((index) => {
        setRecordedClips(prev => {
            const clipToDelete = prev[index];
            if (clipToDelete?.url) URL.revokeObjectURL(clipToDelete.url);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const clearClips = useCallback(() => {
        recordedClips.forEach(clip => {
            if (clip.url) URL.revokeObjectURL(clip.url);
        });
        setRecordedClips([]);
    }, [recordedClips]);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    const next = prev + 1;
                    timeRef.current = next;
                    return next;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    useEffect(() => {
        return () => {
            clipsRef.current.forEach(clip => {
                if (clip.url) URL.revokeObjectURL(clip.url);
            });
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [mediaRecorder]);

    return {
        isRecording,
        recordingTime,
        mediaRecorder,
        permissionDenied,
        recordedClips,
        startRecording,
        stopRecording,
        deleteClip,
        clearClips,
        setRecordedClips
    };
};
