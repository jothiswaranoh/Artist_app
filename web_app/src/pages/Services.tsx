import React, { useState, useMemo } from 'react';
import { useServiceOfferings } from '../hooks/useServiceOfferings';
import type { ServiceOffering } from '../services/ServiceOfferingService';
import {
    Search,
    Plus,
    Clock,
    Users,
    Star,
    ArrowRight,
    Sparkles,
    Palette,
    AlertCircle
} from 'lucide-react';
import './Services.css';
import { motion } from 'framer-motion';

const Services: React.FC = () => {
    const { serviceOfferings, isLoading, error } = useServiceOfferings();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredServices = useMemo(() => {
        return serviceOfferings.filter((s: ServiceOffering) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [serviceOfferings, searchQuery]);

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={12}
                    fill={i < Math.floor(rating) ? '#f59e0b' : 'transparent'}
                    color={i < Math.floor(rating) ? '#f59e0b' : '#475569'}
                    strokeWidth={1.5}
                />
            );
        }
        return stars;
    };

    const getIconForService = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('makeup') || n.includes('bridal')) return { icon: <Heart size={18} />, color: '#ef4444' };
        if (n.includes('facial') || n.includes('skin')) return { icon: <Sparkles size={18} />, color: '#10b981' };
        if (n.includes('hair') || n.includes('style')) return { icon: <Palette size={18} />, color: '#ec4899' };
        return { icon: <Sparkles size={18} />, color: '#3b82f6' };
    };
    
    // Fallback Heart for import
    const Heart = ({ size }: { size: number }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    )

    if (isLoading) {
        return (
            <div className="page-loading">
                <div className="spinner" />
                <span>Loading services...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="services-page"
        >
            {/* Header */}
            <div className="services-header">
                <div>
                    <h1 className="services-title">All Services</h1>
                    <span className="services-subtitle">{serviceOfferings.length} beauty services offered</span>
                </div>
                <button className="add-btn" id="add-service">
                    <Plus size={20} />
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    <span>{error instanceof Error ? error.message : String(error)}</span>
                </div>
            )}

            {/* Search Bar */}
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    id="search-services"
                />
            </div>

            {/* Service Cards */}
            <div className="services-list">
                {filteredServices.map((service: ServiceOffering, index: number) => {
                    const { icon, color } = getIconForService(service.name);
                    return (
                        <motion.div
                            key={service.id}
                            className="service-card"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                            <div className="service-top">
                                <div className="service-left">
                                    <div className="service-icon" style={{
                                        background: `${color}15`,
                                        color: color,
                                    }}>
                                        {icon}
                                    </div>
                                    <div className="service-info">
                                        <span className="service-name">{service.name}</span>
                                        <span className="service-desc">{service.description || 'No description provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="service-meta">
                                <span className="service-detail">
                                    <Clock size={13} /> {service.duration_minutes} min
                                </span>
                                <span className="service-detail">
                                    <Users size={13} /> 0 booked
                                </span>
                            </div>

                            <div className="service-bottom">
                                <span className="service-price">${service.price}</span>
                                <div className="service-right">
                                    <div className="service-rating">
                                        {renderStars(5)}
                                        <span className="rating-value">5.0</span>
                                    </div>
                                    <button className="view-details-btn">
                                        View Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredServices.length === 0 && (
                    <div className="empty-state">
                        <Search size={32} className="empty-icon" />
                        <p>No services found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Services;
