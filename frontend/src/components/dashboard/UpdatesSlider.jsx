import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Bell, Pill, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';

const typeConfig = {
    medication: { icon: Pill, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    appointment: { icon: Calendar, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
    suggestion: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    reminder: { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
};

const UpdatesSlider = () => {
    const [updates, setUpdates] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchUpdates();
    }, []);

    useEffect(() => {
        if (updates.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % updates.length);
            }, 5000);
        }
        return () => clearInterval(intervalRef.current);
    }, [updates.length]);

    const fetchUpdates = async () => {
        try {
            const { data } = await api.get('/dashboard/updates-slider');
            setUpdates(data.updates || []);
        } catch (error) {
            console.error("Failed to fetch updates:", error);
        } finally {
            setLoading(false);
        }
    };

    const goNext = () => {
        clearInterval(intervalRef.current);
        setCurrentIndex(prev => (prev + 1) % updates.length);
    };
    const goPrev = () => {
        clearInterval(intervalRef.current);
        setCurrentIndex(prev => (prev - 1 + updates.length) % updates.length);
    };

    if (loading) {
        return (
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[120px] col-span-2 animate-pulse">
                <Bell size={20} className="text-gray-300" />
                <p className="text-xs text-gray-400">Loading updates...</p>
            </GlassCard>
        );
    }

    if (updates.length === 0) {
        return (
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[120px] col-span-2">
                <div className="p-2 bg-green-50 rounded-full">
                    <AlertCircle size={20} className="text-green-400" />
                </div>
                <p className="text-xs text-text-muted">All caught up! 🎉</p>
                <p className="text-[10px] text-gray-400">No pending updates</p>
            </GlassCard>
        );
    }

    const current = updates[currentIndex];
    const config = typeConfig[current?.type] || typeConfig.reminder;
    const IconComponent = config.icon;

    return (
        <GlassCard className={`p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[120px] col-span-2 relative overflow-hidden border ${config.border} transition-all duration-500`}>
            {/* Navigation Arrows */}
            {updates.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all z-10"
                    >
                        <ChevronLeft size={14} className="text-gray-500" />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/60 hover:bg-white shadow-sm transition-all z-10"
                    >
                        <ChevronRight size={14} className="text-gray-500" />
                    </button>
                </>
            )}

            {/* Content */}
            <div className={`p-2 ${config.bg} rounded-full shadow-sm`}>
                <IconComponent size={18} className={config.color} />
            </div>
            <div className="px-4">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Important Updates</p>
                <p className="text-sm font-bold text-text-dark mt-1 line-clamp-1">{current.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{current.message}</p>
            </div>

            {/* Dots */}
            {updates.length > 1 && (
                <div className="flex gap-1 pt-1">
                    {updates.slice(0, 8).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { clearInterval(intervalRef.current); setCurrentIndex(i); }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-primary-500 w-3' : 'bg-gray-300'}`}
                        />
                    ))}
                    {updates.length > 8 && <span className="text-[8px] text-gray-400">+{updates.length - 8}</span>}
                </div>
            )}
        </GlassCard>
    );
};

export default UpdatesSlider;
