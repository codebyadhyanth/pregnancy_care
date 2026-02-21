import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trash2, Plus } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AppointmentView = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAppointment, setNewAppointment] = useState({
        title: '',
        hospitalName: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/dashboard/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error("Fetch appointments failed", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newAppointment.title || !newAppointment.date || !newAppointment.time) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await api.post('/dashboard/appointments', newAppointment);
            toast.success("Appointment added");
            setNewAppointment({ title: '', hospitalName: '', date: '', time: '' });
            fetchAppointments();
        } catch (error) {
            toast.error("Failed to add appointment");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/dashboard/appointments/${id}`);
            toast.success("Appointment deleted");
            setAppointments(prev => prev.filter(app => app._id !== id));
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    // Calculate next appointment for highlighting
    const upcomingAppointments = appointments
        .filter(app => new Date(app.date) >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const nextApp = upcomingAppointments[0];

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Add Appointment Form */}
                <GlassCard className="p-6 h-fit bg-gradient-to-b from-white to-green-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-green-600" /> Add Appointment
                    </h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Reason / Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Monthly Checkup"
                                value={newAppointment.title}
                                onChange={e => setNewAppointment({ ...newAppointment, title: e.target.value })}
                                className="w-full mt-1 p-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Hospital / Doctor</label>
                            <input
                                type="text"
                                placeholder="e.g. City Hospital, Dr. Smith"
                                value={newAppointment.hospitalName}
                                onChange={e => setNewAppointment({ ...newAppointment, hospitalName: e.target.value })}
                                className="w-full mt-1 p-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Date</label>
                                <input
                                    type="date"
                                    value={newAppointment.date}
                                    onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                    className="w-full mt-1 p-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500">Time</label>
                                <input
                                    type="time"
                                    value={newAppointment.time}
                                    onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                                    className="w-full mt-1 p-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 outline-none"
                                />
                            </div>
                        </div>
                        <Button variant="primary" className="w-full bg-green-500 hover:bg-green-600 shadow-green-200">
                            Schedule Visit
                        </Button>
                    </form>
                </GlassCard>

                {/* Appointment List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Next Appointment Highlight */}
                    {nextApp && (
                        <GlassCard className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-xl mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">Next Visit</span>
                                    <h2 className="text-2xl font-bold mb-1">{nextApp.title}</h2>
                                    <p className="text-green-50 flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4" /> {nextApp.hospitalName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{new Date(nextApp.date).getDate()}</div>
                                    <div className="text-lg uppercase opacity-80">{new Date(nextApp.date).toLocaleDateString(undefined, { month: 'short' })}</div>
                                    <div className="text-sm font-medium mt-1 bg-white/20 px-2 py-1 rounded-lg inline-block">
                                        {nextApp.time}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    <h3 className="text-lg font-bold text-gray-800">Upcoming Schedule</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {appointments.length === 0 && (
                            <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-300">
                                No appointments scheduled yet.
                            </div>
                        )}

                        {appointments.map((app) => (
                            <GlassCard key={app._id} className="p-4 flex justify-between items-center group hover:border-green-300 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-green-50 rounded-xl text-green-600 font-bold shrink-0">
                                        <span className="text-xs uppercase">{new Date(app.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                        <span className="text-lg leading-none">{new Date(app.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{app.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.hospitalName}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(app._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentView;
