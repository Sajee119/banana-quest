import { motion } from 'framer-motion';

export default function Confetti({ count = 40 }) {
    const colors = ['#FFDD48', '#F5A800', '#22c55e', '#ef4444', '#3b82f6', '#a855f7'];
    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {[...Array(count)].map((_, i) => (
                <motion.div
                key={i}
                initial={{ x: '50vw', y: '30vh', scale: 1, opacity: 1 }}
                animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100 + 50}vh`,
                    rotate: Math.random() * 720,
                    opacity: 0,
                }}
                transition={{ duration: 1.8 + Math.random(), ease: 'easeOut' }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[i % colors.length] }}
                />
            ))}
        </div>
    );
}