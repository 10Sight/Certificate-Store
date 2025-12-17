import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import HomeLayout from './Layout/HomeLayout';
import RequireAuth from './components/auth/RequireAuth';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AllUser = lazy(() => import('./pages/Admin/AllUser'));
const EmployeeDetail = lazy(() => import('./pages/Admin/EmployeeDetail'));
const ProcessPage = lazy(() => import('./pages/ProcessPage'));
const Login = lazy(() => import('./pages/Login'));

const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

const About = () => <h2 className="text-2xl text-blue-400">About Page</h2>;

const App = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
            <Route path="/all-users" element={<HomeLayout><AllUser /></HomeLayout>} />
            <Route path="/process-flow" element={<HomeLayout><ProcessPage /></HomeLayout>} />
            <Route path="/employee/:id" element={<HomeLayout><EmployeeDetail /></HomeLayout>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors />
    </Router>
  );
};

export default App;
