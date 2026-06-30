import { useCallback, useRef, useEffect } from 'react';

// C=correct sounds
import correct1 from '../assets/sounds/correct1.mp3';
import correct2 from '../assets/sounds/correct2.mp3';
import correct3 from '../assets/sounds/correct3.mp3';
import correct4 from '../assets/sounds/correct4.mp3';

// wrong sounds
import wrong1 from '../assets/sounds/wrong1.mp3';
import wrong2 from '../assets/sounds/wrong2.mp3';
import wrong3 from '../assets/sounds/wrong3.mp3';
import wrong4 from '../assets/sounds/wrong4.mp3';
import wrong5 from '../assets/sounds/wrong5.mp3';
import wrong6 from '../assets/sounds/wrong6.mp3';
import wrong7 from '../assets/sounds/wrong7.mp3';

// click/tick
import tick from '../assets/sounds/tick.mp3';

// confetti sounds
import confetti1 from '../assets/sounds/confetti1.mp3';
import confetti2 from '../assets/sounds/confetti2.mp3';
import confetti3 from '../assets/sounds/confetti3.mp3';
import confetti4 from '../assets/sounds/confetti4.mp3';
import confetti5 from '../assets/sounds/confetti5.mp3';
import confetti6 from '../assets/sounds/confetti6.mp3';


const correctSounds = [correct1, correct2, correct3, correct4];
const wrongSounds = [wrong1, wrong2, wrong3, wrong4, wrong5, wrong6, wrong7];
const confettiSounds = [confetti1, confetti2, confetti3, confetti4, confetti5, confetti6];

export function useSound() {
  const getRandom = (arr: string[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // load all sounds once when hook starts
  useEffect(() => {
    [...correctSounds, ...wrongSounds, ...confettiSounds, tick]
      .forEach(src => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.load();
      });
  }, []);

  const play = (src: string, volume = 1) => {
    const sound = new Audio(src);
    sound.volume = volume;

    void sound.play().catch(() => {
      // ignore autoplay / browser restrictions
    });
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

  const playConfetti = useCallback(() => {
    play(getRandom(confettiSounds), 0.6);
  }, []);

  return {
    playCorrect,
    playWrong,
    playTick,
    playConfetti,
  };
}