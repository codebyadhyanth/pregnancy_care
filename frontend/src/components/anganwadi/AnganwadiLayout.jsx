import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Calendar,
    ArrowRightLeft,
    LogOut,
    Building2,
    Menu,
    X,
    Megaphone,
    Baby
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AnganwadiLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [centerInfo, setCenterInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch real centre data from API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get("/api/anganwadi/profile", {
                    withCredentials: true
                });
                setCenterInfo(data);
            } catch (error) {
                console.error("Failed to fetch center profile:", error);
                // If auth fails, redirect to login
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate("/anganwadi/login");
                }
            }
        };
        fetchProfile();
    }, [navigate]);

    const centerName = centerInfo?.centerName || "Loading...";
    const centerId = centerInfo?.anganwadiCenterId || "";

    const handleLogout = async () => {
        try {
            await axios.post("/api/anganwadi/logout", {}, { withCredentials: true });
            navigate("/anganwadi/login");
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { path: "/anganwadi/dashboard", icon: LayoutDashboard, label: "Overview" },
        { path: "/anganwadi/beneficiaries", icon: Users, label: "Beneficiaries" },
        { path: "/anganwadi/requests", icon: Users, label: "Join Requests" },
        { path: "/anganwadi/visits", icon: Calendar, label: "Visits" },
        { path: "/anganwadi/migration", icon: ArrowRightLeft, label: "Migration" },
        { path: "/anganwadi/reports", icon: LayoutDashboard, label: "Reports" },
        { path: "/anganwadi/facilities", icon: Building2, label: "Facilities" },
        { path: "/anganwadi/babies", icon: Baby, label: "Baby Records" },
        { path: "/anganwadi/guidance", icon: Megaphone, label: "Guidance" },
    ];

    return (
        <div className="min-h-screen bg-[#F4FAF9] flex font-sans text-[#1F2937]">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8F5F3] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-[#E8F5F3] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#2E7D6B] rounded-lg flex items-center justify-center shadow-md">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-[#2E7D6B] leading-tight">Anganwadi<br />Connect</h2>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive
                                        ? "bg-[#E8F5F3] text-[#2E7D6B]"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-[#2E7D6B]"
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-[#E8F5F3] bg-gray-50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#4F9D92] flex items-center justify-center text-white font-bold text-lg">
                                {centerName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{centerName}</p>
                                {centerId && (
                                    <p className="text-xs text-gray-500 font-mono">{centerId}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-red-100"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-[#E8F5F3] p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#2E7D6B]">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-[#2E7D6B]">Anganwadi Connect</span>
                    <div className="w-8" /> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {!centerInfo ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D6B]"></div>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnganwadiLayout;
