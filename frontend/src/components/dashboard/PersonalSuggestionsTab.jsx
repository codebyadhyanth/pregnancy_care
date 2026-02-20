import { useState, useEffect } from 'react';
import { MessageSquare, Check, Clock, Loader2, Building2, Apple, Pill, Calendar, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

const categoryConfig = {
    nutrition: { icon: Apple, color: 'text-green-600', bg: 'bg-green-50', label: 'Nutrition' },
    medication: { icon: Pill, color: 'text-red-600', bg: 'bg-red-50', label: 'Medication' },
    appointment: { icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Appointment' },
    general: { icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'General' },
};

const PersonalSuggestionsTab = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending | all

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/anganwadi/personal-suggestions/me');
            setSuggestions(data || []);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (id) => {
        try {
            await api.post(`/anganwadi/personal-suggestion/complete/${id}`);
            toast.success("Marked as completed!");
            setSuggestions(prev => prev.map(s => s._id === id ? { ...s, status: 'completed' } : s));
        } catch (error) {
            toast.error("Failed to mark complete");
        }
    };

    const filtered = filter === 'pending'
        ? suggestions.filter(s => s.status === 'pending')
        : suggestions;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-dark font-serif flex items-center gap-2">
                        <MessageSquare size={24} className="text-purple-500" />
                        Personal Suggestions
                    </h2>
                    <p className="text-sm text-text-muted mt-1">Private recommendations from your Anganwadi worker</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'pending' ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Pending ({suggestions.filter(s => s.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                    >
                        All ({suggestions.length})
                    </button>
                </div>
            </div>

            {/* Suggestions List */}
            {filtered.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600">
                        {filter === 'pending' ? 'No pending suggestions' : 'No suggestions yet'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {filter === 'pending'
                            ? 'All caught up! Check back later.'
                            : 'Your Anganwadi worker hasn\'t sent any suggestions yet.'}
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(suggestion => {
                        const cat = categoryConfig[suggestion.category] || categoryConfig.general;
                        const CatIcon = cat.icon;
                        const isComplete = suggestion.status === 'completed';

                        return (
                            <GlassCard
                                key={suggestion._id}
                                className={`p-5 transition-all duration-300 ${isComplete ? 'opacity-60' : 'hover:shadow-lg'}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-xl ${cat.bg} shrink-0`}>
                                            <CatIcon size={18} className={cat.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color} ${cat.bg} px-2 py-0.5 rounded-full`}>
                                                    {cat.label}
                                                </span>
                                                {isComplete && (
                                                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Check size={10} /> Done
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">{suggestion.title}</h4>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{suggestion.message}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Building2 size={10} />
                                                    {suggestion.anganwadiId?.centerName || 'Anganwadi'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(suggestion.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!isComplete && (
                                        <Button
                                            variant="primary"
                                            className="text-xs px-3 py-1.5 shrink-0"
                                            onClick={() => handleMarkComplete(suggestion._id)}
                                        >
                                            <Check size={12} /> Done
                                        </Button>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PersonalSuggestionsTab;
