import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface Props {
  onStart: (name: string) => void;
}

export function NameEntry({ onStart }: Props) {
  const [name, setName] = useState('');
  const { playTick } = useSound();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) onStart(trimmed);
  };

  return (
    <div className="name-entry">
      <motion.div
        className="name-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="logo-group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="logo-icon">
            <Activity size={36} color="#4fc3f7" />
          </div>
          <div className="logo-text">
            <span className="logo-nhs">NHS</span>
            <span className="logo-sub">Higher or Lower</span>
          </div>
        </motion.div>

        <motion.p
          className="tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Can you guess which condition / disease sends more people to hospital?
        </motion.p>

        <motion.div
          className="name-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <label className="name-label">Enter your name to begin</label>
          <input
            className="name-input"
            type="text"
            placeholder="Your name…"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <motion.button
            className="start-btn"
            onClick={() => {
              playTick();
              handleSubmit();
            }}
            disabled={name.trim().length === 0}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Play <ChevronRight size={20} />
          </motion.button>
        </motion.div>

        <motion.p
          className="data-credit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Data: NHS HAPCA Hospital Admissions Dataset 1998–2024
        </motion.p>
      </motion.div>
    </div>
  );
}