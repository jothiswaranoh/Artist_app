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

  const [validationErrors, setValidationErrors] = useState<
    BookingValidationError[]
  >([]);
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
    setBookingForm((prev) => {
      const updated = {
        ...prev,
        selectedService: service,
      };

      if (prev.startTime) {
        updated.endTime = addMinutes(
          prev.startTime,
          Number(service.duration_minutes),
        );
      }

      return updated;
    });

    setValidationErrors((prev) => prev.filter((e) => e.field !== "service"));
  };

  const handleFormChange = (
    field: keyof Omit<BookingFormState, "selectedService">,
    value: string,
  ) => {
    setBookingForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "startTime" && prev.selectedService && value) {
        updated.endTime = addMinutes(
          value,
          Number(prev.selectedService.duration_minutes),
        );
      }

      return updated;
    });

    setValidationErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + minutes);

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
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

      setSuccessMessage("Booking created successfully! Check your bookings.");

      setBookingForm({
        selectedService: null,
        selectedDate: "",
        startTime: "",
        endTime: "",
      });

      setValidationErrors([]);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      const message = err?.message || "Booking failed. Please try again.";
      setValidationErrors([{ field: "service", message }]);
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI states ---
  if (loading) {
    return (
      <div className="artist-page">
        <div className="loading-state">Loading artist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-page">
        <div className="error-state">
          <p>{error}</p>
          <button
            onClick={() => navigate("/find-artists")}
            className="error-button"
          >
            Back to artists
          </button>
        </div>
      </div>
    );
  }

  if (!artist) return null;

  const sortedReviews = artist.reviews
    ? [...artist.reviews].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : [];

  const avgRating =
    artist.reviews && artist.reviews.length > 0
      ? artist.reviews.reduce((sum, r) => sum + r.rating, 0) /
        artist.reviews.length
      : 0;

  return (
    <div className="artist-page">
      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="success-banner">
          <span>✓</span>
          {successMessage}
        </div>
      )}

      {/* HEADER */}
      <div className="artist-header">
        <h1 className="artist-title">{artist.name || artist.email}</h1>

        <div className="artist-meta">
          {artist.city && <span>{artist.city}</span>}
          {artist.city && <span className="meta-dot">·</span>}
          <span>{artist.experience_years} yrs experience</span>
        </div>

        <div className="artist-stats">
          <div className="stat-item">
            <span className="stat-value">{artist.services_count}</span>
            <span className="stat-label">Services</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{artist.reviews_count}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>

        {artist.bio && <p className="artist-bio">{artist.bio}</p>}
      </div>

      {/* CONTENT SECTIONS */}
      <div className="artist-main">
        {/* LEFT */}
        <div className="artist-left">
          {/* SERVICES */}
          <section className="section">
            <h2 className="section-title">Services</h2>

            {artist.services && artist.services.length > 0 ? (
              <div className="services-grid">
                {artist.services.map((service) => {
                  const selected =
                    bookingForm.selectedService?.id === service.id;

                  return (
                    <div
                      key={service.id}
                      className={`service-card ${selected ? "service-card--selected" : ""}`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      {selected && (
                        <div className="service-card__checkmark">✓</div>
                      )}

                      <h3 className="service-card__name">{service.name}</h3>
                      <p className="service-card__desc">
                        {service.description}
                      </p>

                      <div className="service-card__footer">
                        <span className="service-card__price">
                          ₹{Number(service.price).toFixed(2)}
                        </span>
                        <span className="service-card__duration">
                          {service.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No services available.</div>
            )}
          </section>

          {/* REVIEWS */}
          {/* REVIEWS */}
          {artist.reviews && artist.reviews.length > 0 && (
            <section className="section">
              <h2 className="section-title">Reviews</h2>

              <div className="reviews-summary">
                <div className="summary-left">
                  <span className="summary-stars">
                    {"⭐".repeat(Math.round(avgRating))}
                  </span>
                  <span className="summary-value">{avgRating.toFixed(1)}</span>
                </div>

                <span className="summary-count">
                  {artist.reviews.length} reviews
                </span>
              </div>

              <div className="reviews-list">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-card__header">
                      <div className="review-card__user">
                        <div className="review-avatar">
                          {review.id.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="review-user-meta">
                          <div className="review-user-name">
                            {`User ${review.id.slice(0, 4)}`}
                          </div>

                          <div className="review-card__rating">
                            <span className="rating-stars">
                              {"⭐".repeat(review.rating)}
                            </span>
                            <span className="rating-value">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="review-card__date">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <div className="artist-right">
          <BookingForm
            form={bookingForm}
            errors={validationErrors}
            onChange={handleFormChange}
            onSubmit={handleBookingSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
