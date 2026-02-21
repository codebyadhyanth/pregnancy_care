import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Activity,
    Apple,
    Dumbbell,
    Flower,
    Calendar,
    Pill,
    MessageCircle,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    Building2,
    Landmark,
    Wallet,
    Sparkles,
    Baby,
    ChevronRight
} from 'lucide-react';
import TrackingView from '../components/dashboard/TrackingView';
import NutritionView from '../components/dashboard/NutritionView';
import ExerciseView from '../components/dashboard/ExerciseView';
import YogaView from '../components/dashboard/YogaView';
import MedicationView from '../components/dashboard/MedicationView';
import AppointmentView from '../components/dashboard/AppointmentView';
import AiChat from '../components/dashboard/AiChat';
import JananiAI from '../components/dashboard/JananiAI';
import MoneyTransactions from '../components/dashboard/MoneyTransactions';
import PersonalSuggestionsTab from '../components/dashboard/PersonalSuggestionsTab';
import PostPregnancyDashboard from '../components/dashboard/PostPregnancyDashboard';
import DeliveryConfirmation from '../components/dashboard/DeliveryConfirmation';
import Settings from './Settings';
import AnganwadiPage from './AnganwadiPage';
import GovernmentSupport from './GovernmentSupport';
import api from '../services/api';
import AlertModal from '../components/ui/AlertModal';
import { useAuthStore } from '../store/authStore';
import { AnimatePresence, motion } from 'framer-motion';

const Dashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('tracking');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Pre/Post Pregnancy Mode – isolated state
    const [pregnancyMode, setPregnancyMode] = useState('pre'); // 'pre' | 'post'
    const [deliveryStatus, setDeliveryStatus] = useState(null); // null | { hasDelivered, ... }
    const [showDeliveryFlow, setShowDeliveryFlow] = useState(false);

    // Alert State
    const [showAlert, setShowAlert] = useState(false);
    const [alertData, setAlertData] = useState(null);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                // Check profile / onboarding status
                const res = await api.get('/user/profile');
                if (!res.data.isOnboarded) {
                    navigate('/onboarding');
                    return;
                }

                // Fetch alerts
                const alertRes = await api.get('/dashboard/alerts/status');
                setAlertData(alertRes.data);
                setShowAlert(true);

                // Check delivery status for pre/post toggle
                try {
                    const deliveryRes = await api.get('/baby/delivery-status');
                    setDeliveryStatus(deliveryRes.data);
                    if (deliveryRes.data.hasDelivered) {
                        setPregnancyMode('post');
                    }
                } catch { /* baby API may not be available yet */ }

            } catch (error) {
                // Silently handle or use a notification
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // await api.post('/auth/logout'); // Optional depending on backend
            logout();
            navigate('/login');
        } catch (e) { /* silent fail */ }
    }

    const tabs = [
        { id: 'tracking', label: 'Tracking', icon: <Activity size={24} />, color: 'text-primary-500', bg: 'bg-primary-50' },
        { id: 'nutrition', label: 'Nutrition', icon: <Apple size={24} />, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'exercise', label: 'Exercise', icon: <Dumbbell size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'yoga', label: 'Yoga', icon: <Flower size={24} />, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'medication', label: 'Meds', icon: <Pill size={24} />, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'appointments', label: 'Visits', icon: <Calendar size={24} />, color: 'text-teal-500', bg: 'bg-teal-50' },
        { id: 'anganwadi', label: 'Anganwadi', icon: <Building2 size={24} />, color: 'text-teal-500', bg: 'bg-teal-50' },
        { id: 'gov-support', label: 'Schemes', icon: <Landmark size={24} />, color: 'text-pink-500', bg: 'bg-pink-50' },
        { id: 'transactions', label: 'Transactions', icon: <Wallet size={24} />, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'suggestions', label: 'Suggestions', icon: <MessageCircle size={24} />, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'ai-chat', label: 'Janani AI', icon: <Sparkles size={24} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon size={24} />, color: 'text-gray-500', bg: 'bg-gray-50' },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleModeSwitch = (mode) => {
        if (mode === 'post') {
            if (deliveryStatus?.hasDelivered) {
                setPregnancyMode('post');
            } else {
                setShowDeliveryFlow(true);
            }
        } else {
            setPregnancyMode('pre');
            setShowDeliveryFlow(false);
        }
    };

    const handleDeliveryConfirmed = () => {
        setShowDeliveryFlow(false);
        setPregnancyMode('post');
        setDeliveryStatus({ hasDelivered: true });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'tracking': return <TrackingView />;
            case 'nutrition': return <NutritionView />;
            case 'exercise': return <ExerciseView />;
            case 'yoga': return <YogaView />;
            case 'medication': return <MedicationView />;
            case 'anganwadi': return <AnganwadiPage />;
            case 'gov-support': return <GovernmentSupport />;
            case 'transactions': return <MoneyTransactions />;
            case 'suggestions': return <PersonalSuggestionsTab />;
            case 'appointments': return <AppointmentView />;
            case 'ai-chat': return <JananiAI />;
            case 'settings': return <Settings />;
            default: return <TrackingView />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-soft">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-background-soft flex pb-24 lg:pb-0">
            <AlertModal isOpen={showAlert} onClose={() => setShowAlert(false)} data={alertData} />

            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm fixed top-0 w-full z-30">
                <span className="font-bold text-xl text-primary-500 font-serif">Bloom</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex fixed left-6 top-24 h-[85vh] w-20 flex-col items-center bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-[2.5rem] py-6 z-40 transition-all duration-300 hover:w-64 group overflow-y-auto scroll-smooth justify-between">

                {/* Tabs */}
                <div className="flex flex-col space-y-3 w-full px-3">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center p-3 rounded-full transition-all duration-300 group-hover:px-4 group-hover:w-full ${activeTab === tab.id
                                ? `${tab.bg} ${tab.color} shadow-sm`
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                        >
                            <div className={`shrink-0 ${activeTab === activeTab.id ? '' : ''}`}>
                                {tab.icon}
                            </div>
                            <span className={`ml-3 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0 ${activeTab === tab.id ? 'font-bold' : ''}`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <div className="w-full px-3 mb-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-full transition-all duration-300 group-hover:px-4 group-hover:w-full text-red-400 hover:bg-red-50 hover:text-red-500"
                    >
                        <div className="shrink-0"><LogOut size={24} /></div>
                        <span className="ml-3 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl p-6 lg:hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-bold text-xl text-primary-500 font-serif">Bloom</span>
                            <button onClick={() => setIsSidebarOpen(false)}><X /></button>
                        </div>
                        <div className="flex flex-col space-y-4 overflow-y-auto scroll-smooth">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { handleTabChange(tab.id); setIsSidebarOpen(false); }}
                                    className={`flex items-center p-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? `${tab.bg} ${tab.color} font-bold`
                                        : 'text-gray-500'
                                        }`}
                                >
                                    {tab.icon}
                                    <span className="ml-3">{tab.label}</span>
                                </button>
                            ))}
                            <button onClick={handleLogout} className="flex items-center p-3 text-red-500 mt-4">
                                <LogOut size={24} />
                                <span className="ml-3">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Nav (Mobile) */}
            <div className="lg:hidden fixed bottom-4 left-4 right-4 h-24 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] z-40 flex items-center justify-start px-4 gap-2 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`p-4 rounded-2xl transition-all duration-300 relative flex-shrink-0 flex items-center gap-2 ${activeTab === tab.id
                            ? `${tab.bg} ${tab.color} shadow-md`
                            : 'text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <div className="shrink-0">{tab.icon}</div>
                        {activeTab === tab.id && (
                            <span className="text-xs font-bold whitespace-nowrap">{tab.label}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 lg:ml-28 transition-all duration-300 mt-4 lg:mt-0">
                <div className="max-w-6xl mx-auto animate-fade-in">

                    {/* Pre/Post Pregnancy Toggle */}
                    <div className="flex justify-center mb-5">
                        <div className="flex bg-white/70 backdrop-blur-lg rounded-2xl p-1.5 shadow-sm border border-gray-100">
                            <button
                                onClick={() => handleModeSwitch('pre')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${pregnancyMode === 'pre' && !showDeliveryFlow
                                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                🤰 Pre-Pregnancy
                            </button>
                            <button
                                onClick={() => handleModeSwitch('post')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${pregnancyMode === 'post' || showDeliveryFlow
                                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Baby size={16} /> Post-Pregnancy
                            </button>
                        </div>
                    </div>

                    {/* Show Delivery Flow */}
                    {showDeliveryFlow ? (
                        <DeliveryConfirmation
                            onConfirmed={handleDeliveryConfirmed}
                            onCancel={() => { setShowDeliveryFlow(false); setPregnancyMode('pre'); }}
                        />
                    ) : pregnancyMode === 'post' ? (
                        <PostPregnancyDashboard onBack={() => setPregnancyMode('pre')} />
                    ) : (
                        <>
                            <div className="lg:hidden mb-6 flex justify-between items-center">
                                <h1 className="text-2xl font-serif font-bold text-text-dark capitalize flex items-center gap-2">
                                    {tabs.find(t => t.id === activeTab)?.icon}
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h1>
                            </div>
                            {renderContent()}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
