import { cn } from "../../lib/utils";

const Card = ({ children, className }) => {
    return (
        <div
            className={cn(
                "bg-white rounded-3xl shadow-sm border border-pink-100/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-pink-200",
                className
            )}
        >
            {children}
        </div>
    );
};

export default Card;
