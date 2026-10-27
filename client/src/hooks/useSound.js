import { useRef, useCallback } from 'react';
import { Howl } from 'howler';

// Free CDN sounds — swap for your own assets in /public/sounds
const SOUNDS = {
    correct: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    wrong: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2bcbe1e90a.mp3',
    click: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
    tick: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
    win: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9423b8f5f9.mp3',
};

export function useSound() {
    const sounds = useRef({});
    const muted = useRef(localStorage.getItem('muted') === 'true');

    if (Object.keys(sounds.current).length === 0) {
        Object.entries(SOUNDS).forEach(([key, src]) => {
            sounds.current[key] = new Howl({ src: [src], volume: 0.4, preload: true });
        });
    }

    const play = useCallback((name) => {
        if (muted.current) return;
        sounds.current[name]?.play();
    }, []);

    const toggleMute = useCallback(() => {
        muted.current = !muted.current;
        localStorage.setItem('muted', String(muted.current));
        return muted.current;
    }, []);

    return { play, toggleMute, isMuted: () => muted.current };
}