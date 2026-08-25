import { memo, useCallback } from "react";
import { privateAxios } from "../../../utils/AxiosInstance";

// memo: prevents re-render if roomId/refresh props haven't changed
const RoomAdminPanel = memo(function RoomAdminPanel({ roomId, refresh }) {
  // useCallback: stable references so memo on children (if any) works correctly
  const muteAll = useCallback(async () => {
    await privateAxios.post(`/api/rooms/mute-all`, { room_id: roomId });
    refresh();
  }, [roomId, refresh]);

  const stop = useCallback(async () => {
    await privateAxios.delete(`/api/rooms/stop/${roomId}`);
  }, [roomId]);

  return (
    <div className="bg-[#12121e] p-4 rounded-xl flex flex-col gap-2">
      <button onClick={muteAll}>🔇 Mute All</button>
      <button onClick={stop}>🛑 Stop Room</button>
    </div>
  );
});

export default RoomAdminPanel;
