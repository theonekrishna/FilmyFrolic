import { memo } from "react";

// memo prevents re-render when parent re-renders with same room prop
const RoomTopBar = memo(function RoomTopBar({ room }) {
  return (
    <div className="absolute top-0 left-0 w-full p-4 bg-black/50 backdrop-blur flex justify-between">
      <div>
        <h2 className="font-bold">{room.title}</h2>
        <p className="text-sm text-gray-300">{room.subtitle}</p>
      </div>

      <div className="text-sm">👥 {room.participant_count}</div>
    </div>
  );
});

export default RoomTopBar;
