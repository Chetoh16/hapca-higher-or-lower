import { useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';

interface Props {
    // increment to trigger a burst
    trigger: number;
}

const COLORS = [
    '#3b82f6',
    '#60a5fa',
    '#38bdf8',
    '#7dd3fc',
    '#22c55e',
    '#4ade80',
    '#f59e0b',
    '#fbbf24',
    '#ffffff',
    '#bfdbfe',
    '#a5f3fc',
];

interface Particle {
    x: number;
    y: number;

    vx: number;
    vy: number;

    color: string;
    size: number;

    rotation: number;
    rotSpeed: number;

    shape: 'rect' | 'circle';

    alpha: number;

    age: number;
    maxLife: number;

    fadeInDuration: number;
    fadeOutDuration: number;
}

const PARTICLE_COUNT = 80;

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function spawnParticle(
    side: 'left' | 'right',
    canvasW: number,
    canvasH: number
): Particle {
    // spawn in whitespace regions beside the game cards
    const sideW = canvasW * 0.18;

    const x =
        side === 'left'
            ? rand(0, sideW)
            : rand(canvasW - sideW, canvasW);

    const y = rand(canvasH * 0.15, canvasH * 0.55);

    return {
        x,
        y,

        // gentler motion
        vx: rand(-1.2, 1.2),
        vy: rand(-3.5, -1.5),

        color: COLORS[Math.floor(Math.random() * COLORS.length)],

        size: rand(7, 15),

        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.05, 0.05),

        shape: Math.random() > 0.35 ? 'rect' : 'circle',

        // start invisible for fade-in
        alpha: 0,

        age: 0,

        // lasts longer
        maxLife: rand(220, 340),

        // fade timings
        fadeInDuration: 30,
        fadeOutDuration: 90,
    };
}

export function Confetti({ trigger }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const particlesRef = useRef<Particle[]>([]);

    const rafRef = useRef<number>(0);

    const activeRef = useRef(false);

    const { playConfetti } = useSound();

    useEffect(() => {
        if (trigger === 0) return;

        playConfetti();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // resize canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // spawn particles
        const newParticles: Particle[] = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            newParticles.push(
                spawnParticle(
                    i % 2 === 0 ? 'left' : 'right',
                    canvas.width,
                    canvas.height
                )
            );
        }

        particlesRef.current = [
            ...particlesRef.current,
            ...newParticles,
        ];

        // already animating
        if (activeRef.current) return;

        activeRef.current = true;

        const animate = () => {
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // remove dead particles
            particlesRef.current =
                particlesRef.current.filter(
                    (p) => p.age < p.maxLife
                );

            for (const p of particlesRef.current) {
                p.age += 1;

                // gentle gravity
                p.vy += 0.045;

                // movement
                p.x += p.vx;
                p.y += p.vy;

                // air resistance
                p.vx *= 0.995;
                p.vy *= 0.995;

                p.rotation += p.rotSpeed;

                // fade in
                if (p.age < p.fadeInDuration) {
                    p.alpha =
                        p.age / p.fadeInDuration;
                }

                // fade out
                else if (
                    p.age >
                    p.maxLife - p.fadeOutDuration
                ) {
                    const remaining =
                        p.maxLife - p.age;

                    p.alpha =
                        remaining / p.fadeOutDuration;
                }

                // fully visible middle phase
                else {
                    p.alpha = 1;
                }

                p.alpha = Math.max(
                    0,
                    Math.min(1, p.alpha)
                );

                ctx.save();

                ctx.globalAlpha = p.alpha;

                ctx.translate(p.x, p.y);

                ctx.rotate(p.rotation);

                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();

                    ctx.arc(
                        0,
                        0,
                        p.size / 2,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                } else {
                    ctx.fillRect(
                        -p.size / 2,
                        -p.size / 4,
                        p.size,
                        p.size / 2
                    );
                }

                ctx.restore();
            }

            if (particlesRef.current.length > 0) {
                rafRef.current =
                    requestAnimationFrame(animate);
            } else {
                activeRef.current = false;

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
            }
        };

        cancelAnimationFrame(rafRef.current);

        rafRef.current =
            requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [trigger, playConfetti]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}