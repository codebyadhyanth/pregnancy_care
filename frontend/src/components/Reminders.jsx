import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending"); // pending, completed, all

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await axios.get("/api/reminders/me");
            setReminders(res.data);
        } catch (error) {
            console.error("Failed to fetch reminders:", error);
            toast.error("Failed to load reminders");
        } finally {
            setLoading(false);
        }
    };

    const markAsComplete = async (id) => {
        try {
            await axios.patch(`/api/reminders/${id}`, { status: "completed" });
            toast.success("Reminder marked as complete");
            fetchReminders();
        } catch (error) {
            console.error("Failed to update reminder:", error);
            toast.error("Failed to update reminder");
        }
    };

    const filteredReminders = reminders.filter((r) => {
        if (filter === "all") return true;
        return r.status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Reminders</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "pending"
                                ? "bg-pink-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "completed"
                                ? "bg-pink-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "all"
                                ? "bg-pink-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {filteredReminders.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No reminders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredReminders.map((reminder) => (
                        <div
                            key={reminder._id}
                            className={`border rounded-lg p-4 ${reminder.status === "completed"
                                    ? "bg-gray-50 border-gray-200"
                                    : reminder.status === "cancelled"
                                        ? "bg-red-50 border-red-200"
                                        : "bg-white border-pink-200"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                                        {reminder.source === "anganwadi" && (
                                            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-medium">
                                                Scheduled by Anganwadi
                                            </span>
                                        )}
                                        {reminder.status === "completed" && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                        {reminder.status === "cancelled" && (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    {reminder.description && (
                                        <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(reminder.dueAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(reminder.dueAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {reminder.status === "pending" && (
                                    <button
                                        onClick={() => markAsComplete(reminder._id)}
                                        className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reminders;
