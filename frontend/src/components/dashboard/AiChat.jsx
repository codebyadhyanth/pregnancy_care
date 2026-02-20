import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Activity, CheckCircle, HelpCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import ConsentModal from '../ui/ConsentModal';

const AiChat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm your pregnancy health assistant. I have access to your tracking, nutrition, and exercise data. How can I help you today?",
            structured: null
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input, structured: null };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Updated endpoint to match ai.route.js POST /advice
            const res = await api.post('/ai/advice', { query: userMsg.text });

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: res.data.analysis || "Here is what I found:",
                structured: res.data // Store full structured response
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Chat error", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I'm having trouble connecting right now. Please try again later.",
                structured: null
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderStructuredResponse = (data) => {
        if (!data) return null;
        return (
            <div className="mt-4 space-y-4 w-full">
                {/* Analysis */}
                <div className="bg-blue-50 p-3 rounded-xl border-l-4 border-blue-400">
                    <h4 className="font-bold text-blue-700 flex items-center gap-2 text-sm"><Activity size={16} /> Analysis</h4>
                    <p className="text-sm text-blue-800 mt-1">{data.analysis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Possible Reasons */}
                    {data.possibleReasons && data.possibleReasons.length > 0 && (
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

                    {/* Missed Factors */}
                    {data.missedFactors && data.missedFactors.length > 0 && (
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

                {/* Recommendations */}
                {data.recommendations && data.recommendations.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-xl border-l-4 border-green-400">
                        <h4 className="font-bold text-green-700 flex items-center gap-2 text-sm"><CheckCircle size={16} /> Recommendations</h4>
                        <ul className="mt-2 space-y-2">
                            {data.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-green-800 bg-white/50 p-2 rounded-lg">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* When to see doctor */}
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

    const [showConsent, setShowConsent] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        checkConsent();
    }, []); // Run only on initial mount for consent check

    const checkConsent = async () => {
        try {
            // We can check local user state if updated, or fetch fresh profile
            const { data } = await api.get('/auth/me'); // or /user/profile
            if (data.user && !data.user.aiConsent) {
                setShowConsent(true);
            }
        } catch (error) {
            console.log("Consent check failed", error);
            // Optionally handle error, e.g., show a message or disable AI features
        }
    };

    const handleAcceptConsent = async () => {
        try {
            await api.put('/user/profile', { aiConsent: true });
            setShowConsent(false);
            toast.success("AI Features Enabled");
        } catch (error) {
            toast.error("Failed to save consent");
        }
    };

    const handleDeclineConsent = () => {
        setShowConsent(false);
        setAccessDenied(true);
    };

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
                <div className="px-6 py-4 bg-white/60 backdrop-blur-md border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-text-dark text-lg">AI Health Assistant</h2>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Online & Aware of your logs
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-purple-50 text-purple-600 border border-purple-100'
                                    }`}>
                                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Text Bubble */}
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-text-dark rounded-tl-none border border-gray-100'
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {/* Structured Content (AI only) */}
                                    {msg.sender === 'ai' && msg.structured && (
                                        <div className="w-full mt-2 animate-fade-in-up">
                                            {renderStructuredResponse(msg.structured)}
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
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
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
                            placeholder="Type symptoms, questions..."
                            className="w-full bg-white border border-gray-200 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 shadow-sm transition-all"
                            disabled={loading || showConsent}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim() || showConsent}
                            className="absolute right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-200"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
};

export default AiChat;
