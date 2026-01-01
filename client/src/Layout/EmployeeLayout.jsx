import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "@/Redux/Slices/AuthSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconLogout, IconUser } from "@tabler/icons-react";

const EmployeeLayout = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await dispatch(logout());
            toast.success("Logged out successfully");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed", error);
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Minimal Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <IconUser className="text-white h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wider text-gray-900 leading-tight">
                            Employee Dashboard
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium">UNO MINDA (MANESAR)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.iCardNumber}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
                    >
                        <IconLogout size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-4 px-8 border-t border-gray-200 bg-white text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} 10Sight Technologies Security | Employee Portal
            </footer>
        </div>
    );
};

export default EmployeeLayout;
