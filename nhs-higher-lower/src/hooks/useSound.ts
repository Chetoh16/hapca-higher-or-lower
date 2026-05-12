import { useCallback, useRef } from 'react';

// Correct sounds
import correct1 from '../assets/sounds/correct1.mp3';
import correct2 from '../assets/sounds/correct2.mp3';
import correct3 from '../assets/sounds/correct3.mp3';
import correct4 from '../assets/sounds/correct4.mp3';
import correct5 from '../assets/sounds/correct5.mp3';

// Wrong sounds
import wrong1 from '../assets/sounds/wrong1.mp3';
import wrong2 from '../assets/sounds/wrong2.mp3';
import wrong3 from '../assets/sounds/wrong3.mp3';
import wrong4 from '../assets/sounds/wrong4.mp3';
import wrong5 from '../assets/sounds/wrong5.mp3';
import wrong6 from '../assets/sounds/wrong6.mp3';
import wrong7 from '../assets/sounds/wrong7.mp3';

// Click/tick
import tick from '../assets/sounds/tick.mp3';

const correctSounds = [correct1, correct2, correct3, correct4, correct5];
const wrongSounds = [wrong1, wrong2, wrong3, wrong4, wrong5, wrong6, wrong7];

export function useSound() {
  const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const getRandom = (arr: string[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const play = (src: string, volume = 1) => {
    try {
      if (!cacheRef.current.has(src)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        cacheRef.current.set(src, audio);
      }

      // Clone allows overlapping playback
      const sound = cacheRef.current.get(src)!.cloneNode() as HTMLAudioElement;

      sound.volume = volume;
      sound.currentTime = 0;

      void sound.play();
    } catch {
      // Ignore audio errors
    }
  };

  const playCorrect = useCallback(() => {
    play(getRandom(correctSounds), 0.45);
  }, []);

  const playWrong = useCallback(() => {
    play(getRandom(wrongSounds), 0.55);
  }, []);

  const playTick = useCallback(() => {
    play(tick, 0.2);
  }, []);

  return {
    playCorrect,
    playWrong,
    playTick,
  };
}