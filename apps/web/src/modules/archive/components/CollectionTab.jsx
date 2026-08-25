const ACCENT = "#f5c518";

function formatMoney(amount) {
  if (amount === null || amount === undefined) return null;
  return amount >= 1e7 ? `$${(amount / 1e6).toFixed(1)}M` : `$${amount.toLocaleString()}`;
}

export default function CollectionTab({ grossCollection, netCollection }) {
  const gross = formatMoney(grossCollection);
  const net = formatMoney(netCollection);

  if (!gross && !net) {
    return (
      <p
        className="px-4 text-[12px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.35)",
        }}
      >
        No collection data available.
      </p>
    );
  }

  return (
    <div className="px-4 flex gap-3">
      {gross && (
        <div
          className="flex-1 rounded-[14px] p-4 text-center"
          style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="text-[26px] mb-1"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              color: ACCENT,
              letterSpacing: 1,
            }}
          >
            {gross}
          </div>
          <div
            className="text-[11px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            Gross Collection
          </div>
        </div>
      )}
      {net && (
        <div
          className="flex-1 rounded-[14px] p-4 text-center"
          style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="text-[26px] mb-1"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              color: "#2ecc71",
              letterSpacing: 1,
            }}
          >
            {net}
          </div>
          <div
            className="text-[11px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            Net Collection
          </div>
        </div>
      )}
    </div>
  );
}
