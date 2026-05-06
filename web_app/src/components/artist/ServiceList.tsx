// src/components/artist/ServiceList.tsx

import type { ArtistService } from '../../types/artist.types';

interface Props {
  services: ArtistService[];
  selectedServiceId?: string;
  onSelect?: (service: ArtistService) => void;
}

export default function ServiceList({ services, selectedServiceId, onSelect }: Props) {
  if (!services.length) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3">Services</h2>
        <p className="text-gray-400 text-sm">This artist has no services listed.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Services</h2>
      <ul className="space-y-3">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;

          return (
            <li
              key={service.id}
              onClick={() => onSelect?.(service)}
              className={`
                border rounded-lg p-4 flex justify-between items-start
                ${onSelect ? 'cursor-pointer hover:border-blue-400 transition-colors' : ''}
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <p className="text-xs text-gray-400 mt-1">{service.duration_minutes} min</p>
              </div>
              <div className="ml-4 text-right shrink-0">
                <p className="font-semibold text-gray-900">
                  ${parseFloat(service.price).toFixed(2)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}