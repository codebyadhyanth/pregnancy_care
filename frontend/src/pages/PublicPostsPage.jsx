import { useState, useEffect } from 'react';
import { Building2, Calendar, Megaphone, Loader2 } from 'lucide-react';
import api from '../services/api';

const PublicPostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/anganwadi/public-posts?page=${page}&limit=12`);
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch public posts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
                        <Building2 size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">Anganwadi Updates</h1>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Public health advisories, resources, and announcements from Anganwadi centres near you.
                    </p>
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-teal-500" size={32} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Megaphone size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-600">No Posts Yet</h3>
                        <p className="text-sm text-gray-400 mt-1">Anganwadi centres haven't published any public updates yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => (
                            <article
                                key={post._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                            >
                                {post.imageUrl && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
                                            <Building2 size={14} className="text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-teal-700">
                                                {post.createdBy?.centerName || "Anganwadi Centre"}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {post.createdBy?.district || ""}
                                            </p>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                        {post.content}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={12} />
                                        <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicPostsPage;
