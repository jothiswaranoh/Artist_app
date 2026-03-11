import { apiRequest } from "./api";

export const getArtists = async () => {
  const data = await apiRequest("/artists");

  return data.data.artist_profiles.map((artist: any) => ({
    id: artist.id,
    name: artist.name || artist.email,
    email: artist.email,
    city: artist.city,
    bio: artist.bio,
    experience_years: artist.experience_years,
    base_price: Number(artist.base_price),
    bookings: artist.bookings_count,
    reviews: artist.reviews_count,
    services: artist.services_count,
    is_approved: artist.is_approved
  }));
};