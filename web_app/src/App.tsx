import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import AdminsPage from './pages/Admins';
import ArtistsPage from './pages/Artists';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyServicesPage from './pages/artist/MyServices';
import MyBookingsPage from './pages/artist/MyBookings';
import MyReviewsPage from './pages/artist/MyReviews';
import BrowseArtistsPage from './pages/customer/BrowseArtists';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthService } from './services/AuthService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/common/Toast';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Auth guard: must be logged in
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const user = AuthService.getCurrentUser();
    return user ? <>{children}</> : <Navigate to="/login" />;
};

// Role guard: must have the correct role(s)
const RoleGuard = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    const user = AuthService.getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

// Reactive layout selection — renders inside PrivateRoute so user is guaranteed non-null
const AuthenticatedLayout = () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'admin' ? <AdminLayout /> : <Layout />;
};

// 404 Page
const NotFound = () => (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '2rem', marginBottom: '8px' }}>404</h1>
        <p style={{ marginBottom: '24px' }}>Page not found</p>
        <a href="/" style={{ color: '#ec4899', textDecoration: 'underline' }}>Go to Dashboard</a>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <BrowserRouter>
                        <Routes>

                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            <Route
                                path="/"
                                element={
                                    <PrivateRoute>
                                        <AuthenticatedLayout />
                                    </PrivateRoute>
                                }
                            >
                                <Route index element={<Dashboard />} />

                                {/* Admin-only Pages */}
                                <Route path="users" element={<RoleGuard allowedRoles={['admin']}><UsersPage /></RoleGuard>} />
                                <Route path="admins" element={<RoleGuard allowedRoles={['admin']}><AdminsPage /></RoleGuard>} />
                                <Route path="artists" element={<RoleGuard allowedRoles={['admin']}><ArtistsPage /></RoleGuard>} />

                                {/* Artist-only Pages */}
                                <Route path="my-services" element={<RoleGuard allowedRoles={['artist']}><MyServicesPage /></RoleGuard>} />
                                <Route path="my-bookings" element={<RoleGuard allowedRoles={['artist', 'customer']}><MyBookingsPage /></RoleGuard>} />
                                <Route path="my-reviews" element={<RoleGuard allowedRoles={['artist', 'customer']}><MyReviewsPage /></RoleGuard>} />

                                {/* Customer-only Pages */}
                                <Route path="find-artists" element={<RoleGuard allowedRoles={['customer']}><BrowseArtistsPage /></RoleGuard>} />

                                {/* Admin routes for services/bookings/reviews (admin sees all) */}
                                <Route path="services" element={<RoleGuard allowedRoles={['admin']}><MyServicesPage /></RoleGuard>} />
                                <Route path="bookings" element={<RoleGuard allowedRoles={['admin']}><MyBookingsPage /></RoleGuard>} />
                                <Route path="reviews" element={<RoleGuard allowedRoles={['admin']}><MyReviewsPage /></RoleGuard>} />

                                {/* Shared Pages */}
                                <Route path="settings" element={<div style={{ padding: '24px', color: '#94a3b8' }}><h1 style={{ color: '#f8fafc', marginBottom: '8px' }}>Account Settings</h1><p>Settings page coming soon.</p></div>} />

                                {/* 404 catch-all */}
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}


export default App;
