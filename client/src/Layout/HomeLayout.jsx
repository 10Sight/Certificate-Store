import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux/Slices/AuthSlice";
import { toast } from "sonner";
import {
  IconLayoutDashboardFilled,
  IconLayoutSidebarRightCollapse,
  IconLogout,
  IconMail,
  IconArticle,
  IconClipboardList,
  IconShoppingCart,
  IconTarget,
  IconCertificate,
  IconFolder,
  IconUsers,
  IconChartPie,
  IconUser,
  IconSettings,
  IconDatabase,
  IconShield,
  IconReport,
  IconTrash,
  IconFileAnalytics,
  IconServerBolt,
  IconBulb,
  IconDownload,
  IconClock,
} from "@tabler/icons-react";
import { HomeIcon } from "lucide-react";

const tabs = [
  {
    category: "Overview",
    items: [
      { link: "/", label: "Dashboard", icon: IconLayoutDashboardFilled },
    ]
  },
  {
    category: "User Management",
    items: [
      { link: "/all-users", label: "All Users", icon: IconUsers },
    ]
  },
];

const HomeLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    window.innerWidth >= 820 ? false : true
  );
  const [pageName, setPageName] = useState("Dashboard");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isLoading = false;

  // Update page name based on current route
  // Update page name based on current route
  useEffect(() => {
    // 1. Check for exact match in Sidebar Tabs
    let foundTab = null;
    for (const category of tabs) {
      foundTab = category.items.find(tab => pathname === tab.link);
      if (foundTab) break;
    }

    if (foundTab) {
      setPageName(foundTab.label);
      return;
    }

    // 2. Handle specific known routes or prefixes
    if (pathname === '/' || pathname === '/superadmin') {
      setPageName("Dashboard");
    } else if (pathname.startsWith('/employee/')) {
      setPageName("Employee Detail");
    } else if (pathname.startsWith('/process')) {
      setPageName("Process Flow");
    } else {
      // 3. Fallback: formatted pathname
      const routeName = pathname.split("/").filter(Boolean).pop();
      if (routeName) {
        setPageName(routeName.charAt(0).toUpperCase() + routeName.slice(1).replace(/-/g, " "));
      } else {
        setPageName("Dashboard");
      }
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

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


  const ToggleButton = ({ opened, onClick, ariaLabel }) => {
    return (
      <IconLayoutSidebarRightCollapse
        className={`${opened ? "rotate-180" : "mx-auto"
          } min-w-5 min-h-5 duration-500 transition-all cursor-pointer text-gray-600 hover:text-gray-800`}
        onClick={onClick}
        aria-label={ariaLabel}
      />
    );
  };

  // PWA Install Prompt Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Only show if user is authenticated (which is true if they are in HomeLayout usually, but good to check)
      if (user) {
        setShowInstallDialog(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, so clear it
    setDeferredPrompt(null);
    setShowInstallDialog(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconDownload className="h-6 w-6 text-blue-600" />
              Install Application
            </DialogTitle>
            <DialogDescription>
              Install the 10Sight Certificate Store app on your device for quick access and a better experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" onClick={() => setShowInstallDialog(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleInstallClick} className="bg-blue-600 hover:bg-blue-700">
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 text-black shadow-2xl transition-all duration-300 z-20
                ${collapsed ? "w-16" : "w-64"} `}
      >
        <div
          className={`relative h-16 items-center flex transition-all p-4 duration-300 z-50 border-b border-gray-200/80 bg-white/50 backdrop-blur-sm`}
        >
          <ToggleButton
            opened={!collapsed}
            onClick={toggleSidebar}
            ariaLabel="Toggle sidebar"
          />
          {!collapsed && (
            <span className="ml-4 py-1 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              UNO MINDA (MANESAR)
            </span>
          )}
        </div>

        {/* Sidebar Tabs */}
        <div className="px-2 flex flex-col w-full py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {tabs.map((category) => (
            <div key={category.category} className="mb-4">
              {!collapsed && (
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category.category}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive =
                    item.link === "/"
                      ? pathname === "/" || pathname === "/superadmin"
                      : pathname.startsWith(item.link);

                  return (
                    <div
                      className={`group relative flex items-center cursor-pointer w-full overflow-hidden h-10 rounded-xl transition-all duration-300 hover:scale-[1.02]
                      ${isActive
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200"
                          : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 hover:shadow-md"
                        }
                      ${collapsed ? "justify-center mx-1" : "items-center px-3"}`}
                      key={item.label}
                      onClick={() => navigate(item.link)}
                      title={collapsed ? item.label : ''}
                    >
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />
                      )}
                      <item.icon
                        className={`${collapsed ? "w-5 h-5" : "min-w-4 min-h-4"
                          } transition-transform group-hover:scale-110`}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                      {!collapsed && (
                        <span className="ml-3 text-sm font-medium transition-all group-hover:translate-x-0.5">{item.label}</span>
                      )}
                      {!collapsed && (
                        <div className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-purple-200' : 'text-gray-400'
                          }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="absolute bottom-4 w-full px-2">
          <div
            className={`p-2 flex items-center rounded-lg w-full transition-all duration-200 ${isLoading
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "hover:bg-red-50 hover:text-red-600 cursor-pointer"
              } ${collapsed ? "justify-center" : "px-3"
              }`}
            onClick={isLoading ? undefined : handleLogout}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
            ) : (
              <IconLogout className="min-w-5 min-h-5" stroke={1.5} />
            )}
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">
                {isLoading ? "Logging out..." : "Logout"}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"
          }`}
      >
        {/* Header */}
        <header
          className={`px-4 sm:px-6 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/80 flex h-16 items-center justify-between gap-2 sm:gap-4 fixed right-0 top-0 z-30 transition-all duration-300 ${collapsed ? "w-[calc(100%-4rem)]" : "w-[calc(100%-16rem)]"
            }`}
        >
          {/* Left side (Breadcrumb) */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link
                  to="/superadmin"
                  className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <HomeIcon size={18} aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-800 font-medium">
                  {pageName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right side (Avatar) */}
          <div className="relative flex items-center gap-3">
            <div className="mr-2 text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                {user?.fullName || user?.userName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase?.().replace?.('_', ' ') || 'Super Admin'}
              </p>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="relative size-9 sm:size-10 group">
                <img
                  src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.userName || 'Admin User')}&background=7c3aed&color=fff`}
                  className="rounded-full size-full border-2 border-white shadow-md object-cover transition-transform group-hover:scale-105 ring-2 ring-purple-100"
                  alt="User avatar"
                />
                <div className="absolute bg-green-500 rounded-full bottom-0 right-0 size-2.5 sm:size-3 border-2 border-white"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-20 pb-6 px-4 sm:px-6 min-h-screen">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;