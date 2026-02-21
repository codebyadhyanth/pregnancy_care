import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const Login = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Redirect if already logged in
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            const { token } = response.data;

            localStorage.setItem('token', token);
            toast.success(t('auth.loginSuccess'));

            // Check onboarding status from user object
            const isOnboarded = response.data.user?.isOnboarded;

            if (isOnboarded) {
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            } else {
                navigate('/onboarding');
            }
        } catch (error) {
            console.error(error);
            // Toast handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-peach rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-bold text-text-dark">{t('auth.welcomeBack')}</h2>
                        <p className="mt-2 text-text-muted">{t('auth.signInSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start sm:text-sm transition-all shadow-sm"
                                placeholder={t('auth.emailPlaceholder')}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start sm:text-sm transition-all shadow-sm"
                                placeholder={t('auth.passwordPlaceholder')}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 flex justify-center items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : t('auth.signInButton')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-text-muted">
                            {t('auth.noAccount')}{' '}
                            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                {t('auth.signUpLink')}
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
