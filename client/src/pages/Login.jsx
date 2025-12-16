import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useUserLoginMutation } from "../Redux/AllApi/UserApi";
import { setCredentials } from "../Redux/Slices/AuthSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { IconLoader2, IconMail, IconLock, IconEye, IconEyeOff, IconShieldLock } from "@tabler/icons-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useUserLoginMutation();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();

            const user = res.data.user;
            const accessToken = res.data.accessToken;

            dispatch(setCredentials({ user, accessToken }));
            toast.success("Login successful!");
            navigate("/");
        } catch (err) {
            console.error(err);
            toast.error(err?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
                <img
                    src="/UNO.avif"
                    alt="Login Visual"
                    className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-gray-200">Securely access your employee portal.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 relative">
                <Card className="w-full max-w-md bg-white shadow-2xl border border-gray-200 rounded-2xl relative overflow-hidden">
                    {/* Decorative top accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                    <CardHeader className="space-y-1 text-center pt-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <IconShieldLock className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                            Login
                        </CardTitle>
                        <CardDescription>
                            Enter your email and password to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 mt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-10 border-gray-300 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-blue-600 hover:text-blue-800 disabled pointer-events-none opacity-50 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10 h-10 border-gray-300 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <IconEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IconEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white transition-all font-medium text-base" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-4 w-4 animate-spin" />
                                        Checking credentials...
                                    </div>
                                ) : (
                                    "Log in"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col space-y-4">
                        <p className="text-xs text-center text-gray-500">
                            Protected by 10Sight Technologies Security
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
