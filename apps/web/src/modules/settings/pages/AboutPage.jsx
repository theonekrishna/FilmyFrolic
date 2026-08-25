import { Info, Heart } from "lucide-react";
import SettingsCard from "../components/SettingsCard";
import SettingsRow from "../components/SettingsRow";

export default function AboutPage() {
  const appVersion = "2.4.1 (build 1082)";
  const releaseDate = "March 9, 2026";

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
          padding: "16px 20px",
          background: `#e8454508`,
          border: `1px solid #e8454518`,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `#e8454518`,
            border: `1px solid #e8454530`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Info size={20} color="#e84545" />
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
            About
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.38)",
              marginTop: 2,
            }}
          >
            App version, policies, contribute
          </div>
        </div>
      </div>

      <SettingsCard title="">
        <div
          style={{
            padding: "24px 22px",
            display: "flex",
            gap: 16,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f5c518, #e84545)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "#080810" }}>
              FF
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 22,
                letterSpacing: 2,
                color: "#f0f0f8",
              }}
            >
              Filmy Frolic
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.38)",
                marginTop: 3,
              }}
            >
              Version {appVersion}
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 11,
                color: "rgba(240,240,248,0.25)",
                marginTop: 3,
              }}
            >
              Released {releaseDate}
            </div>
          </div>
        </div>
        <SettingsRow
          label="What's New"
          desc="See the latest features and improvements"
          onClick={() => {}}
        />
        <SettingsRow
          label="Rate the App"
          desc="Enjoying Filmy Frolic? Leave us a review"
          border={false}
          onClick={() => {}}
        />
      </SettingsCard>

      <SettingsCard title="Legal">
        <SettingsRow label="Terms of Service" onClick={() => {}} />
        <SettingsRow label="Privacy Policy" onClick={() => {}} />
        <SettingsRow label="Cookie Policy" onClick={() => {}} />
        <SettingsRow label="Open Source Licenses" border={false} onClick={() => {}} />
      </SettingsCard>

      <SettingsCard title="Contribute">
        <SettingsRow label="Report a Bug" desc="Help us squash issues faster" onClick={() => {}} />
        <SettingsRow
          label="Suggest a Feature"
          desc="Tell us what you'd like to see next"
          onClick={() => {}}
        />
        <SettingsRow
          label="Join the Beta Program"
          desc="Get early access to new features"
          value="Enrolled"
          border={false}
          onClick={() => {}}
        />
      </SettingsCard>

      <SettingsCard title="">
        <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={14} color="#e84545" fill="#e84545" />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.35)",
            }}
          >
            Made for cinephiles, by cinephiles.
          </span>
        </div>
      </SettingsCard>
    </div>
  );
}
