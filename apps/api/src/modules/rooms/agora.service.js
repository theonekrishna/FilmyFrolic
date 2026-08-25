const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

/**
 * Generates an Agora RTC Token.
 * Optimized for Audio-Only rooms and Video rooms.
 */
const generateToken = (channelName, uid, roles = [], roomType = "audio_room") => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    console.warn("Agora credentials missing.");
  }

  const expirationTimeInSeconds = 3600 * 2;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const safeRoles = Array.isArray(roles) ? roles : [];

  // Logic for Audio Room:
  // Only users with 'host' or 'speaker' roles get PUBLISHER privileges.
  // In a 'video_room', we typically allow broader publishing or stick to roles.
  let agoraRole = RtcRole.SUBSCRIBER;

  if (safeRoles.includes("host") || safeRoles.includes("speaker")) {
    agoraRole = RtcRole.PUBLISHER;
  } else if (roomType === "video_room") {
    // If it's a video room and not a specific listener, allow publishing
    agoraRole = RtcRole.PUBLISHER;
  }

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    String(channelName),
    uid,
    agoraRole,
    privilegeExpiredTs
  );
};

module.exports = { generateToken };
