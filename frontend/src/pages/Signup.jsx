import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const Signup = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', termsAccepted: false });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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

        // Password validation: minimum 10 chars with required complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast.error("Password must be at least 10 characters and include uppercase, lowercase, number, and special character");
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/signup', formData);
            toast.success(t('auth.signupSuccess'));

            // If backend logs in automatically:
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // New users must always be onboarded
                navigate('/onboarding');
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-bold text-text-dark">{t('auth.createAccount')}</h2>
                        <p className="mt-2 text-text-muted">{t('auth.joinCommunity')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start sm:text-sm transition-all shadow-sm"
                                placeholder={t('auth.fullNamePlaceholder')}
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                checked={formData.termsAccepted}
                                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> & <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 flex justify-center items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : t('auth.signUpButton')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-text-muted">
                            {t('auth.hasAccount')}{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                {t('auth.signInLink')}
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Signup;
