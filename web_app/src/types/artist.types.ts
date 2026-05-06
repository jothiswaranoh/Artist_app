
export interface ArtistService {
  id: string;
  name: string;
  description: string;
  price: string;           
  duration_minutes: number;
}

export interface ArtistReview {
  id: string;
  rating: number;
  comment: string;
  artist_name: string;
  created_at: string;
}

export interface ArtistDetail {
  id: string;
  name: string | null;    
  email: string;
  city: string | null;
  bio: string | null;
  experience_years: number;
  base_price: string;      
  is_approved: boolean;
  services_count: number;
  bookings_count: number;
  reviews_count: number;
  created_at: string;
  services: ArtistService[];
  reviews: ArtistReview[];
}

export interface AvailabilitySlot {
  id: string;
  available_date: string;   // ✅ matches backend
  start_time: string;
  end_time: string;
  is_booked: boolean;       // ✅ matches backend
}

// Utility — never render name directly, always go through this
export const getArtistDisplayName = (artist: Pick<ArtistDetail, 'name' | 'email'>): string =>
  artist.name?.trim() || artist.email;

// src/types/artist.types.ts  — ADD at the bottom

export interface BookingFormState {
  selectedService: ArtistService | null;
  selectedDate: string;        // "YYYY-MM-DD"
  startTime: string;           // "HH:MM"
  endTime: string;             // "HH:MM"
}

export interface BookingValidationError {
  field: 'service' | 'date' | 'startTime' | 'endTime';
  message: string;
}