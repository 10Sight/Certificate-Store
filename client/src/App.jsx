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
const DepartmentManager = lazy(() => import('./pages/Admin/DepartmentManager'));
const DepartmentDetail = lazy(() => import('./pages/Admin/DepartmentDetail'));
const UserQuestions = lazy(() => import('./pages/Admin/UserQuestions'));
const CreateQuestionTemplate = lazy(() => import('./pages/Admin/CreateQuestionTemplate'));
const AssessmentList = lazy(() => import('./pages/Admin/AssessmentList'));
const EmployeeLayout = lazy(() => import('./Layout/EmployeeLayout'));
const EmployeeDashboard = lazy(() => import('./pages/Employee/EmployeeDashboard'));

const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
            <Route path="/dashboard" element={<EmployeeLayout><EmployeeDashboard /></EmployeeLayout>} />
            <Route path="/all-users" element={<HomeLayout><AllUser /></HomeLayout>} />
            <Route path="/process-flow" element={<HomeLayout><ProcessPage /></HomeLayout>} />
            <Route path="/employee/:id" element={<HomeLayout><EmployeeDetail /></HomeLayout>} />
            <Route path="/admin/departments" element={<HomeLayout><DepartmentManager /></HomeLayout>} />
            <Route path="/admin/department/:id" element={<HomeLayout><DepartmentDetail /></HomeLayout>} />
            <Route path="/employee/:id/questions" element={<HomeLayout><UserQuestions /></HomeLayout>} />
            <Route path="/employee/:id/assessments" element={<HomeLayout><AssessmentList /></HomeLayout>} />
            <Route path="/admin/template/:categoryType/:categoryReference/create" element={<HomeLayout><CreateQuestionTemplate /></HomeLayout>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors />
    </Router>
  );
};

export default App;
