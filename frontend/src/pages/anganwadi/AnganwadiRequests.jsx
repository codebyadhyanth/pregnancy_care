import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserPlus, Check, X, Clock } from "lucide-react";

const AnganwadiRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/join-requests", { withCredentials: true });
            setRequests(data);
        } catch (error) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (requestId, status) => {
        try {
            const { data } = await axios.post("/api/anganwadi/process-join-request", {
                requestId,
                status
            }, { withCredentials: true });

            toast.success(data.message);
            // Remove from list locally
            setRequests(requests.filter(r => r._id !== requestId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="text-[#2E7D6B]" /> Join Requests
                </h1>
                <p className="text-gray-500">Mothers requesting to join your center.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">All Caught Up!</h3>
                    <p className="text-gray-500">There are no pending join requests at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{req.mom.name}</h3>
                                    <p className="text-sm text-gray-500">{req.mom.email}</p>
                                    <p className="text-sm text-gray-500">{req.mom.motherPhone || "No Phone Provided"}</p>
                                    <div className="mt-2 text-xs bg-gray-100 inline-block px-2 py-1 rounded text-gray-600">
                                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleProcess(req._id, "rejected")}
                                    className="flex-1 md:flex-none border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => handleProcess(req._id, "approved")}
                                    className="flex-1 md:flex-none bg-[#2E7D6B] hover:bg-[#256657] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnganwadiRequests;
