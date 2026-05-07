// src/components/artist/BookingForm.tsx

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
  submitting?: boolean;
}

const getError = (
  errors: BookingValidationError[],
  field: BookingValidationError['field']
) => errors.find((e) => e.field === field)?.message;

export default function BookingForm({
  form,
  errors,
  onChange,
  onSubmit,
  submitting = false,
}: Props) {
  const isFormValid =
    form.selectedService &&
    form.selectedDate &&
    form.startTime &&
    form.endTime &&
    errors.length === 0;

  return (
    <div className="booking-form">
      <h2 className="booking-form__title">Request Booking</h2>

      {/* SELECTED SERVICE */}
      {form.selectedService ? (
        <div className="booking-form__selected">
          <div className="booking-form__selected-icon">📌</div>
          <div className="booking-form__selected-content">
            <p className="booking-form__selected-name">
              {form.selectedService.name}
            </p>
            <p className="booking-form__selected-meta">
              ₹{Number(form.selectedService.price).toFixed(2)} · {form.selectedService.duration_minutes} min
            </p>
          </div>
        </div>
      ) : (
        <div className="booking-form__hint">
          ← Select a service above to start booking
        </div>
      )}

      {getError(errors, 'service') && (
        <div className="booking-form__error">
          {getError(errors, 'service')}
        </div>
      )}

      {/* DATE INPUT */}
      <div className="booking-form__group">
        <label className="booking-form__label">Date</label>
        <input
          type="date"
          value={form.selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => onChange('selectedDate', e.target.value)}
          className="booking-form__input"
          disabled={!form.selectedService}
        />
        {getError(errors, 'date') && (
          <div className="booking-form__error-inline">
            {getError(errors, 'date')}
          </div>
        )}
      </div>

      {/* TIME ROW */}
      <div className="booking-form__time-row">
        {/* START TIME */}
        <div className="booking-form__group">
          <label className="booking-form__label">Start Time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => onChange('startTime', e.target.value)}
            className="booking-form__input"
            disabled={!form.selectedService}
          />
          {getError(errors, 'startTime') && (
            <div className="booking-form__error-inline">
              {getError(errors, 'startTime')}
            </div>
          )}
        </div>

        {/* END TIME */}
        <div className="booking-form__group">
          <label className="booking-form__label">End Time</label>
          <input
            type="time"
            value={form.endTime}
            readOnly
            className="booking-form__input booking-form__input--readonly"
            title="Auto-calculated based on service duration"
          />
          {getError(errors, 'endTime') && (
            <div className="booking-form__error-inline">
              {getError(errors, 'endTime')}
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={onSubmit}
        disabled={!isFormValid || submitting}
        className={`booking-form__button ${
          isFormValid ? 'booking-form__button--active' : ''
        }`}
      >
        {submitting ? (
          <>
            <span className="booking-form__spinner"></span>
            Booking...
          </>
        ) : (
          'Request Booking'
        )}
      </button>

      <p className="booking-form__footer">
        You'll receive a confirmation email once the artist accepts your booking.
      </p>
    </div>
  );
}