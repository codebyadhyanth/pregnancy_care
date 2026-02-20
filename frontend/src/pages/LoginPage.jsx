import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoggingIn } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" isLoading={isLoggingIn}>
                        Log In
                    </Button>

                    <div className="text-sm text-center">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
