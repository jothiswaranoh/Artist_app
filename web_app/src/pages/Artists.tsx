import React, { useState, useMemo } from "react";
import type { User } from "../services/UserService";
import { useArtistProfiles } from "../hooks/useArtistProfiles";
import type { ArtistProfile } from "../services/ArtistProfileService";
import {
  AlertCircle,
  Search,
  X,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  Brush,
  Clock,
  Users,
  Plus,
  Edit2,
  IndianRupeeIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Artists.css";
import AddUserModal from "../components/admin/AddUserModal";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import ArtistEditModal from "../components/admin/ArtistEditModal";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const ArtistsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(
    null,
  );
  const queryClient = useQueryClient();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isArtistEditOpen, setIsArtistEditOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistProfile | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const {
    artistProfiles,
    meta,
    isLoading,
    error,
    deleteArtistProfile,
    isDeleting,
  } = useArtistProfiles(page, PER_PAGE, searchQuery || "");

  const stats = useMemo(
    () => ({
      total: meta?.total_count || 0,
      avgPrice:
        artistProfiles.length > 0
          ? Math.round(
              artistProfiles.reduce(
                (sum: number, a: ArtistProfile) =>
                  sum + Number(a.base_price || 0),
                0,
              ) / artistProfiles.length,
            )
          : 0,
    }),
    [artistProfiles, meta],
  );

  const avatarGradients = [
    "avatar-gradient-1",
    "avatar-gradient-2",
    "avatar-gradient-3",
    "avatar-gradient-4",
    "avatar-gradient-5",
  ];
  const getAvatarGradient = (id: string) =>
    avatarGradients[String(id).charCodeAt(0) % avatarGradients.length];

  const getInitial = (artist: ArtistProfile) => {
    if (artist.email) return artist.email.charAt(0).toUpperCase();
    return "A";
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleEditArtist = (artist: ArtistProfile) => {
    setEditingArtist(artist);
    setIsArtistEditOpen(true);
  };
  const [prevSearch, setPrevSearch] = useState("");

  useEffect(() => {
    if (prevSearch !== searchQuery) {
      setPage(1);
      setPrevSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (meta?.total_pages && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta, page]);

  if (isLoading) {
    return (
      <div className="artists-loading">
        <div className="spinner" />
        <span>Loading artists...</span>
      </div>
    );
  }

  return (
    <div className="artists-page">
      {/* Page Header */}
      <div className="artists-header">
        <div className="artists-header-left">
          <div className="artists-header-icon">
            <Brush size={18} />
          </div>
          <div>
            <h1>Artist Directory</h1>
            <p>Manage and monitor all artist profiles on the platform</p>
          </div>
        </div>
        <div
          className="artists-header-right"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={16} />
            </button>

            <button
              className={`toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              <List size={16} />
            </button>
          </div>

          <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} /> Add Artist
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="artists-stats-grid">
        <motion.div className="artists-stat-card" whileHover={{ y: -2 }}>
          <div className="artists-stat-icon blue">
            <Users size={18} />
          </div>
          <div>
            <p className="artists-stat-label">Total Artists</p>
            <p className="artists-stat-value">{stats.total}</p>
          </div>
        </motion.div>
        <motion.div className="artists-stat-card" whileHover={{ y: -2 }}>
          <div className="artists-stat-icon purple">
            <IndianRupeeIcon size={18} />
          </div>
          <div>
            <p className="artists-stat-label">Avg Base Price</p>
            <p className="artists-stat-value">₹{stats.avgPrice}</p>
          </div>
        </motion.div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="artists-error">
          <AlertCircle size={16} />
          <span>{error instanceof Error ? error.message : String(error)}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="artists-table-card">
        {/* Toolbar: Search */}
        <div className="artists-toolbar">
          <div className="artists-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by email, city, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="artists-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Artist Cards - Grid View */}
        {artistProfiles.length === 0 ? (
          <div className="artists-empty">
            <div className="artists-empty-icon">
              <Brush size={24} />
            </div>
            <p>
              {searchQuery
                ? `No artists match "${searchQuery}"`
                : "No artist profiles found"}
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="artists-grid">
            {artistProfiles.map((artist: ArtistProfile, i: number) => (
              <motion.div
                key={artist.id}
                className="artist-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                {/* Card Header */}
                <div className="artist-card-header">
                  <div
                    className={`artist-avatar ${getAvatarGradient(artist.id)}`}
                  >
                    {getInitial(artist)}
                  </div>
                  <div className="artist-card-info">
                    <p className="artist-email">
                      {artist.name ||
                        artist.email ||
                        `Artist #${String(artist.id).slice(0, 8)}`}
                    </p>
                    <p className="artist-city">
                      <MapPin size={12} />
                      {artist.city || "Location not set"}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className={`artist-bio ${!artist.bio ? "empty" : ""}`}>
                  {artist.bio || "No bio provided yet."}
                </div>

                {/* Stats Row */}
                <div className="artist-card-stats">
                  <div className="artist-mini-stat">
                    <p className="stat-val">{artist.experience_years || 0}</p>
                    <p className="stat-lbl">Yrs Exp</p>
                  </div>
                  <div className="artist-mini-stat">
                    <p className="stat-val">₹{artist.base_price || 0}</p>
                    <p className="stat-lbl">Base Price</p>
                  </div>
                  <div className="artist-mini-stat">
                    <p className="stat-val">{artist.services?.length || 0}</p>
                    <p className="stat-lbl">Services</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="artist-card-footer">
                  <span className="artist-joined">
                    <Calendar size={11} />
                    Joined{" "}
                    {new Date(artist.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <div className="artist-card-actions">
                    <button
                      className="artist-action-btn view"
                      title="View Details"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="artist-action-btn edit"
                      title="Edit User"
                      onClick={() => handleEditArtist(artist)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="artist-action-btn delete"
                      title="Delete Profile"
                      onClick={() => handleDelete(artist.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View - Table Layout */
          <div className="artists-table-wrapper">
            <table className="artists-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Base Price</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {artistProfiles.map((artist: ArtistProfile, i: number) => (
                  <tr key={artist.id} className="artist-row">
                    <td>
                      <div className="artist-cell-main">
                        <div
                          className={`artist-avatar ${getAvatarGradient(artist.id)}`}
                        >
                          {getInitial(artist)}
                        </div>

                        <div className="artist-name-block">
                          <p className="artist-name">
                            {artist.name ||
                              `Artist #${String(artist.id).slice(0, 8)}`}
                          </p>
                          <p className="artist-sub">
                            {artist.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>{artist.city || "—"}</td>
                    <td>{artist.experience_years || 0} yrs</td>
                    <td>₹{artist.base_price || 0}</td>

                    <td>
                      <div className="artist-actions">
                        <button
                          className="artist-action-btn view"
                          onClick={() => setSelectedArtist(artist)}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          className="artist-action-btn edit"
                          onClick={() => handleEditArtist(artist)}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          className="artist-action-btn delete"
                          onClick={() => handleDelete(artist.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta?.total_pages > 1 && (
          <div className="pagination-footer">
            <span>
              Page {meta?.current_page} of {meta?.total_pages} —{" "}
              {meta?.total_count} total artists
            </span>

            <div className="pagination">
              <button
                disabled={!meta?.prev_page}
                onClick={() => setPage(page - 1)}
              >
                ‹
              </button>

              {Array.from({ length: meta?.total_pages || 0 }, (_, i) => (
                <button
                  key={i}
                  className={meta?.current_page === i + 1 ? "active" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={!meta?.next_page}
                onClick={() => setPage(page + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="artist-modal-overlay"
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedArtist(null)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="artist-modal-card"
            >
              <div className="artist-modal-header">
                <h3>🎨 Artist Profile</h3>
                <button
                  className="artist-modal-close"
                  onClick={() => setSelectedArtist(null)}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="artist-modal-body">
                {/* Hero: Avatar + Name */}
                <div className="artist-modal-hero">
                  <div
                    className={`artist-modal-avatar ${getAvatarGradient(selectedArtist.id)}`}
                  >
                    {getInitial(selectedArtist)}
                  </div>
                  <div>
                    <p className="artist-modal-name">
                      {selectedArtist.name ||
                        selectedArtist.email ||
                        `Artist #${String(selectedArtist.id).slice(0, 8)}`}
                    </p>
                    <p className="artist-modal-id">
                      ID: {String(selectedArtist.id).slice(0, 16)}…
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="artist-modal-info-grid">
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">📍 City</span>
                    <span className="artist-modal-info-value">
                      {selectedArtist.city || "—"}
                    </span>
                  </div>
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">
                      ⏱ Experience
                    </span>
                    <span className="artist-modal-info-value">
                      {selectedArtist.experience_years || 0} yrs
                    </span>
                  </div>
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">Base Price</span>
                    <span className="artist-modal-info-value pink">
                      ₹{Number(selectedArtist.base_price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">📅 Joined</span>
                    <span className="artist-modal-info-value">
                      {new Date(selectedArtist.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">🛠 Services</span>
                    <span className="artist-modal-info-value">
                      {selectedArtist.services?.length || 0}
                    </span>
                  </div>
                  <div className="artist-modal-info-item">
                    <span className="artist-modal-info-label">📦 Bookings</span>
                    <span className="artist-modal-info-value">
                      {selectedArtist.bookings?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {selectedArtist.bio && (
                  <div>
                    <p className="artist-modal-section-title">Bio</p>
                    <div className="artist-modal-bio-box">
                      {selectedArtist.bio}
                    </div>
                  </div>
                )}

                {/* Services */}
                {selectedArtist.services &&
                  selectedArtist.services.length > 0 && (
                    <div>
                      <p className="artist-modal-section-title">
                        Available Services
                      </p>
                      {selectedArtist.services.map((service: any) => (
                        <div key={service.id} className="artist-service-card">
                          <div className="artist-service-top">
                            <div>
                              <p className="artist-service-name">
                                {service.name}
                              </p>
                              <p className="artist-service-duration">
                                <Clock size={11} /> {service.duration_minutes}{" "}
                                min
                              </p>
                            </div>
                            <span className="artist-service-price">
                              ₹{Number(service.price || 0).toFixed(2)}
                            </span>
                          </div>
                          {service.description && (
                            <p className="artist-service-desc">
                              {service.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAddModalOpen && (
        <AddUserModal
          role="artist"
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setPage(1);
          }}
        />
      )}

      {isArtistEditOpen && editingArtist && (
        <ArtistEditModal
          artist={editingArtist}
          onClose={() => {
            setIsArtistEditOpen(false);
            setEditingArtist(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["artist_profiles"],
              exact: false,
            });
          }}
        />
      )}

      {deleteTargetId && (
        <ConfirmDeleteModal
          title="Delete Artist Profile"
          message="Are you sure you want to permanently delete this artist profile? All services, bookings, and reviews linked to this profile will be affected."
          confirmLabel="Delete Artist"
          onConfirm={() => deleteArtistProfile(deleteTargetId)}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
};

export default ArtistsPage;
