import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronDown, Play, Trophy } from 'lucide-react';
import type { MetricKey, GranularityKey } from '../types';
import { METRICS, GRANULARITIES } from '../types';

interface Props {
  onPlay: (metric: MetricKey, granularity: GranularityKey) => void;
  onLeaderboard: () => void;
  highScore: number;
}

// Replace with your real YouTube video ID
const YOUTUBE_VIDEO_ID = '-iPyuSVeKGY';


export function HomePage({ onPlay, onLeaderboard, highScore }: Props) {
  const [metric, setMetric] = useState<MetricKey>('fce_total');
  const [granularity, setGranularity] = useState<GranularityKey>('block');
  const [metricOpen, setMetricOpen] = useState(false);
  const [granOpen, setGranOpen] = useState(false);

  const selectedMetric = METRICS.find((m) => m.key === metric)!;
  const selectedGran = GRANULARITIES.find((g) => g.key === granularity)!;

  return (
    <div className="home-root">
      <motion.header
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="home-logo-row">
          <div className="logo-icon">
            <Activity size={28} color="#4fc3f7" />
          </div>
          <div className="home-title-block">
            <span className="home-team">TEAM 3</span>
            <span className="home-project">Visualisation of Health Data</span>
          </div>
        </div>

        <motion.button
          className="home-lb-btn"
          onClick={onLeaderboard}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Trophy size={15} />
          Leaderboard
          {highScore > 0 && <span className="home-lb-score">{highScore}</span>}
        </motion.button>
      </motion.header>

      <div className="home-body">
        {/* Left: info + settings */}
        <motion.div
          className="home-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div className="home-eyebrow">NHS Higher or Lower</div>
          <h1 className="home-headline">
            Which condition sends <em>more</em> people to hospital?
          </h1>
          <p className="home-desc">
            Guess whether the right-hand NHS condition has <strong>higher</strong> or{' '}
            <strong>lower</strong> hospital admissions than the left. Every correct answer is one point, but one wrong answer
            and you're back to zero. Try your best!
          </p>

          {/* Settings dropdowns */}
          <div className="home-settings">
            <div className="home-setting-label">Game settings</div>

            {/* Metric dropdown */}
            <div className="home-dropdown-wrap">
              <div className="home-dropdown-label">Measure</div>
              <div className="home-dropdown" onClick={() => { setMetricOpen((o) => !o); setGranOpen(false); }}>
                <div className="home-dropdown-selected">
                  <span className="home-dropdown-value">{selectedMetric.label}</span>
                  <ChevronDown size={16} className={`home-dropdown-chevron ${metricOpen ? 'open' : ''}`} />
                </div>
                {metricOpen && (
                  <motion.div
                    className="home-dropdown-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {METRICS.map((m) => (
                      <div
                        key={m.key}
                        className={`home-dropdown-item ${m.key === metric ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setMetric(m.key); setMetricOpen(false); }}
                      >
                        <span className="home-dropdown-item-label">{m.label}</span>
                        <span className="home-dropdown-item-desc">{m.description}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Granularity dropdown */}
            <div className="home-dropdown-wrap">
              <div className="home-dropdown-label">Detail level</div>
              <div className="home-dropdown" onClick={() => { setGranOpen((o) => !o); setMetricOpen(false); }}>
                <div className="home-dropdown-selected">
                  <span className="home-dropdown-value">{selectedGran.label}</span>
                  <ChevronDown size={16} className={`home-dropdown-chevron ${granOpen ? 'open' : ''}`} />
                </div>
                {granOpen && (
                  <motion.div
                    className="home-dropdown-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {GRANULARITIES.map((g) => (
                      <div
                        key={g.key}
                        className={`home-dropdown-item ${g.key === granularity ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setGranularity(g.key); setGranOpen(false); }}
                      >
                        <span className="home-dropdown-item-label">{g.label}</span>
                        <span className="home-dropdown-item-desc">{g.description}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Play button */}
          <motion.button
            className="home-play-btn"
            onClick={() => onPlay(metric, granularity)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play size={20} fill="currentColor" />
            Play Now
          </motion.button>
          
        </motion.div>

        {/* Right: video embed */}
        <motion.div
          className="home-right"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          <div className="home-video-card">
            <div className="home-video-label">
              <Activity size={13} /> Full Coursework Presentation
            </div>
            <div className="home-video-wrap">
              <iframe
                className="home-video-iframe"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
                title="Team 3 Coursework Presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="home-video-caption">
              This game is a taster for our full data visualisation of NHS hospital
              admissions from 1998 to 2024.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <span className="home-footer-author">By : Ege Cetin (psyec7)</span>
        <span className="home-footer-dataset">NHS HAPCA Hospital Admissions Dataset · 1998–2024 </span>
        <span className="home-footer-author">Team 3 - Visualisation of Health Data</span>
      </footer>
    </div>
  );
}