import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import LiveAudioVisualizer from '../components/LiveAudioVisualizer';
import AudioClipPlayer from '../components/AudioClipPlayer';
import withAuth from '../hoc/withAuth';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { API_BASE_URL } from '../api/config';

function Listening({ token }) {
    const navigate = useNavigate();
    const {
        isRecording,
        recordingTime,
        mediaRecorder,
        permissionDenied,
        recordedClips,
        startRecording,
        stopRecording,
        deleteClip
    } = useAudioRecording();

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleClose = () => {
        if (isRecording) stopRecording();
        navigate('/');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleUpload = async () => {
        if (recordedClips.length === 0) return;

        setIsUploading(true);
        setUploadStatus('Combining and uploading...');

        try {
            const combinedBlob = new Blob(recordedClips.map(clip => clip.blob), { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('audio', combinedBlob, 'recording.webm');

            const response = await fetch(`${API_BASE_URL}/upload-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                setUploadStatus('Session expired. Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            setUploadStatus('Upload successful!');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Upload error:', err);
            setUploadStatus(`Upload failed: ${err.message}`);
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060B18] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-6 z-20">
                <h1 className="text-xl font-semibold">Listening</h1>
                <button
                    onClick={handleClose}
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content Area */}
            <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${recordedClips.length > 0 ? 'mt-[-10vh]' : 'mt-[-30px]'}`}>
                {/* Circle + aurora wrapper */}
                <div className="relative flex items-center justify-center">
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: '340px', height: '340px',
                            background: 'conic-gradient(from 0deg, #06d6a0, #22d3ee, #3b82f6, #8b5cf6, #c084fc, #a78bfa, #06d6a0)',
                            filter: 'blur(32px)',
                            opacity: isRecording ? 1 : 0.85,
                            animation: isRecording ? 'blobPulse1 1.5s ease-in-out infinite' : 'blobPulse1 3s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="relative flex items-center justify-center rounded-full bg-[#070B18] circle-breathe z-10"
                        style={{
                            width: '300px', height: '300px',
                            boxShadow: '0 0 60px 25px rgba(6, 11, 24, 0.95), inset 0 0 30px rgba(0,0,0,0.5)',
                        }}
                    >
                        {isRecording && mediaRecorder ? (
                            <div className="flex flex-col items-center gap-3">
                                <LiveAudioVisualizer
                                    mediaRecorder={mediaRecorder}
                                    width={200} height={60} barWidth={3} gap={2} barColor="#22d3ee"
                                />
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-2xl font-mono font-semibold tracking-wider text-white/90">
                                        {formatTime(recordingTime)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-16 h-16 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                                {recordedClips.length > 0 && (
                                    <span className="text-sm text-white/50">{recordedClips.length} clips recorded</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Clip List */}
                {recordedClips.length > 0 && !isRecording && (
                    <div className="mt-8 w-full max-w-lg flex flex-col gap-4 max-h-[40vh] overflow-y-auto px-4 custom-scrollbar">
                        {recordedClips.map((clip, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-2">
                                    <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest">Clip {index + 1}</span>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                </div>
                                <AudioClipPlayer
                                    src={clip.url}
                                    duration={clip.duration}
                                    onDelete={() => deleteClip(index)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {permissionDenied && (
                    <p className="mt-6 text-red-400 text-sm text-center">
                        Microphone access denied. Please allow microphone permission and try again.
                    </p>
                )}

                {uploadStatus && (
                    <p className={`mt-4 text-sm font-medium ${uploadStatus.includes('failed') ? 'text-red-400' : 'text-blue-400'}`}>
                        {uploadStatus}
                    </p>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-20">
                <div className="flex gap-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isUploading}
                        className={`liquid-glass-btn px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 flex items-center gap-3 ${isRecording ? 'liquid-glass-btn-stop text-red-400' : 'liquid-glass-btn-start text-white'
                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isRecording ? (
                            <><div className="w-4 h-4 rounded-sm bg-red-400" /> Stop Recording</>
                        ) : (
                            <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                {recordedClips.length > 0 ? 'Record Another Clip' : 'Start Recording'}</>
                        )}
                    </button>

                    {recordedClips.length > 0 && !isRecording && (
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            )}
                            Send to Server
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default withAuth(Listening);
