import { useEffect, useRef } from 'react';

interface Props {
    // increment to trigger a burst
    trigger: number;
}

const COLORS = [
    '#3b82f6', '#60a5fa', '#38bdf8', '#7dd3fc',
    '#22c55e', '#4ade80', '#f59e0b', '#fbbf24',
    '#ffffff', '#bfdbfe', '#a5f3fc',
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

    // between 0 and 1, where 1 is fully alive and 0 is dead
    life: number; 

    decay: number;
}

const PARTICLE_COUNT = 80;

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function spawnParticle(side: 'left' | 'right', canvasW: number, canvasH: number): Particle {
    // spawn in the whitespace strips on the left or right of the centre game area
    // game cards occupy roughly the middle 60% of the screen
    // 18% strip on each side
    const sideW = canvasW * 0.18;
    const x = side === 'left'
    ? rand(0, sideW)
    : rand(canvasW - sideW, canvasW);
    const y = rand(canvasH * 0.1, canvasH * 0.5);

    return {
        x,
        y,
        vx: rand(-2.5, 2.5),
        vy: rand(-8, -3),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: rand(6, 13),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.15, 0.15),
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        alpha: 1,
        life: 1,
        decay: rand(0.008, 0.018),
    };
}

export function Confetti({ trigger }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const activeRef = useRef(false);

    useEffect(() => {
        if (trigger === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // resize canvas to full viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // spawn particles on both sides
        const newParticles: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            newParticles.push(
            spawnParticle(i % 2 === 0 ? 'left' : 'right', canvas.width, canvas.height),
            );
        }
        particlesRef.current = [...particlesRef.current, ...newParticles];

        // already animating
        if (activeRef.current) return;
        activeRef.current = true;

        const animate = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

            for (const p of particlesRef.current) {
                // gravity
                p.vy += 0.25; 
                p.x  += p.vx;
                p.y  += p.vy;
                p.rotation += p.rotSpeed;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life);

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                }
                ctx.restore();
            }

            if (particlesRef.current.length > 0) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                activeRef.current = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [trigger]);

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