// src/pages/customer/ArtistDetail.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ArtistDetail.css";

import { ArtistProfileService } from "../../services/ArtistProfileService";
import { BookingService } from "../../services/BookingService";

import type {
  ArtistDetail,
  AvailabilitySlot,
  ArtistService,
  BookingFormState,
  BookingValidationError,
} from "../../types/artist.types";

import BookingForm from "../../components/artist/BookingForm";

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Page state ---
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Booking state ---
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    selectedService: null,
    selectedDate: "",
    startTime: "",
    endTime: "",
  });

  const [validationErrors, setValidationErrors] = useState<BookingValidationError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Fetch data ---
  useEffect(() => {
    if (!id) {
      navigate("/find-artists", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [artistData, availabilityData] = await Promise.all([
          ArtistProfileService.getArtistDetail(id),
          ArtistProfileService.getArtistAvailability(id),
        ]);

        setArtist(artistData);
        setAvailability(availabilityData);
      } catch (err: any) {
        setError(err?.message || "Failed to load artist.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // --- Validation ---
  const validateBooking = (): BookingValidationError[] => {
    const errors: BookingValidationError[] = [];

    if (!bookingForm.selectedService) {
      errors.push({ field: "service", message: "Select a service." });
    }

    if (!bookingForm.selectedDate) {
      errors.push({ field: "date", message: "Select a date." });
    }

    if (!bookingForm.startTime) {
      errors.push({ field: "startTime", message: "Select start time." });
    }

    if (!bookingForm.endTime) {
      errors.push({ field: "endTime", message: "Select end time." });
    }

    if (
      bookingForm.startTime &&
      bookingForm.endTime &&
      bookingForm.startTime >= bookingForm.endTime
    ) {
      errors.push({
        field: "endTime",
        message: "End must be after start.",
      });
    }

    return errors;
  };

  // --- Handlers ---
  const handleServiceSelect = (service: ArtistService) => {
    setBookingForm((prev) => ({
      ...prev,
      selectedService: service,
    }));

    setValidationErrors((prev) => prev.filter((e) => e.field !== "service"));
  };

  const handleFormChange = (
    field: keyof Omit<BookingFormState, "selectedService">,
    value: string
  ) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const handleBookingSubmit = async () => {
    const errors = validateBooking();

    if (errors.length) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage(null);

      await BookingService.create({
        service_id: bookingForm.selectedService!.id,
        booking_date: bookingForm.selectedDate,
        start_time: bookingForm.startTime,
        end_time: bookingForm.endTime,
      });

      setSuccessMessage("Booking created successfully");

      setBookingForm({
        selectedService: null,
        selectedDate: "",
        startTime: "",
        endTime: "",
      });

    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Booking failed";

      setValidationErrors([{ field: "service", message }]);
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI states ---
  if (loading) {
    return <div className="artist-page">Loading...</div>;
  }

  if (error) {
    return (
      <div className="artist-page">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="artist-page">

      {/* HEADER */}
      <div className="artist-header">
        <h1 className="artist-title">
          {artist.name || artist.email}
        </h1>

        <div className="artist-meta">
          {artist.city} · {artist.experience_years} yrs experience
        </div>

        <div className="artist-stats">
          <span>{artist.services_count} services</span>
          <span>{artist.reviews_count} reviews</span>
        </div>

        {artist.bio && (
          <p className="artist-bio">{artist.bio}</p>
        )}
      </div>

      {/* MAIN */}
      <div className="artist-layout">

        {/* LEFT */}
        <div>

          {/* SERVICES */}
          <div className="card">
            <h2 className="section-title">Services</h2>

            {artist.services.map((service) => {
              const selected =
                bookingForm.selectedService?.id === service.id;

              return (
                <div
                  key={service.id}
                  className={`service-item ${
                    selected ? "service-selected" : ""
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-name">{service.name}</div>
                  <div className="service-desc">
                    {service.description}
                  </div>
                  <div className="service-price">
                    ${parseFloat(service.price).toFixed(2)} ·{" "}
                    {service.duration_minutes} min
                  </div>
                </div>
              );
            })}
          </div>

          {/* AVAILABILITY (placeholder for now) */}
          <div className="card" style={{ marginTop: 20 }}>
            <h2 className="section-title">Availability</h2>
            <p className="service-desc">
              No availability set. You can still request a booking.
            </p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="card booking-card">
          <BookingForm
            form={bookingForm}
            errors={validationErrors}
            onChange={handleFormChange}
            onSubmit={handleBookingSubmit}
          />
        </div>

      </div>
    </div>
  );
}