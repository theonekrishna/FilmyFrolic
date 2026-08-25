//step inducator
function StepDots({ current, total }) {
  return (
    <div className="flex justify-center gap-2 mb-7">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isCompleted = i < current;

        return (
          <div
            key={i}
            className={`h-[4px] rounded-full transition-all duration-300
              ${isActive ? "w-6 bg-yellow-500" : ""}
              ${isCompleted ? "w-2 bg-yellow-500" : ""}
              ${!isActive && !isCompleted ? "w-3 bg-white/20" : ""}
            `}
          />
        );
      })}
    </div>
  );
}

export default StepDots;
