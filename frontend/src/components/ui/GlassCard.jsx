import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 18px 30px -10px rgba(249, 183, 167, 0.45)" } : {}}
            className={`backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-lg shadow-primary-start/25 p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
