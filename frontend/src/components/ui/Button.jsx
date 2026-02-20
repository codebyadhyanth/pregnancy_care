import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-2 rounded-xl font-medium transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-gradient-to-r from-primary-start to-primary-end text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-primary-start",
        secondary: "bg-gradient-to-r from-[#FDF0E6] to-[#FBE4F0] text-primary-start border border-primary-start/20 hover:from-primary-start hover:to-primary-end hover:text-white shadow-md hover:shadow-lg focus:ring-primary-start",
        outline: "border-2 border-text-muted text-text-muted hover:border-text-dark hover:text-text-dark focus:ring-text-muted",
        danger: "bg-gradient-to-r from-emergency to-[#FFE0E0] text-white shadow-md hover:shadow-lg focus:ring-emergency",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
