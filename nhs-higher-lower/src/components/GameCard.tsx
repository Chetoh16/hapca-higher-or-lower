import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Activity } from 'lucide-react';
import type { Block, MetricKey } from '../types';
import { METRICS } from '../types';
import { formatAdmissions, formatAdmissionsExact, getMetricValue } from '../utils/gameLogic';

interface Props {
    block: Block;
    side: 'left' | 'right';

    // right side shows value after guess
    revealed: boolean;

    metric: MetricKey;
    onHigher?: () => void;
    onLower?: () => void;
    isAnimating?: boolean;
    answerCorrect?: boolean | null;
}

export function GameCard({
    block,
    side,
    revealed,
    metric,
    onHigher,
    onLower,
    isAnimating,
    answerCorrect,
    }: Props) {
    const value = getMetricValue(block, metric);
    const metricConfig = METRICS.find((m) => m.key === metric)!;

    return (
    <motion.div
        className={`game-card game-card--${side}`}
        layout
        initial={side === 'right' ? { x: 80, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
        {/* Background decoration */}
        <div className="card-bg-glow" />

        {/* ICD block badge */}
        <div className="card-icd-badge">{block.blockID}</div>

        {/* Category name */}
        <div className="card-category">{block.category}</div>

        {/* Chapter tag */}
        {/* Not really needed */}
        {/* <div className="card-chapter">{block.chapter}</div> */}

        {/* Metric label */}
        <div className="card-metric-label">
        <Activity size={13} />
        {metricConfig.description}
        </div>

        {/* Admissions value */}
        <AnimatePresence mode="wait">
        {side === 'left' || revealed ? (
            <motion.div
            key="value"
            className="card-value"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            >
            <span className="card-value-number">{formatAdmissions(value)}</span>
            <span className="card-value-exact">
                ({formatAdmissionsExact(value)} admissions)
            </span>

            {/* Correct / wrong flash */}
            {revealed && answerCorrect !== null && (
                <motion.div
                className={`card-result-badge ${answerCorrect ? 'correct' : 'wrong'}`}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                {answerCorrect ? '✓ Correct!' : '✗ Wrong'}
                </motion.div>
            )}
            </motion.div>
        ) : (
            <motion.div
            key="hidden"
            className="card-value card-value--hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            >
            <span className="card-value-question">?</span>
            <span className="card-value-hint">
                Total NHS admissions 1998–2025
            </span>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Higher / Lower buttons */}
        {side === 'right' && !revealed && (
        <motion.div
            className="card-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
        >
            <motion.button
            className="guess-btn guess-btn--higher"
            onClick={onHigher}
            disabled={isAnimating}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            >
            <ChevronUp size={20} strokeWidth={2.5} />
            Higher
            </motion.button>
            <motion.button
            className="guess-btn guess-btn--lower"
            onClick={onLower}
            disabled={isAnimating}
            whileHover={{ scale: 1.05, y: 2 }}
            whileTap={{ scale: 0.96 }}
            >
            <ChevronDown size={20} strokeWidth={2.5} />
            Lower
            </motion.button>
        </motion.div>
        )}
    </motion.div>
    );
}