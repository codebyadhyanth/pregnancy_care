import { Loader } from "lucide-react";
import { cn } from "../../lib/utils";

const GradientButton = ({ children, isLoading, className, ...props }) => {
    return (
        <button
            className={cn(
                "relative overflow-hidden group px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-300",
                "bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700",
                "hover:shadow-pink-300/50 hover:scale-[1.02] active:scale-95",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                "focus:outline-none focus:ring-4 focus:ring-pink-200",
                className
            )}
            disabled={isLoading}
            {...props}
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <span className="relative flex items-center justify-center gap-2">
                {isLoading && <Loader className="w-5 h-5 animate-spin" />}
                {children}
            </span>
        </button>
    );
};

export default GradientButton;
