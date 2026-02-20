import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import api from '../services/api';
import bgImage from '../assets/Pregnant Women Transperent.png';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [canInstall, setCanInstall] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    // PWA Install Prompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPromptEvent(e);
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
            setCanInstall(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPromptEvent) {
            toast.error("To install Janani Setu, use your browser's \"Add to Home Screen\" option.");
            return;
        }

        installPromptEvent.prompt();
        await installPromptEvent.userChoice;
        setInstallPromptEvent(null);
        setCanInstall(false);
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        }
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
        toast.success(t('nav.logoutSuccess'));
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.services'), path: '/services' },
        { name: t('nav.community'), path: '/community' },
        { name: t('nav.blog'), path: '/blogs' },
        { name: t('nav.govSupport'), path: '/gov-support' },
        { name: t('nav.anganwadi'), path: '/anganwadi-care' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 md:space-x-4 pr-4">
                        <img
                            src={bgImage}
                            alt="Background"
                            className="w-12 h-12 object-cover"
                        />
                        <span className="text-2xl font-serif font-bold text-primary-start bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-primary-end">
                            Janani Setu
                        </span>

                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative text-text-dark font-medium transition-colors group px-2 py-1 ${isActive ? 'text-primary-start' : 'hover:text-primary-start'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`absolute left-0 bottom-0 h-0.5 transition-all duration-300 ${isActive ? 'w-full bg-primary-start' : 'w-0 bg-primary-start group-hover:w-full'
                                        }`} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        {/* PWA Install Button */}
                        {canInstall && (
                            <button
                                onClick={handleInstallClick}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-start to-primary-end text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                                title="Install App"
                            >
                                <Download size={16} className="mr-2" />
                                Install
                            </button>
                        )}

                        <div className="text-sm font-medium text-text-muted flex items-center space-x-2">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`hover:text-primary-start ${i18n.language === 'en' ? 'text-primary-start font-bold' : ''}`}
                            >
                                EN
                            </button>
                            <span>|</span>
                            <button
                                onClick={() => changeLanguage('kn')}
                                className={`hover:text-primary-start font-hindi ${i18n.language === 'kn' ? 'text-primary-start font-bold' : ''}`}
                            >
                                ಕನ್ನಡ
                            </button>
                            <span>|</span>
                            <button
                                onClick={() => changeLanguage('hi')}
                                className={`hover:text-primary-start font-hindi ${i18n.language === 'hi' ? 'text-primary-start font-bold' : ''}`}
                            >
                                हिंदी
                            </button>
                        </div>

                        {isLoggedIn ? (
                            <div className="flex items-center space-x-5">
                                <Link to="/dashboard">
                                    <Button variant="secondary" className="px-4 py-1.5 text-sm">
                                        {t('nav.dashboard')}
                                    </Button>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-text-muted hover:text-emergency transition-colors"
                                    title={t('nav.logout')}
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" className="px-6 py-2 text-sm shadow-md shadow-primary-start/30">
                                    {t('nav.login')}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-text-dark hover:text-primary-start transition-colors"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-md shadow-lg overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                                ? 'text-primary-start bg-primary-50 font-semibold'
                                                : 'text-text-dark hover:text-primary-start hover:bg-primary-50/50'
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Install Button */}
                            {canInstall && (
                                <button
                                    onClick={() => { handleInstallClick(); setIsOpen(false); }}
                                    className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-start to-primary-end text-white text-sm font-semibold shadow-md"
                                >
                                    <Download size={16} className="mr-2" />
                                    Install App
                                </button>
                            )}

                            {/* Mobile Language Switcher */}
                            <div className="flex justify-center space-x-4 py-2 border-t border-gray-100 mt-2">
                                <button onClick={() => changeLanguage('en')} className={`${i18n.language === 'en' ? 'text-primary-start font-bold' : 'text-text-muted'}`}>EN</button>
                                <button onClick={() => changeLanguage('kn')} className={`${i18n.language === 'kn' ? 'text-primary-start font-bold' : 'text-text-muted'}`}>ಕನ್ನಡ</button>
                                <button onClick={() => changeLanguage('hi')} className={`${i18n.language === 'hi' ? 'text-primary-start font-bold' : 'text-text-muted'}`}>हिंदी</button>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="block w-full text-center px-4 py-2 mt-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Button variant="secondary" className="w-full">{t('nav.dashboard')}</Button>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="block w-full text-center px-4 py-2 mt-2 text-emergency font-medium"
                                        >
                                            {t('nav.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="block w-full text-center px-4 py-2 mt-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Button variant="primary" className="w-full">{t('nav.login')}</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
