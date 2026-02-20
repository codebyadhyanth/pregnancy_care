import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './components/ui/NotificationProvider';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdvicePage from './pages/AdvicePage';
import CommunityPage from './pages/CommunityPage';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Services from './pages/Services';
import BlogsPage from './pages/BlogsPage';
import ContactPage from './pages/ContactPage';
import AnganwadiPage from './pages/AnganwadiPage';
import PublicPostsPage from './pages/PublicPostsPage';
import GovernmentSupport from './pages/GovernmentSupport';

// Anganwadi Pages
import AnganwadiLogin from './pages/anganwadi/AnganwadiLogin';
import AnganwadiLayout from './components/anganwadi/AnganwadiLayout';
import AnganwadiDashboard from './pages/anganwadi/AnganwadiDashboard';
import AnganwadiGenerateId from "./pages/anganwadi/AnganwadiGenerateId";
import AnganwadiBeneficiaries from './pages/anganwadi/AnganwadiBeneficiaries';
import AnganwadiBeneficiaryDetail from './pages/anganwadi/AnganwadiBeneficiaryDetail';
import AnganwadiVisits from './pages/anganwadi/AnganwadiVisits';
import AnganwadiMigration from './pages/anganwadi/AnganwadiMigration';
import AnganwadiReports from './pages/anganwadi/AnganwadiReports';
import AnganwadiFacilities from './pages/anganwadi/AnganwadiFacilities';
import AnganwadiRequests from './pages/anganwadi/AnganwadiRequests';
import AnganwadiGuidance from './pages/anganwadi/AnganwadiGuidance';
import AnganwadiBabyTab from './pages/anganwadi/AnganwadiBabyTab';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Anganwadi Portal - Separate Internal Layout */}
          <Route path="/anganwadi/login" element={<AnganwadiLogin />} />

          <Route path="/anganwadi" element={<AnganwadiLayout />}>
            <Route path="dashboard" element={<AnganwadiDashboard />} />
            <Route path="generate-id" element={<AnganwadiGenerateId />} />
            <Route path="beneficiaries" element={<AnganwadiBeneficiaries />} />
            <Route path="beneficiaries/:momId" element={<AnganwadiBeneficiaryDetail />} />
            <Route path="visits" element={<AnganwadiVisits />} />
            <Route path="migration" element={<AnganwadiMigration />} />
            <Route path="reports" element={<AnganwadiReports />} />
            <Route path="facilities" element={<AnganwadiFacilities />} />
            <Route path="requests" element={<AnganwadiRequests />} />
            <Route path="guidance" element={<AnganwadiGuidance />} />
            <Route path="babies" element={<AnganwadiBabyTab />} />
          </Route>

          {/* Main Application */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="services" element={<Services />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route
              path="gov-support"
              element={
                <ProtectedRoute>
                  <GovernmentSupport />
                </ProtectedRoute>
              }
            />
            {/* Protected Routes */}
            <Route path="advice" element={
              <ProtectedRoute>
                <AdvicePage />
              </ProtectedRoute>
            } />
            <Route path="community" element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="anganwadi-care" element={
              <ProtectedRoute>
                <PublicPostsPage />
              </ProtectedRoute>
            } />


            <Route path="onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* Placeholders for other links */}
            <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
