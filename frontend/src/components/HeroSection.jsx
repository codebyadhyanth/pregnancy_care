import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import bgImage from '../assets/Pregnant Mom with daughter.png';

const HeroSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [canInstall, setCanInstall] = useState(false);

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
            window.alert("To install Janani Setu, use your browser's \"Add to Home Screen\" option.");
            return;
        }

        installPromptEvent.prompt();
        await installPromptEvent.userChoice;
        setInstallPromptEvent(null);
        setCanInstall(false);
    };

    return (
        <section className="relative overflow-hidden pt-20 pb-20 lg:pb-32">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full z-0">
                <img
                    src={bgImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                {/* <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" /> */}
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-tight"
                        >
                            {t('hero.titleStart')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-start to-primary-end">
                                {t('hero.titleHighlight')}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="mt-6 text-lg sm:text-xl text-white max-w-lg"
                        >
                            {t('hero.subtitle')}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="mt-8 flex flex-wrap gap-4"
                        >
                            <Button
                                variant="primary"
                                className="px-8 py-3 text-lg shadow-primary-start/40"
                                onClick={() => navigate('/signup')}
                            >
                                {t('hero.getStarted')}
                            </Button>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="secondary"
                                    className="px-8 py-3 text-lg"
                                    onClick={() => navigate('/services')}
                                >
                                    {t('hero.howItWorks')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="px-8 py-3 text-lg bg-gradient-to-r from-[#FDF0E6] to-[#FBE4F0] border-none shadow-md"
                                    onClick={handleInstallClick}
                                >
                                    Install App 📱
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Image Placeholder Area (Since image moved to background, this might be adjusted or kept for layout balance) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block h-full"
                    >
                        {/* Floating Hearts */}
                        <motion.div
                            animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-1/4 right-10 text-primary-start"
                        >
                            <Heart fill="currentColor" size={24} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                            className="absolute bottom-1/3 left-0 text-primary-end"
                        >
                            <Heart fill="currentColor" size={32} />
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
