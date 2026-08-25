export default function ReviewsTab({ movie }) {
  console.log("movie", movie);
  if (!movie?.review) {
    return (
      <p
        className="px-4 text-[12px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.35)",
        }}
      >
        No review available.
      </p>
    );
  }

  return (
    <div className="px-4">
      <div
        className="rounded-[12px] p-4"
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p
          className="text-[13px] font-light leading-[1.75]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.65)",
            margin: 0,
          }}
        >
          {movie.review}
        </p>
      </div>
    </div>
  );
}
