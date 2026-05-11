import { motion } from 'framer-motion';

export function VsDivider() {
  return (
    <div className="vs-divider">
      <motion.div
        className="vs-pill"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <span className="vs-text">VS</span>
      </motion.div>
      {/* Vertical line top */}
      <motion.div
        className="vs-line vs-line-top"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      {/* Vertical line bottom */}
      <motion.div
        className="vs-line vs-line-bottom"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
    </div>
  );
}