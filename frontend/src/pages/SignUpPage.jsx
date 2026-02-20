import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { User, Mail, Lock } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Password validation: minimum 10 chars with required complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 10 characters and include uppercase, lowercase, number, and special character");
            return;
        }

        try {
            await signup({ name, email, password });
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join our community of expecting mothers</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            icon={User}
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
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

                    <Button type="submit" isLoading={isSigningUp}>
                        Sign Up
                    </Button>

                    <div className="text-sm text-center">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
