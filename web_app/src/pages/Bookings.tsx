import React, { useState, useMemo } from 'react';
import { useBookings } from '../hooks/useBookings';
import type { Booking } from '../services/BookingService';
import {
    CalendarDays,
    Clock3,
    Timer,
    MapPin,
    Plus,
    CheckCircle2,
    AlertCircle,
    CircleDot,
    StickyNote,
} from 'lucide-react';
import './Bookings.css';
import { motion, AnimatePresence } from 'framer-motion';

const Bookings: React.FC = () => {
    const { bookings, isLoading, error } = useBookings();
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const filteredBookings = useMemo(() => {
        if (activeFilter === 'all') return bookings;
        return bookings.filter((b: Booking) => b.status.toLowerCase() === activeFilter);
    }, [bookings, activeFilter]);

    const summaryCards = useMemo(() => [
        { label: 'Upcoming', value: bookings.filter((b: Booking) => b.status === 'confirmed').length, icon: <CalendarDays size={22} />, color: '#3b82f6' },
        { label: 'Pending', value: bookings.filter((b: Booking) => b.status === 'pending').length, icon: <AlertCircle size={22} />, color: '#f59e0b' },
        { label: 'Done', value: bookings.filter((b: Booking) => b.status === 'completed').length, icon: <CheckCircle2 size={22} />, color: '#10b981' },
    ], [bookings]);

    const filters = [
        { key: 'all', label: 'All', color: '#3b82f6' },
        { key: 'pending', label: 'Pending', color: '#f59e0b' },
        { key: 'confirmed', label: 'Confirmed', color: '#10b981' },
        { key: 'completed', label: 'Completed', color: '#8b5cf6' },
        { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'completed': return '#8b5cf6';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };
    
    const avatarGradients = ['linear-gradient(135deg, #3b82f6, #1d4ed8)', 'linear-gradient(135deg, #a855f7, #7c3aed)', 'linear-gradient(135deg, #f59e0b, #d97706)'];
    const getAvatarBg = (id: string) => avatarGradients[id.charCodeAt(0) % avatarGradients.length];

    if (isLoading) {
        return (
            <div className="page-loading">
                <div className="spinner" />
                <span>Loading bookings...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bookings-page"
        >
            {/* Header */}
            <div className="bookings-header">
                <div>
                    <h1 className="bookings-title">System Bookings</h1>
                    <span className="bookings-subtitle">{bookings.length} total appointments found</span>
                </div>
                <button className="add-btn" id="add-booking">
                    <Plus size={20} />
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    <span>{error instanceof Error ? error.message : String(error)}</span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="summary-cards">
                {summaryCards.map((card, index) => (
                    <motion.div
                        key={index}
                        className="summary-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <div className="summary-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <span className="summary-value">{card.value}</span>
                        <span className="summary-label">{card.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Filter Chips */}
            <div className="filter-chips">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        className={`filter-chip ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter.key)}
                        style={activeFilter === filter.key ? {
                            background: `${filter.color}20`,
                            borderColor: `${filter.color}40`,
                            color: filter.color,
                        } : {}}
                    >
                        <CircleDot size={12} style={{ color: filter.color }} />
                        {filter.label}
                        {activeFilter === filter.key && <span className="chip-close">×</span>}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="bookings-list-header">
                <h3>{activeFilter === 'all' ? 'All Bookings' : `${formatStatus(activeFilter)} Bookings`}</h3>
                <span className="results-count">{filteredBookings.length} results</span>
            </div>

            <div className="bookings-list">
                {filteredBookings.length === 0 && !isLoading ? (
                     <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                         <CalendarDays size={32} style={{ margin: '0 auto 12px auto', color: '#64748b' }} />
                         <p style={{ color: '#94a3b8' }}>No bookings found for the selected filter.</p>
                     </div>
                ) : (
                    <AnimatePresence>
                        {filteredBookings.map((booking: Booking, index: number) => (
                            <motion.div
                                key={booking.id}
                                className="booking-card"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <div className="card-top">
                                    <div className="card-left">
                                        <div className="card-avatar" style={{ background: getAvatarBg(booking.id) }}>
                                            B
                                        </div>
                                        <div className="card-person">
                                            <span className="card-name">Booking #{booking.id.slice(0, 8)}</span>
                                            <span className="card-service">Service ID: {booking.service_id.slice(0,8)}...</span>
                                        </div>
                                    </div>
                                    <span className="card-status" style={{ color: getStatusColor(booking.status) }}>
                                        <span className="status-dot" style={{ background: getStatusColor(booking.status) }}></span>
                                        {formatStatus(booking.status)}
                                    </span>
                                </div>

                                <div className="card-details">
                                    <span className="card-detail">
                                        <CalendarDays size={13} /> {new Date(booking.booking_date).toLocaleDateString()}
                                    </span>
                                    <span className="card-detail">
                                        <Clock3 size={13} /> {booking.start_time} - {booking.end_time || 'TBD'}
                                    </span>
                                </div>

                                <div className="card-bottom">
                                    <span className="card-location">
                                        <MapPin size={13} /> Location matches service
                                    </span>
                                    <span className="card-amount">${booking.total_amount || 0}</span>
                                </div>

                                {/* Placeholder for notes if backend adds it */}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

export default Bookings;
