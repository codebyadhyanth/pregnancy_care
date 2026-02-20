import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Send, Bot, User, Activity, CheckCircle, HelpCircle, AlertCircle,
    ShieldCheck, Globe, ToggleLeft, ToggleRight, Sparkles, FileText,
    AlertTriangle, MapPin, BookOpen, List
} from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import ConsentModal from '../ui/ConsentModal';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'bn', label: 'Bengali' },
    { code: 'mr', label: 'Marathi' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'or', label: 'Odia' },
    { code: 'as', label: 'Assamese' },
];

// ===========================
// Curated Card Renderer
// ===========================
const CuratedCards = ({ data }) => {
    if (!data) return null;

    const sections = [
        { key: 'summary', label: 'Summary', icon: <Sparkles size={16} />, color: 'blue', isList: false },
        { key: 'eligibility', label: 'Eligibility', icon: <CheckCircle size={16} />, color: 'green', isList: true },
        { key: 'benefits', label: 'Benefits', icon: <Activity size={16} />, color: 'emerald', isList: true },
        { key: 'steps_to_apply', label: 'Steps to Apply', icon: <List size={16} />, color: 'purple', isList: true },
        { key: 'documents_required', label: 'Documents Required', icon: <FileText size={16} />, color: 'indigo', isList: true },
        { key: 'important_notes', label: 'Important Notes', icon: <BookOpen size={16} />, color: 'amber', isList: true },
        { key: 'state_specific_info', label: 'State-Specific Info', icon: <MapPin size={16} />, color: 'teal', isList: true },
        { key: 'warnings', label: 'Warnings', icon: <AlertTriangle size={16} />, color: 'red', isList: true },
    ];

    const bgColors = {
        blue: 'bg-blue-50 border-blue-200', green: 'bg-green-50 border-green-200',
        emerald: 'bg-emerald-50 border-emerald-200', purple: 'bg-purple-50 border-purple-200',
        indigo: 'bg-indigo-50 border-indigo-200', amber: 'bg-amber-50 border-amber-200',
        teal: 'bg-teal-50 border-teal-200', red: 'bg-red-50 border-red-200',
    };
    const textColors = {
        blue: 'text-blue-700', green: 'text-green-700', emerald: 'text-emerald-700',
        purple: 'text-purple-700', indigo: 'text-indigo-700', amber: 'text-amber-700',
        teal: 'text-teal-700', red: 'text-red-700',
    };

    return (
        <div className="mt-3 space-y-3 w-full">
            {data.title && (
                <h4 className="text-base font-bold text-text-dark flex items-center gap-2">
                    <Sparkles size={16} className="text-primary-start" /> {data.title}
                </h4>
            )}
            {sections.map(({ key, label, icon, color, isList }) => {
                const value = data[key];
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                return (
                    <div key={key} className={`p-3 rounded-2xl border ${bgColors[color]}`}>
                        <h5 className={`font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${textColors[color]}`}>
                            {icon} {label}
                        </h5>
                        {isList ? (
                            <ul className="space-y-1">
                                {(Array.isArray(value) ? value : [value]).map((item, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${textColors[color].replace('text-', 'bg-')}`} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-700">{value}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ===========================
// Structured Response (existing format, kept for backward compat)
// ===========================
const StructuredResponse = ({ data }) => {
    if (!data) return null;
    return (
        <div className="mt-4 space-y-4 w-full">
            {data.analysis && (
                <div className="bg-blue-50 p-3 rounded-xl border-l-4 border-blue-400">
                    <h4 className="font-bold text-blue-700 flex items-center gap-2 text-sm"><Activity size={16} /> Analysis</h4>
                    <p className="text-sm text-blue-800 mt-1">{data.analysis}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.possibleReasons?.length > 0 && (
                    <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Possible Reasons</h4>
                        <ul className="space-y-1">
                            {data.possibleReasons.map((r, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">•</span> {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {data.missedFactors?.length > 0 && (
                    <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                        <h4 className="font-bold text-yellow-700 text-xs uppercase tracking-wider mb-2">Did you check?</h4>
                        <ul className="space-y-1">
                            {data.missedFactors.map((f, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <HelpCircle size={14} className="text-yellow-500 mt-0.5" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {data.recommendations?.length > 0 && (
                <div className="bg-green-50 p-3 rounded-xl border-l-4 border-green-400">
                    <h4 className="font-bold text-green-700 flex items-center gap-2 text-sm"><CheckCircle size={16} /> Recommendations</h4>
                    <ul className="mt-2 space-y-2">
                        {data.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-green-800 bg-white/50 p-2 rounded-lg">{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
            {data.whenToSeeDoctor && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="font-bold text-red-700 text-sm">When to see a doctor</h4>
                        <p className="text-sm text-red-600 mt-1">{data.whenToSeeDoctor}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===========================
// Main Janani AI Component
// ===========================
const JananiAI = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "🌸 Hello! I'm Janani AI – Your Maternal Assistance Companion. I have access to your health data, schemes, and tracking info. How can I help you today?",
            structured: null,
            curated: null,
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const debounceRef = useRef(null);

    // Response mode toggle
    const [responseMode, setResponseMode] = useState('curated'); // 'curated' | 'full'

    // Translation
    const [language, setLanguage] = useState('en');
    const [includeSlang, setIncludeSlang] = useState(false);

    // Consent
    const [showConsent, setShowConsent] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        checkConsent();
    }, []);

    const checkConsent = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.user && !data.user.aiConsent) {
                setShowConsent(true);
            }
        } catch {
            // Silent
        }
    };

    const handleAcceptConsent = async () => {
        try {
            await api.put('/user/profile', { aiConsent: true });
            setShowConsent(false);
        } catch {
            // Silent
        }
    };

    const handleDeclineConsent = () => {
        setShowConsent(false);
        setAccessDenied(true);
    };

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        // Debounce 300ms
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const userText = input.trim();
        const userMsg = { id: Date.now(), sender: 'user', text: userText, structured: null, curated: null };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.post('/ai/advice', {
                    query: userText,
                    responseMode,
                    language,
                    includeSlang,
                });

                const aiData = res.data;
                const isCurated = responseMode === 'curated' && (aiData.title || aiData.summary || aiData.eligibility);

                const aiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: isCurated
                        ? (aiData.summary || aiData.analysis || "Here's what I found:")
                        : (aiData.analysis || "Here is what I found:"),
                    structured: !isCurated ? aiData : null,
                    curated: isCurated ? aiData : null,
                };
                setMessages(prev => [...prev, aiMsg]);
            } catch {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: "I'm having trouble connecting right now. Please try again later.",
                    structured: null,
                    curated: null,
                }]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [input, loading, responseMode, language, includeSlang]);

    if (accessDenied) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <ShieldCheck size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">AI Assistance Disabled</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    You chose not to enable AI features. You can change this in your Settings at any time.
                </p>
                <Button variant="primary" className="mt-6" onClick={() => { setAccessDenied(false); setShowConsent(true); }}>
                    Review Consent
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] lg:h-[calc(100vh-12rem)] relative">
            <ConsentModal
                isOpen={showConsent}
                onAccept={handleAcceptConsent}
                onDecline={handleDeclineConsent}
            />
            <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 relative">
                {/* Header */}
                <div className="px-5 py-4 bg-white/60 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-start to-purple-400 flex items-center justify-center text-white shadow-lg shadow-primary-start/20">
                            <Bot size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-text-dark text-lg">🌸 Janani AI</h2>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Your Maternal Assistance Companion
                            </p>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        {/* Response Mode Toggle */}
                        <button onClick={() => setResponseMode(m => m === 'curated' ? 'full' : 'curated')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition-colors">
                            {responseMode === 'curated' ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {responseMode === 'curated' ? 'Card Mode' : 'Full AI Mode'}
                        </button>

                        {/* Language Selector */}
                        <div className="flex items-center gap-1.5">
                            <Globe size={14} className="text-gray-400" />
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-full px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-start/30">
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                            </select>
                        </div>

                        {/* Slang Toggle */}
                        <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                            <input type="checkbox" checked={includeSlang} onChange={(e) => setIncludeSlang(e.target.checked)}
                                className="rounded w-3 h-3" />
                            Local Slang
                        </label>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-primary-start to-primary-end text-white rounded-tr-none'
                                        : 'bg-white text-text-dark rounded-tl-none border border-gray-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'ai' && msg.curated && (
                                        <div className="w-full mt-2 animate-fade-in">
                                            <CuratedCards data={msg.curated} />
                                        </div>
                                    )}
                                    {msg.sender === 'ai' && msg.structured && !msg.curated && (
                                        <div className="w-full mt-2 animate-fade-in">
                                            <StructuredResponse data={msg.structured} />
                                        </div>
                                    )}
                                    <span className="text-[10px] text-gray-400 mt-1 opacity-60">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
                                    <Bot size={14} className="text-purple-400" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 ${showConsent ? 'blur-sm pointer-events-none' : ''}`}>
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about schemes, health tips, nutrition..."
                            className="w-full bg-white border border-gray-200 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/20 focus:border-primary-start shadow-sm transition-all"
                            disabled={loading || showConsent}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim() || showConsent}
                            className="absolute right-2 p-2 bg-gradient-to-r from-primary-start to-primary-end hover:shadow-lg text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
};

export default JananiAI;
