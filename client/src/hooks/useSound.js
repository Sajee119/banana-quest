import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

// Free CDN sounds — swap for your own assets in /public/sounds
const SOUNDS = {
    correct: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    wrong: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2bcbe1e90a.mp3',
    click: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
    tick: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
    win: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9423b8f5f9.mp3',
};

function readMutedPreference() {
    try {
        return localStorage.getItem('muted') === 'true';
    } catch {
        return false;
    }
}

export function useSound() {
    const sounds = useRef({});
    const [muted, setMuted] = useState(readMutedPreference);
    const mutedRef = useRef(muted);

    useEffect(() => {
        mutedRef.current = muted;
    }, [muted]);

    useEffect(() => {
        const created = {};
        Object.entries(SOUNDS).forEach(([key, src]) => {
            created[key] = new Howl({ src: [src], volume: 0.4, preload: true });
        });
        sounds.current = created;

        return () => {
            Object.values(created).forEach((sound) => sound.unload());
            sounds.current = {};
        };
    }, []);

    const play = useCallback((name) => {
        if (mutedRef.current) return;
        sounds.current[name]?.play();
    }, []);

    const toggleMute = useCallback(() => {
        setMuted((prev) => {
            const next = !prev;
            mutedRef.current = next;
            try {
                localStorage.setItem('muted', String(next));
            } catch {
                // Storage can be unavailable (private mode); muting still works for this session.
            }
            return next;
        });
    }, []);

    return { play, toggleMute, muted };
}
