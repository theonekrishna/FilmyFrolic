import { Download, FileJson, RefreshCw, Check, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import SettingsLoader from "../components/SettingsLoader";
import { settingsService } from "../services/settingsService";

export default function DataExportPage({ inModal = false, onClose }) {
  const ACCENT = "#7c5cfc";
  const toastApi = useToast();

  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadExportStatus();
  }, []);

  const loadExportStatus = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getDataExportUrl();
      if (res?.download_url) {
        setExportData(res);
      }
    } catch (err) {
      // 404 means no export exists yet, which is fine
      if (err.message?.includes("404") || err.message?.includes("No export found")) {
        setExportData(null);
      } else {
        console.error("Error loading export status:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExport = async () => {
    try {
      setGenerating(true);
      const res = await settingsService.exportData();
      setExportData(res);
      toastApi.success("Export Generated", "Your data export is ready for download.", 3000);
    } catch (err) {
      console.error("Error generating export:", err);
      toastApi.error(
        "Error",
        err.message || "Failed to generate export. You may have reached the rate limit.",
        4000
      );
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  if (loading) {
    return <SettingsLoader text="Loading export status..." />;
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header - hidden in modal */}
      {!inModal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            padding: "16px 20px",
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}18`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${ACCENT}18`,
              border: `1px solid ${ACCENT}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Download size={20} color={ACCENT} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 20,
                letterSpacing: 2,
                color: "#f0f0f8",
                lineHeight: 1,
              }}
            >
              Data Export
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.38)",
                marginTop: 2,
              }}
            >
              Download a copy of your data
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileJson size={24} color="rgba(240,240,248,0.5)" />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 18,
                color: "#f0f0f8",
                marginBottom: 8,
              }}
            >
              What's Included
            </h3>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.6)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Your export will include your profile information, watch history, posts, comments,
              reactions, gossips, memes, and blocked users list.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Profile", "Watch History", "Posts", "Comments", "Reactions", "Blocked Users"].map(
                (item) => (
                  <span
                    key={item}
                    style={{
                      padding: "4px 10px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 100,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: "rgba(240,240,248,0.5)",
                    }}
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Status */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        {exportData?.download_url ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(31,209,168,0.1)",
                border: "1px solid rgba(31,209,168,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Check size={28} color="#1fd1a8" />
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 20,
                color: "#f0f0f8",
                marginBottom: 8,
              }}
            >
              Export Ready!
            </h3>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.5)",
                marginBottom: 8,
              }}
            >
              Generated on {formatDate(exportData.exported_at)}
            </p>
            {exportData.expires_in && (
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "#f5c518",
                  marginBottom: 24,
                }}
              >
                <Clock
                  size={12}
                  style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                />
                Expires in {formatDuration(exportData.expires_in)}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a
                href={exportData.download_url}
                download
                style={{
                  padding: "12px 24px",
                  background: "#1fd1a8",
                  border: "none",
                  borderRadius: 10,
                  color: "#080810",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Download size={18} />
                Download JSON
              </a>
              <button
                onClick={handleGenerateExport}
                disabled={generating}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  color: "#f0f0f8",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: generating ? 0.6 : 1,
                }}
              >
                <RefreshCw
                  size={18}
                  style={{ animation: generating ? "spin 1s linear infinite" : "none" }}
                />
                {generating ? "Generating..." : "Regenerate"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Download size={28} color="rgba(240,240,248,0.5)" />
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 20,
                color: "#f0f0f8",
                marginBottom: 8,
              }}
            >
              No Export Available
            </h3>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.5)",
                marginBottom: 24,
              }}
            >
              Generate a new export to download your data. This may take a few moments.
            </p>
            <button
              onClick={handleGenerateExport}
              disabled={generating}
              style={{
                padding: "14px 32px",
                background: ACCENT,
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: generating ? 0.6 : 1,
              }}
            >
              {generating ? (
                <>
                  <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate Export
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Rate Limit Notice */}
      <div
        style={{
          marginTop: 16,
          background: "rgba(245,197,24,0.05)",
          border: "1px solid rgba(245,197,24,0.15)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <AlertCircle size={18} color="#f5c518" />
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            color: "rgba(240,240,248,0.6)",
          }}
        >
          Rate limited to 3 generations per hour. Exports expire after 1 hour.
        </span>
      </div>

      {!inModal && <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />}
    </div>
  );
}
