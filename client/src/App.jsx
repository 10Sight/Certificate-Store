import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomeLayout from './Layout/HomeLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AllUser from './pages/Admin/AllUser';
import EmployeeDetail from './pages/Admin/EmployeeDetail';

import ProcessPage from './pages/ProcessPage';
import Login from './pages/Login';
import RequireAuth from './components/auth/RequireAuth';

const About = () => <h2 className="text-2xl text-blue-400">About Page</h2>;

const App = () => {
  return (
    <Router>
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
      <Toaster position="bottom-right" richColors />
    </Router>
  );
};

export default App;
