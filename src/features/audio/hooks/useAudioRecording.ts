import { useState, useRef, useCallback } from 'react';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState<boolean>(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const warmUp = useCallback(async () => {
        if (mediaStream) return mediaStream; // Already warmed up

        setPermissionError(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);
            return stream;
        } catch (err) {
            console.error('Error warming up microphone:', err);
            setPermissionError(true);
            return null;
        }
    }, [mediaStream]);

    const startRecording = useCallback(async () => {
        setIsInitializing(true);
        setPermissionError(false);

        try {
            // Use existing stream if available (warmUp), otherwise get new one
            let stream = mediaStream;
            if (!stream || !stream.active) {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMediaStream(stream);
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);

                // Stop the stream tracks only on total stop, or let stopRecording handle it
                // Actually, if we want to "keep it warm", we might NOT stop the tracks immediately
                // but for security and battery we usually should if we aren't planning to record again soon.
                // For now, we follow the previous logic of stopping it on stop.
            };

            mediaRecorder.start();
            setIsRecording(true);
            return stream;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setPermissionError(true);
            setIsRecording(false);
            return null;
        } finally {
            setIsInitializing(false);
        }
    }, [mediaStream]);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    setAudioBlob(blob);

                    if (mediaStream) {
                        mediaStream.getTracks().forEach((track) => track.stop());
                        setMediaStream(null);
                    }

                    setIsRecording(false);
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                // Safe cleanup if stream exists but recorder didn't start
                if (mediaStream) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    setMediaStream(null);
                }
                setIsRecording(false);
                resolve(null);
            }
        });
    }, [mediaStream]);

    const resetAudio = useCallback(() => {
        setAudioBlob(null);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
    }, [mediaStream]);

    return {
        isRecording,
        isInitializing,
        audioBlob,
        startRecording,
        stopRecording,
        warmUp,
        resetAudio,
        mediaStream,
        permissionError,
    };
};
