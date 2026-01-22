'use client';

import {useCallback, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';

export type SlideMode = 'presenter' | 'viewer' | 'standalone';

interface UseSlideSyncOptions {
    mode: SlideMode;
    onSlideChange?: (slide: number, step: number) => void;
}

export function useSlideSync({mode, onSlideChange}: UseSlideSyncOptions) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [viewersCount, setViewersCount] = useState(0);

    useEffect(() => {
        if (mode === 'standalone') return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        const socketInstance = io(wsUrl);

        socketInstance.on('connect', () => {
            setIsConnected(true);

            if (mode === 'presenter') {
                socketInstance.emit('join-presenter');
            } else {
                socketInstance.emit('join-viewer');
            }
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        socketInstance.on('slide-update', ({currentSlide, currentStep}) => {
            if (mode === 'viewer') {
                onSlideChange?.(currentSlide, currentStep);
            }
        });

        socketInstance.on('viewers-count', (count: number) => {
            setViewersCount(count);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, [mode, onSlideChange]);

    const broadcastSlideChange = useCallback(
        (slide: number, step: number) => {
            if (socket && mode === 'presenter') {
                socket.emit('slide-change', {slide, step});
            }
        },
        [socket, mode]
    );

    return {
        isConnected,
        viewersCount,
        broadcastSlideChange,
    };
}