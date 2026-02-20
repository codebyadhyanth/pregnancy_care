import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Activity,
    Brain,
    Users,
    BookOpen,
    Calendar,
    LayoutDashboard,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const Services = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleAccessService = (path) => {
        if (isLoggedIn) {
            navigate(path);
        } else {
            navigate('/login', { state: { from: { pathname: path } } });
        }
    };

    const serviceList = [
        {
            icon: <Activity className="w-8 h-8 text-primary-500" />,
            titleKey: 'services.tracking.title',
            descKey: 'services.tracking.desc',
            path: '/dashboard',
            color: 'bg-primary-50'
        },
        {
            icon: <Brain className="w-8 h-8 text-purple-500" />,
            titleKey: 'services.ai.title',
            descKey: 'services.ai.desc',
            path: '/dashboard',
            color: 'bg-purple-50'
        },
        {
            icon: <Users className="w-8 h-8 text-accent-peach" />,
            titleKey: 'services.community.title',
            descKey: 'services.community.desc',
            path: '/community',
            color: 'bg-orange-50'
        },
        {
            icon: <BookOpen className="w-8 h-8 text-blue-500" />,
            titleKey: 'services.blogs.title',
            descKey: 'services.blogs.desc',
            path: '/blog',
            color: 'bg-blue-50'
        },
        {
            icon: <Calendar className="w-8 h-8 text-green-500" />,
            titleKey: 'services.appointments.title',
            descKey: 'services.appointments.desc',
            path: '/dashboard/appointments',
            color: 'bg-green-50'
        },
        {
            icon: <LayoutDashboard className="w-8 h-8 text-pink-600" />,
            titleKey: 'services.dashboard.title',
            descKey: 'services.dashboard.desc',
            path: '/dashboard',
            color: 'bg-pink-50'
        }
    ];

    return (
        <div className="min-h-screen pt-20 bg-background-soft">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-text-dark mb-6"
                    >
                        {t('services.hero.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-text-muted max-w-2xl mx-auto mb-10"
                    >
                        {t('services.hero.subtitle')}
                    </motion.p>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-peach rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </section>

            {/* Services Grid */}
            <section className="py-12 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {serviceList.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard
                                    className="h-full p-6 hover:border-primary-200 transition-colors group"
                                    hoverEffect={true}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-serif font-semibold text-text-dark mb-3">
                                        {t(service.titleKey)}
                                    </h3>
                                    <p className="text-text-muted mb-6">
                                        {t(service.descKey)}
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200"
                                        onClick={() => handleAccessService(service.path)}
                                    >
                                        {t('services.accessButton')}
                                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-serif font-bold text-text-dark mb-4">
                            {t('services.cta.title')}
                        </h2>
                        <p className="text-text-muted mb-8 max-w-xl mx-auto">
                            {t('services.cta.subtitle')}
                        </p>
                        <Button
                            variant="primary"
                            className="px-8 py-3 text-lg shadow-lg shadow-primary-start/30"
                            onClick={() => handleAccessService('/login')}
                        >
                            {t('services.cta.button')}
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Services;
