const express = require("express");
const multer = require("multer");
const roomCtrl = require("./room.controller.js");
const { protect } = require("../../middlewares/auth.js");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Discovery
router.get("/my_rooms", protect, roomCtrl.getMyRooms);
router.get("/:room_id/users", roomCtrl.getRoomUsersDetails);
router.get("/:room_id/invite", protect, roomCtrl.getRoomInviteLink);

// Fallback generic route
router.get("/:id", roomCtrl.getRoomById);

router.get("/debug/key-role", roomCtrl.debugKeyRole);
router.get("/", roomCtrl.getAllRooms);

// Participant Actions
router.post("/", protect, upload.single("room_image"), roomCtrl.createRoom);
router.post("/join", protect, roomCtrl.joinRoom);
router.get("/token/:room_id", protect, roomCtrl.getAgoraToken);
router.post("/exit", protect, roomCtrl.exitRoom);
router.patch("/toggle-media", protect, roomCtrl.toggleMedia);
router.patch("/raise-hand", protect, roomCtrl.raiseHand);

// Host & Admin Controls
router.delete("/stop/:room_id", protect, roomCtrl.stopRoom);
router.patch("/assign-role", protect, roomCtrl.updateUserRole);
router.patch("/toggle-mute", protect, roomCtrl.toggleMuteUser);
router.post("/mute-all", protect, roomCtrl.muteAllParticipants);
router.delete("/kick", protect, roomCtrl.kickParticipant);

// router.patch('/resume/:room_id', protect, roomCtrl.resumeRoom);
// router.delete('/stop/:room_id', protect, roomCtrl.stopRoom);

module.exports = router;
