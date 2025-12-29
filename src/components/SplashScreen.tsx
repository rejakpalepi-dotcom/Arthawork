import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
    onComplete: () => void;
    minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Give animation time to complete
            setTimeout(onComplete, 500);
        }, minDuration);

        return () => clearTimeout(timer);
    }, [minDuration, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="flex flex-col items-center gap-6">
                        {/* Animated Logo */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                                scale: { type: "spring", damping: 15, stiffness: 100 },
                            }}
                            className="relative"
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1 }}
                                transition={{ duration: 1, delay: 0.3 }}
                            />

                            {/* Logo Image - Using new PWA icon */}
                            <motion.img
                                src="/icon-512.png"
                                alt="Artha"
                                className="relative w-28 h-28 rounded-3xl shadow-2xl object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </motion.div>

                        {/* App Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="text-center"
                        >
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">Artha</h1>
                            <p className="text-sm text-muted-foreground mt-1">Invoice & Proposal Builder</p>
                        </motion.div>

                        {/* Loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex gap-1"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-primary"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
