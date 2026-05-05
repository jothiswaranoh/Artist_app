// src/components/artist/ArtistHeader.tsx

import type { ArtistDetail } from '../../types/artist.types';
import { getArtistDisplayName } from '../../types/artist.types';

interface Props {
  artist: ArtistDetail;
}

export default function ArtistHeader({ artist }: Props) {
  const displayName = getArtistDisplayName(artist);

  return (
    <div className="border-b pb-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>

      <div className="flex gap-4 text-sm text-gray-500 mt-1">
        {artist.city && <span>{artist.city}</span>}
        {artist.city && <span>·</span>}
        <span>{artist.experience_years} yrs experience</span>
      </div>

      {artist.bio && (
        <p className="mt-3 text-gray-700 text-sm leading-relaxed">
          {artist.bio}
        </p>
      )}

      <div className="flex gap-6 mt-4 text-sm">
        <span className="text-gray-600">
          From <strong>${parseFloat(artist.base_price).toFixed(2)}</strong>
        </span>
        <span className="text-gray-500">{artist.services_count} services</span>
        <span className="text-gray-500">{artist.reviews_count} reviews</span>
      </div>
    </div>
  );
}