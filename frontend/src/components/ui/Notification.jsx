import { X } from 'lucide-react';

const Notification = ({ isVisible, message, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full pointer-events-none">
            <div
                className="notification-slide-in pointer-events-auto bg-gradient-to-r from-[#FDF0E6] via-[#FAD0C9] to-[#F9E5C9] text-text-dark rounded-[24px] shadow-xl shadow-primary-start/10 p-5 border border-white/40 backdrop-blur-md flex items-center space-x-4"
            >
                <div className="text-3xl filter drop-shadow-sm flex-shrink-0">
                    👶
                </div>
                <div className="flex-1 text-sm font-semibold leading-relaxed tracking-tight">
                    {message}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30 text-text-dark/40 hover:text-text-dark transition-all duration-300"
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Notification;

