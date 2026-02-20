import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, Check, Clock, X, Apple, Pill, Calendar, HelpCircle, Send } from 'lucide-react';

const categoryConfig = {
    nutrition: { icon: Apple, color: 'text-green-600', bg: 'bg-green-50', label: 'Nutrition' },
    medication: { icon: Pill, color: 'text-red-600', bg: 'bg-red-50', label: 'Medication' },
    appointment: { icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Appointment' },
    general: { icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'General' },
};

const BeneficiarySuggestionsTab = ({ momId }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        category: 'general',
        scheduleDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (momId) fetchSuggestions();
    }, [momId]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/anganwadi/personal-suggestion/${momId}`, {
                withCredentials: true
            });
            setSuggestions(data || []);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error("Title and message are required");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post('/api/anganwadi/personal-suggestion', {
                motherId: momId,
                ...formData,
                scheduleDate: formData.scheduleDate || null
            }, { withCredentials: true });
            toast.success("Suggestion sent!");
            setFormData({ title: '', message: '', category: 'general', scheduleDate: '' });
            setShowForm(false);
            fetchSuggestions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send suggestion");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading suggestions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + Add Button */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">💬</span>
                    Personal Suggestions
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                    {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Suggestion</>}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">Create New Suggestion</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Take Iron Supplements"
                                    className="w-full mt-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full mt-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                                >
                                    <option value="general">General</option>
                                    <option value="nutrition">Nutrition</option>
                                    <option value="medication">Medication</option>
                                    <option value="appointment">Appointment</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Message *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Detailed suggestion or instructions..."
                                className="w-full mt-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Schedule Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.scheduleDate}
                                onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                                className="w-full mt-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 shadow-md"
                        >
                            <Send size={16} />
                            {submitting ? 'Sending...' : 'Send Suggestion'}
                        </button>
                    </form>
                </div>
            )}

            {/* Suggestions List */}
            {suggestions.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No suggestions sent to this mother yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map(suggestion => {
                        const cat = categoryConfig[suggestion.category] || categoryConfig.general;
                        const CatIcon = cat.icon;
                        const isComplete = suggestion.status === 'completed';

                        return (
                            <div
                                key={suggestion._id}
                                className={`bg-white rounded-xl p-5 border shadow-sm transition-all ${isComplete ? 'border-green-200 opacity-70' : 'border-gray-100 hover:shadow-md'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${cat.bg} shrink-0`}>
                                        <CatIcon size={16} className={cat.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${cat.color}`}>{cat.label}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {isComplete ? '✓ Completed' : '⏳ Pending'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm">{suggestion.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{suggestion.message}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(suggestion.createdAt).toLocaleDateString()}
                                            </span>
                                            {suggestion.scheduleDate && (
                                                <span className="flex items-center gap-1">
                                                    📅 Schedule: {new Date(suggestion.scheduleDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BeneficiarySuggestionsTab;
