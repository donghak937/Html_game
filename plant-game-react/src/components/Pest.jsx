import React from 'react';
import { motion } from 'framer-motion';

export function Pest({ onClick }) {
    return (
        <motion.div
            onClick={(e) => {
                e.stopPropagation(); // Prevent clicking the plant underneath
                onClick();
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
            }}
            transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
            }}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2em',
                zIndex: 10,
                cursor: 'pointer',
                filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))'
            }}
        >
            🐛
        </motion.div>
    );
}
