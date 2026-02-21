import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        // Changed bg-white to bg-background-soft (or transparent) and removed top border for seamless look
        // actually user asked to remove "black mark" or "hard separation". 
        // Using a gradient to fade out or just matching the background is best.
        <footer className="bg-gradient-to-b from-background-soft to-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-serif font-bold text-primary-start bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-primary-end">
                            Janani Setu
                        </span>
                        <p className="mt-4 text-sm text-text-muted">
                            {t('footer.tagline')} // Ensure translation key exists or use fallback
                        </p>
                    </div>

                    <div>
                        <h3 className="font-serif font-semibold text-text-dark mb-4">{t('footer.services')}</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li><a href="#" className="hover:text-primary-start transition-colors">Personalized Advice</a></li>
                            <li><a href="#" className="hover:text-primary-start transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-primary-start transition-colors">Health Tracking</a></li>
                            <li><a href="#" className="hover:text-primary-start transition-colors">Emergency Support</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-serif font-semibold text-text-dark mb-4">{t('footer.company')}</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li><a href="#" className="hover:text-primary-start transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary-start transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary-start transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-serif font-semibold text-text-dark mb-4">Emergency</h3>
                        <button className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                            Call Support
                        </button>
                        <p className="mt-2 text-xs text-text-muted">
                            Available 24/7 for urgent queries.
                        </p>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-100/50 text-center text-sm text-text-muted">
                    &copy; {new Date().getFullYear()} Janani Setu. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
