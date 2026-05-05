import type { AvailabilitySlot } from '../../types/artist.types';
import './AvailabilityPanel.css';

interface Props {
  availability: AvailabilitySlot[];
  onSelect?: (slot: AvailabilitySlot) => void;
}

export default function AvailabilityPanel({ availability, onSelect }: Props) {
  if (!availability.length) {
    return (
      <p className="availability-empty">
        No availability set. You can still request a booking.
      </p>
    );
  }

  return (
    <div className="availability-grid">
      {availability.map((slot) => (
        <div
          key={slot.id}
          className={`availability-card ${
            slot.is_booked ? 'disabled' : ''
          }`}
          onClick={() => !slot.is_booked && onSelect?.(slot)}
        >
          <p className="availability-date">{slot.available_date}</p>
          <p className="availability-time">
            {slot.start_time} – {slot.end_time}
          </p>

          {slot.is_booked && (
            <span className="availability-status">Booked</span>
          )}
        </div>
      ))}
    </div>
  );
}