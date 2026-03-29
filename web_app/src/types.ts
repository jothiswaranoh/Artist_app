// ─── Centralized Type Definitions ───────────────────────────────────────────
// Single source of truth for shared types used across services, hooks, and pages.

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    email: string;
    role: 'admin' | 'artist' | 'customer';
    name?: string;
    phone?: string;
    address?: string;
    preferences?: string;
    loyalty_status?: string;
    artist_profile?: {
        id: string;
        city?: string;
        bio?: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    password_confirmation: string;
    role: 'artist' | 'customer';
}

// ─── Re-exports from service files (convenience) ────────────────────────────
// Consumers can import from either location.

export type { User, PaginationMeta } from './services/UserService';
export type { ArtistProfile } from './services/ArtistProfileService';
export type { Booking } from './services/BookingService';
export type { ServiceOffering } from './services/ServiceOfferingService';
export type { Review } from './services/ReviewService';
export type { Availability } from './services/AvailabilityService';
export type { Payment } from './services/PaymentService';
export type { ApiResponse } from './services/api';
