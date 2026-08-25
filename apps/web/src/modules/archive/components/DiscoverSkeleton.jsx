export default function DiscoverSkeleton() {
  return (
    <div className="px-4">
      <div
        className="w-full h-52 rounded-2xl mb-5 bg-[rgba(255,255,255,0.05)] animate-[shimmer_1.6s_infinite_linear]"
        style={{
          backgroundSize: "600px 100%",
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)",
        }}
      />

      {[0, 1].map((sIdx) => (
        <div key={sIdx} className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div
              className="rounded-md bg-[rgba(255,255,255,0.07)] animate-[shimmer_1.6s_infinite_linear]"
              style={{
                width: 80,
                height: 18,
                backgroundSize: "600px 100%",
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)",
              }}
            />
            <div
              className="rounded-sm bg-[rgba(255,255,255,0.05)] animate-[shimmer_1.6s_infinite_linear]"
              style={{
                width: 40,
                height: 12,
                backgroundSize: "600px 100%",
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)",
              }}
            />
          </div>

          <div className="flex gap-2.5 overflow-hidden">
            {[0, 1, 2, 3].map((cIdx) => (
              <div key={cIdx} className="flex-shrink-0 w-24">
                <div
                  className="w-24 h-36 rounded-xl mb-1.5 bg-[rgba(255,255,255,0.06)] animate-[shimmer_1.6s_infinite_linear]"
                  style={{
                    backgroundSize: "600px 100%",
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)",
                  }}
                />
                <div className="h-2.5 rounded-md bg-[rgba(255,255,255,0.05)] w-3/4 mb-1" />
                <div className="h-2 rounded-sm bg-[rgba(255,255,255,0.04)] w-11/25" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
