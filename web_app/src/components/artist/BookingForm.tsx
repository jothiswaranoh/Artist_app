import './BookingForm.css';

import type {
  BookingFormState,
  BookingValidationError,
} from '../../types/artist.types';

interface Props {
  form: BookingFormState;
  errors: BookingValidationError[];
  onChange: (
    field: keyof Omit<BookingFormState, 'selectedService'>,
    value: string
  ) => void;
  onSubmit: () => void;
}

// Helper
const getError = (
  errors: BookingValidationError[],
  field: BookingValidationError['field']
) => errors.find((e) => e.field === field)?.message;

export default function BookingForm({
  form,
  errors,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="booking-card">
      <h2 className="booking-title">Book this Artist</h2>
      {form.selectedService ? (
        <div className="selected-service-preview">
          <strong>{form.selectedService.name}</strong>
          <span>
            ${form.selectedService.price} •{" "}
            {form.selectedService.duration_minutes} min
          </span>
        </div>
      ) : (
        <p className="booking-hint">Select a service to start booking</p>
      )}

      {getError(errors, "service") && (
        <p className="booking-error">{getError(errors, "service")}</p>
      )}

      {/* Date */}
      <div className="booking-input-group">
        <label className="booking-label">Date</label>
        <input
          type="date"
          value={form.selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => onChange("selectedDate", e.target.value)}
          className="booking-input"
        />
        {getError(errors, "date") && (
          <p className="booking-error">{getError(errors, "date")}</p>
        )}
      </div>

      {/* Time Row */}
      <div className="booking-time-row">
        {/* Start */}
        <div className="booking-input-group">
          <label className="booking-label">Start Time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => onChange("startTime", e.target.value)}
            className="booking-input"
          />
          {getError(errors, "startTime") && (
            <p className="booking-error">{getError(errors, "startTime")}</p>
          )}
        </div>

        {/* End */}
        <div className="booking-input-group">
          <label className="booking-label">End Time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => onChange("endTime", e.target.value)}
            className="booking-input"
          />
          {getError(errors, "endTime") && (
            <p className="booking-error">{getError(errors, "endTime")}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button onClick={onSubmit} className="booking-button">
        Request Booking
      </button>
    </div>
  );
}