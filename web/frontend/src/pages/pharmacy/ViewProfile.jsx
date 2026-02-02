import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PLACEHOLDER_LOGO = "/images/logo/Asset3.png";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function getInitials(name) {
  if (!name) return "P";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || "";
  return (first + last).toUpperCase() || "P";
}

export default function PharmacyViewProfile() {
  const role = "PHARMACY";
  const userId = localStorage.getItem("userId") || "";
  const fallbackName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Pharmacy";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get("/pharmacy/profile", { params: { userId } });
      const data = res?.data?.data ?? res?.data ?? null;
      if (!data) {
        toast.error("Profile not found. Please update your profile.");
      }
      setProfile(data);
    } catch (err) {
      console.error("Failed to load pharmacy profile:", err);
      toast.error(err?.response?.data?.error || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const displayName = profile?.displayName || fallbackName;
  const email = profile?.user?.email || localStorage.getItem("email") || "—";
  const addressLine = [
    profile?.address,
    profile?.city,
    profile?.state,
    profile?.postalCode,
    profile?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex min-h-screen bg-[#000000]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={displayName} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_LOGO;
              }}
            />
            <h1 className="text-3xl font-bold text-[#FFFFFF]">Pharmacy Profile</h1>
            <Link
              to="/pharmacy/profile"
              className="rounded bg-[#027906] hover:bg-[#045d07] px-4 py-2 font-semibold"
            >
              Edit Profile
            </Link>
          </div>

          {/* Visible card wrapper */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : !profile ? (
              <p className="text-[var(--text-soft)]">
                No profile found. Click <strong>Edit Profile</strong> to set up your pharmacy details.
              </p>
            ) : (
              <>
                {/* Header strip */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[var(--border)] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {getInitials(displayName)}
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{displayName}</div>
                      <div className="text-sm text-[var(--text-soft)]">
                        License: {profile.licenseNumber || "—"}
                      </div>
                      <div className="text-sm text-[var(--text-soft)]">Email: {email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[var(--text-muted)]">Created</div>
                      <div>{formatDate(profile.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)]">Last Updated</div>
                      <div>{formatDate(profile.updatedAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Details (high-contrast sections) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Organization & Contact */}
                  <section
                    className="rounded-xl p-5 border border-[var(--border)]"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold mb-3">Organization & Contact</h2>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Display Name</dt>
                        <dd className="text-right max-w-[60%]">{displayName || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Phone</dt>
                        <dd className="text-right max-w-[60%]">{profile.phone || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Email</dt>
                        <dd className="text-right max-w-[60%]">{email}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Address</dt>
                        <dd className="text-right max-w-[60%]">{addressLine || "—"}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Location */}
                  <section
                    className="rounded-xl p-5 border border-[var(--border)]"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold mb-3">Location</h2>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Latitude</dt>
                        <dd>{profile.latitude ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--text-soft)]">Longitude</dt>
                        <dd>{profile.longitude ?? "—"}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <div className="text-[var(--text-soft)] mb-1 text-sm">Map</div>
                      {profile.latitude != null && profile.longitude != null ? (
                        <a
                          href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-[#e2fce3]"
                        >
                          View on Google Maps
                        </a>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </div>
                  </section>

                  {/* Opening Hours */}
                  <section
                    className="md:col-span-2 rounded-xl p-5 border border-[var(--border)]"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold mb-3">Opening Hours</h2>
                    <p className="text-sm text-[var(--text-soft)] whitespace-pre-wrap">
                      {profile.openingHours?.trim() || "—"}
                    </p>
                  </section>

                  {/* Services */}
                  <section
                    className="md:col-span-2 rounded-xl p-5 border border-[var(--border)]"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold mb-3">Services</h2>
                    <p className="text-sm text-[var(--text-soft)] whitespace-pre-wrap">
                      {profile.services?.trim() || "—"}
                    </p>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
