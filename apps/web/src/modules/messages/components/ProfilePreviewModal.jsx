import React, { useState, useEffect } from "react";
import { X, User, Volume2, VolumeX, Ban, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FollowUnFollowToggleButton from "../../follow/components/FollowUnFollowToggleButton";
import { ReportButton } from "../../Reports";
import { privateAxios } from "../../../utils/AxiosInstance";
import { useToast } from "../../../shared/Toast";

function getAvatarGradient(str = "") {
  const AVATAR_PALETTES = [
    "linear-gradient(135deg,#f97316,#ef4444)",
    "linear-gradient(135deg,#a855f7,#ec4899)",
    "linear-gradient(135deg,#3b82f6,#06b6d4)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
    "linear-gradient(135deg,#f59e0b,#f97316)",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export default function ProfilePreviewModal({ user, isOnline, currentUserId, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const targetId = user?.id || user?._id || user?.user_id || user?.other_user_id || user?.user?.id;
  const username = user?.username || user?.user?.username || profileData?.username || "User";
  const avatarUrl = user?.avatar_url || user?.user?.avatar_url || profileData?.avatar_url;

  useEffect(() => {
    if (!targetId && (!username || username === "User")) return;
    async function fetchProfile() {
      try {
        setLoading(true);
        const identifier = username && username !== "User" ? username : targetId;
        const res = await privateAxios.get(`/api/profile/${identifier}`);
        if (res.data?.success && res.data?.data) {
          setProfileData(res.data.data);
          setIsBlocked(!!res.data.data.is_blocked);
        }
      } catch (err) {
        setProfileData({
          username,
          display_name: username,
          bio: "FilmyFrolic cinephile & community member 🍿",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [targetId, username]);

  const handleToggleBlock = async () => {
    if (!targetId) return;
    try {
      setActionLoading(true);
      if (isBlocked) {
        await privateAxios.delete(`/api/users/${targetId}/block`);
        setIsBlocked(false);
        toast.success(`Unblocked @${username}`);
      } else {
        await privateAxios.post(`/api/users/${targetId}/block`);
        setIsBlocked(true);
        toast.success(`Blocked @${username}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    toast.success(
      isMuted ? `Unmuted notifications from @${username}` : `Muted notifications from @${username}`
    );
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-sm bg-[#0d0d18] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-['Outfit'] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-28 w-full relative" style={{ background: getAvatarGradient(username) }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center transition-all border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar & Online status */}
        <div className="px-6 relative flex justify-between items-end -mt-10 mb-3">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-[#0d0d18] overflow-hidden flex items-center justify-center font-bold text-white text-2xl shadow-xl"
              style={{ background: avatarUrl ? "transparent" : getAvatarGradient(username) }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            {/* Online badge */}
            <div
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0d0d18] ${
                isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-gray-500"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>

          {/* Follow Button */}
          {targetId && currentUserId && String(targetId) !== String(currentUserId) && (
            <div className="mb-1">
              <FollowUnFollowToggleButton
                targetUserId={targetId}
                currentUserId={currentUserId}
                size="md"
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg leading-tight m-0">{username}</h3>
            {isOnline && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                Online
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">@{username}</p>

          {loading ? (
            <div className="py-4 flex justify-center">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <p className="text-xs text-white/70 mt-3 leading-relaxed font-light">
              {profileData?.bio || "FilmyFrolic member & movie enthusiast 🍿"}
            </p>
          )}

          {/* Quick stats / metadata */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                Status
              </div>
              <div className="text-xs font-bold text-white/90 mt-0.5">
                {isOnline ? "Active Now" : "Offline"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                Role
              </div>
              <div className="text-xs font-bold text-blue-400 mt-0.5">Cinephile</div>
            </div>
          </div>

          {/* Action List */}
          <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-white/10">
            {/* View Full Profile */}
            <button
              onClick={() => {
                onClose();
                navigate(`/profile/${username}`);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <User size={14} className="text-blue-400" /> View Full Profile
              </span>
              <ExternalLink size={13} className="text-white/30" />
            </button>

            {/* Mute toggle */}
            <button
              onClick={handleToggleMute}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX size={14} className="text-amber-400" />
                ) : (
                  <Volume2 size={14} className="text-white/50" />
                )}
                {isMuted ? "Unmute Notifications" : "Mute Notifications"}
              </span>
              <span className="text-[10px] text-white/30">{isMuted ? "Muted" : "Active"}</span>
            </button>

            {/* Block / Unblock */}
            <button
              onClick={handleToggleBlock}
              disabled={actionLoading}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isBlocked
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-white/5 text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
              }`}
            >
              <span className="flex items-center gap-2">
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                {isBlocked ? "Unblock User" : "Block User"}
              </span>
            </button>

            {/* Report User */}
            {targetId && (
              <div className="mt-1 flex justify-center">
                <ReportButton
                  moduleType="user"
                  targetId={String(targetId)}
                  targetUserId={String(targetId)}
                  contentPreview={`User profile: @${username}`}
                  isLoggedIn={true}
                  size="sm"
                  variant="button"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
