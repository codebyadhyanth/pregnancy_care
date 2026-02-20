import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Tag, X, ChevronRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blogs');
            setBlogs(res.data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
            // toast.error("Could not load health tips"); // Optional: fail silently
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = filter === 'all'
        ? blogs
        : blogs.filter(b => b.category === filter);

    const categories = ['all', 'health', 'nutrition', 'exercise', 'general'];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center justify-center p-3 bg-pink-100/50 rounded-full mb-4"
                >
                    <BookOpen className="w-8 h-8 text-pink-500" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900">Health & Wellness Hub</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Expert advice, rural maternal care tips, and nutrition guides for your journey.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filter === cat
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105'
                                : 'bg-white/50 text-gray-600 hover:bg-white hover:text-pink-500'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
                <div className="grid md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.map((blog, index) => (
                        <motion.div
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="h-full flex flex-col overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 capitalize">
                                        {blog.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-rose-600 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                        {blog.summary}
                                    </p>
                                    <button
                                        onClick={() => setSelectedBlog(blog)}
                                        className="inline-flex items-center text-pink-600 font-semibold text-sm hover:translate-x-1 transition-transform"
                                    >
                                        Read Article <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {filteredBlogs.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    <p>No articles found for this category.</p>
                </div>
            )}

            {/* Blog Reading Modal */}
            <AnimatePresence>
                {selectedBlog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBlog(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={selectedBlog._id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedBlog(null)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white hover:shadow-lg transition-all"
                            >
                                <X className="w-5 h-5 text-gray-700" />
                            </button>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="h-64 sm:h-80 relative">
                                    <img
                                        src={selectedBlog.image}
                                        alt={selectedBlog.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                        <div className="text-white">
                                            <span className="bg-pink-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                                                {selectedBlog.category}
                                            </span>
                                            <h2 className="text-3xl font-bold leading-tight">{selectedBlog.title}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 sm:p-10 space-y-6">
                                    <div className="prose prose-pink max-w-none text-gray-700 leading-relaxed">
                                        {/* Simple rendering for now, could be Markdown */}
                                        {selectedBlog.content.split('\n').map((paragraph, idx) => (
                                            <p key={idx} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogsPage;
