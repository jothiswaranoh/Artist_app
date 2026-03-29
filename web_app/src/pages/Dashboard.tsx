import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Handshake,
    CalendarCheck,
    TrendingUp,
    Clock,
    ChevronRight,
    Star,
    Layers,
    DollarSign
} from 'lucide-react';
import { useResource } from '../hooks/useResource';
import { AuthService } from '../services/AuthService';
import './Dashboard.css';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data, loading } = useResource<any>('/dashboard');
    const stats = data?.stats;
    const user = AuthService.getCurrentUser();
    const role = user?.role || 'customer';
    const bookingsEndpoint = role === 'artist'
        ? '/bookings/artist_bookings?per_page=10'
        : '/bookings/my_bookings?per_page=10';
    const { data: bookingData, loading: bookingsLoading } = useResource<any>(bookingsEndpoint);

    // Admin stat cards
    const adminStatCards = [
        { label: 'Total Artists', value: stats?.total_artists || 0, icon: <Users />, color: '#ec4899' },
        { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: <CalendarCheck />, color: 'var(--accent-primary)' },
        { label: 'Active Services', value: stats?.total_services || 0, icon: <Handshake />, color: '#f59e0b' },
        { label: 'Revenue', value: `$${stats?.total_payments || stats?.total_revenue || 0}`, icon: <TrendingUp />, color: '#ec4899' },
    ];

    // Artist stat cards
    const artistStatCards = [
        { label: 'My Bookings', value: stats?.total_bookings || 0, icon: <CalendarCheck />, color: '#ec4899' },
        { label: 'My Services', value: stats?.total_services || 0, icon: <Layers />, color: 'var(--accent-primary)' },
        { label: 'Revenue', value: `$${stats?.total_revenue || 0}`, icon: <DollarSign />, color: '#ec4899' },
        { label: 'Reviews', value: stats?.total_reviews || 0, icon: <Star />, color: '#f59e0b' },
    ];

    // Customer stat cards
    const customerStatCards = [
        { label: 'My Bookings', value: stats?.total_bookings || 0, icon: <CalendarCheck />, color: '#ec4899' },
        { label: 'Total Spent', value: `$${stats?.total_spent || 0}`, icon: <DollarSign />, color: '#ec4899' },
    ];

    const statCards = role === 'admin' ? adminStatCards : role === 'artist' ? artistStatCards : customerStatCards;

    const upcomingBookings = React.useMemo(() => {
        if (!bookingData) return [];
        const today = new Date().toISOString().split('T')[0];
        const list = Array.isArray(bookingData)
            ? bookingData
            : Array.isArray(bookingData?.data)
                ? bookingData.data
                : [];

        return list
            .filter((b: any) =>
                b.booking_date >= today &&
                ['pending', 'confirmed'].includes((b.status || '').toLowerCase())
            )
            .sort((a: any, b: any) => (a.booking_date || '').localeCompare(b.booking_date || ''))
            .slice(0, 5);
    }, [bookingData]);

    const formatDateTime = (booking: any) => {
        const date = booking.booking_date ? new Date(booking.booking_date) : null;
        const label = date
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—';
        const time = booking.start_time ? booking.start_time.slice(0, 5) : '';
        return time ? `${label} · ${time}` : label;
    };

    if (loading) {
        return (
            <div className="center-loader">
                <div className="loader large" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dashboard"
        >
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card glass"
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="recent-section glass">
                    <div className="section-header">
                        <h3>{role === 'admin' ? 'Recent Bookings' : 'Upcoming Appointments'}</h3>
                        <button className="view-all" onClick={() => navigate(role === 'admin' ? '/bookings' : '/my-bookings')}>View All <ChevronRight size={16} /></button>
                    </div>
                    <div className="recent-list">
                        {bookingsLoading && (
                            <div className="recent-item">
                                <div className="item-info">
                                    <p className="item-name">Loading appointments...</p>
                                </div>
                            </div>
                        )}
                        {!bookingsLoading && upcomingBookings.length === 0 && (
                            <div className="recent-item">
                                <div className="item-info">
                                    <p className="item-name">No upcoming appointments</p>
                                    <p className="item-sub">Book a service to see it here.</p>
                                </div>
                            </div>
                        )}
                        {!bookingsLoading && upcomingBookings.map((booking: any) => (
                            <div key={booking.id} className="recent-item">
                                <div className="item-avatar">
                                    {(booking.service_name || booking.service?.name || 'S').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="item-info">
                                    <p className="item-name">
                                        {role === 'artist'
                                            ? (booking.customer_name || booking.customer?.name || booking.customer?.email || 'Customer')
                                            : (booking.service_name || booking.service?.name || 'Service')}
                                    </p>
                                    <p className="item-sub">
                                        {role === 'artist'
                                            ? (booking.service_name || booking.service?.name || 'Service')
                                            : formatDateTime(booking)}
                                    </p>
                                </div>
                                <div className="item-meta">
                                    <p className="item-time">
                                        <Clock size={12} /> {formatDateTime(booking)}
                                    </p>
                                    <span className={`status-badge ${booking.status || 'pending'}`}>
                                        {(booking.status || '').charAt(0).toUpperCase() + (booking.status || '').slice(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="performance-section glass">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        {role === 'admin' ? (
                            <>
                                <button className="action-card btn-glass" onClick={() => navigate('/users')}>
                                    <span className="action-title">Manage Users</span>
                                    <p className="action-desc">View and manage platform users</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/artists')}>
                                    <span className="action-title">Manage Artists</span>
                                    <p className="action-desc">Approve and manage artist profiles</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/bookings')}>
                                    <span className="action-title">View Bookings</span>
                                    <p className="action-desc">Monitor all platform bookings</p>
                                </button>
                            </>
                        ) : role === 'artist' ? (
                            <>
                                <button className="action-card btn-glass" onClick={() => navigate('/my-services')}>
                                    <span className="action-title">Add Service</span>
                                    <p className="action-desc">Create a new service offering</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/my-bookings')}>
                                    <span className="action-title">View Bookings</span>
                                    <p className="action-desc">Check your upcoming appointments</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/my-reviews')}>
                                    <span className="action-title">View Reviews</span>
                                    <p className="action-desc">See customer feedback</p>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="action-card btn-glass" onClick={() => navigate('/find-artists')}>
                                    <span className="action-title">Find Artists</span>
                                    <p className="action-desc">Browse and book talented artists</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/my-bookings')}>
                                    <span className="action-title">My Bookings</span>
                                    <p className="action-desc">Check your appointments</p>
                                </button>
                                <button className="action-card btn-glass" onClick={() => navigate('/settings')}>
                                    <span className="action-title">Account Settings</span>
                                    <p className="action-desc">Manage your profile</p>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
