import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AnganwadiLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        officialEmail: "",
        password: "",
        centerName: "",
        district: "",
        state: "Karnataka", // Default for now
        anganwadiCenterId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin) {
            // Password validation: minimum 10 chars with required complexity
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
            if (!passwordRegex.test(formData.password)) {
                toast.error("Password must be at least 10 characters and include uppercase, lowercase, number, and special character");
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true);
        try {
            const endpoint = isLogin ? "/api/anganwadi/login" : "/api/anganwadi/register";
            const { data } = await axios.post(endpoint, formData, {
                withCredentials: true
            });

            if (isLogin) {
                toast.success(`Welcome back, ${data.centerName}`);
                navigate("/anganwadi/dashboard");
            } else {
                toast.success("Registration successful! Please login.");
                setIsLogin(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4FAF9] flex items-center justify-center p-4 font-sans text-[#1F2937]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E8F5F3]"
            >
                {/* Header */}
                <div className="bg-[#2E7D6B] p-8 text-center">
                    <div className="w-16 h-16 bg-[#F4FAF9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Building2 className="w-8 h-8 text-[#2E7D6B]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Anganwadi Connect</h1>
                    <p className="text-[#E8F5F3] text-sm">Administrative Portal</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Center Name</label>
                                    <input
                                        type="text"
                                        name="centerName"
                                        value={formData.centerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Kaggalipura Center 1"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E7D6B] outline-none"
                                            placeholder="District"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="officialEmail"
                                    value={formData.officialEmail}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none transition-all"
                                    placeholder="admin@anganwadi.gov.in"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Login with Center ID option could be added here, but reusing Email field for simplicity or adding logic */}
                        {isLogin && (
                            <div className="text-right">
                                <button type="button" className="text-xs text-[#2E7D6B] hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2E7D6B] hover:bg-[#256657] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Access Portal" : "Register Center"}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {isLogin ? "New Center?" : "Already registered?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[#2E7D6B] font-bold hover:underline"
                            >
                                {isLogin ? "Register Here" : "Login Here"}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer disclaimer */}
                <div className="bg-[#F4FAF9] p-4 text-center border-t border-[#E8F5F3]">
                    <p className="text-xs text-gray-500">
                        Restricted Access. Government Authorised Personnel Only.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AnganwadiLogin;
