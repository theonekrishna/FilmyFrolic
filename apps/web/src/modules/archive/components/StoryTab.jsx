export default function StoryTab({ story }) {
  return (
    <div className="px-4">
      <h3
        className="mb-2.5 text-[18px]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: 1.5,
          color: "#f0f0f8",
        }}
      >
        Story
      </h3>
      {story ? (
        <p
          className="text-[13px] leading-[1.75] font-light whitespace-pre-line"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.65)",
          }}
        >
          {story}
        </p>
      ) : (
        <p
          className="text-[12px]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.35)",
          }}
        >
          No story details available.
        </p>
      )}
    </div>
  );
}
