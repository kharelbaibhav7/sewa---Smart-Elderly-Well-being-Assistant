import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("guardian");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.data.role);
                localStorage.setItem("user", JSON.stringify(data.data));
                toast.success("Logged in successfully");
                if (data.data.role === "guardian") {
                    navigate("/guardian/dashboard");
                } else if (data.data.role === "patient") {
                    navigate("/patient/dashboard");
                } else {
                    navigate("/hospital/dashboard");
                }
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md p-6 md:p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold text-center mb-6 bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                <div className="flex justify-center mb-6 space-x-4">
                    <button
                        onClick={() => setRole("guardian")}
                        className={`px-4 py-2 rounded-lg transition-all ${role === "guardian"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        Guardian
                    </button>
                    <button
                        onClick={() => setRole("patient")}
                        className={`px-4 py-2 rounded-lg transition-all ${role === "patient"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        Patient
                    </button>
                    <button
                        onClick={() => setRole("hospital")}
                        className={`px-4 py-2 rounded-lg transition-all ${role === "hospital"
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        Hospital
                    </button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 rounded-lg bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Login"}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
