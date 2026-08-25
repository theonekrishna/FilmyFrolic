// ─── Shared/LoadingState ───────────────────────────────────────
// Types: skeleton-card / skeleton-list / spinner / shimmer
// shimmer: rgba(255,255,255,0.06) → rgba(255,255,255,0.12)
/* shimmer base style */
const SHIMMER_STYLE = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)",
  backgroundSize: "600px 100%",
  animation: "ff-shimmer-x 1.6s infinite linear",
};

/* ─── Skeleton Card ───────────────────────── */

function SkeletonCard({ width = 150, height = 220 }) {
  return (
    <div style={{ width }} className="flex-shrink-0">
      <div style={{ width, height, borderRadius: 12, overflow: "hidden", ...SHIMMER_STYLE }} />

      <div style={{ marginTop: 10, height: 13, borderRadius: 6, width: "72%", ...SHIMMER_STYLE }} />

      <div style={{ marginTop: 6, height: 11, borderRadius: 5, width: "44%", ...SHIMMER_STYLE }} />
    </div>
  );
}

/* ─── Skeleton List Row ───────────────────────── */

function SkeletonList() {
  const rows = [
    { w: "100%", h: 14 },
    { w: "70%", h: 12 },
    { w: "40%", h: 10 },
  ];

  return (
    <div className="flex flex-col gap-[10px] w-full">
      {rows.map((r, i) => (
        <div key={i} style={{ width: r.w, height: r.h, borderRadius: 6, ...SHIMMER_STYLE }} />
      ))}
    </div>
  );
}

/* ─── Spinner ───────────────────────── */

function Spinner({ accentColor = "#f5c518" }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.08)",
        borderTopColor: accentColor,
        animation: "ff-spin-loading 0.75s linear infinite",
      }}
    />
  );
}

/* ─── Shimmer Bar ───────────────────────── */

function ShimmerBar({ height = 8 }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 4,
        ...SHIMMER_STYLE,
      }}
    />
  );
}

/* ─── Main Component ───────────────────────── */

export default function LoadingState({
  type = "skeleton-card",
  cardWidth = 150,
  cardHeight = 220,
  count = 4,
  accentColor = "#f5c518",
}) {
  if (type === "skeleton-card") {
    return (
      <div className="flex gap-4 flex-nowrap overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} width={cardWidth} height={cardHeight} />
        ))}
      </div>
    );
  }

  if (type === "skeleton-list") {
    return (
      <div className="flex flex-col gap-6 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonList key={i} />
        ))}
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner accentColor={accentColor} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <ShimmerBar height={14} />
      <ShimmerBar height={10} />
      <ShimmerBar height={10} />
      <ShimmerBar height={10} />
    </div>
  );
}
