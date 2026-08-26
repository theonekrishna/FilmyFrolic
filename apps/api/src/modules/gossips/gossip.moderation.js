/**
 * Gossip Safety & Moderation Pipeline
 * Detects PII, defamation/high-risk claims, minor safety violations, and fake screenshots.
 */

// ── PII Regex Patterns ──
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g;
const AADHAAR_PAN_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b|\b[A-Z]{5}\d{4}[A-Z]{1}\b/gi;

// ── Defamation & High-Risk Claim Keywords ──
const HIGH_RISK_KEYWORDS = [
  "arrested",
  "jail",
  "prison",
  "cheated",
  "affair",
  "drugs",
  "cocaine",
  "assault",
  "sexual",
  "harassment",
  "fraud",
  "scam",
  "bankrupt",
  "illegal",
  "crime",
  "murder",
  "extortion",
];

// ── Minor Protection Keywords ──
const MINOR_KEYWORDS = ["minor", "underage", "teen", "child", "schoolgirl", "schoolboy", "kid"];

/**
 * Screen rumor content before publishing.
 * @param {Object} payload - { title, content, category, topicType, sourceUrl }
 * @returns {Object} - { riskLevel: 'LOW_RISK'|'MEDIUM_RISK'|'HIGH_RISK'|'BLOCKED', flags: Array<string>, warning: string|null }
 */
function screenGossipContent(payload) {
  const text = `${payload.title || ""} ${payload.content || ""}`.toLowerCase();
  const flags = [];

  // 1. PII Detection (Hard Block)
  if (EMAIL_REGEX.test(text)) {
    flags.push("CONTAINED_EMAIL_ADDRESS");
  }
  if (PHONE_REGEX.test(text)) {
    flags.push("CONTAINED_PHONE_NUMBER");
  }
  if (AADHAAR_PAN_REGEX.test(text)) {
    flags.push("CONTAINED_GOVT_ID_OR_PAN");
  }

  if (flags.length > 0) {
    return {
      riskLevel: "BLOCKED",
      flags,
      warning: "Publication blocked: Private personal contact or ID information detected.",
    };
  }

  // 2. Minor Safety Rules (Hard Block if combined with sensitive terms)
  const containsMinor = MINOR_KEYWORDS.some((kw) => text.includes(kw));
  if (containsMinor) {
    const sensitiveMinor = ["sexual", "affair", "relationship", "nude", "leaked"].some((kw) =>
      text.includes(kw)
    );
    if (sensitiveMinor) {
      flags.push("MINOR_SAFETY_VIOLATION");
      return {
        riskLevel: "BLOCKED",
        flags,
        warning: "Publication blocked: Strict protections prohibit sensitive rumors regarding minors.",
      };
    }
    flags.push("INVOLVES_MINOR");
  }

  // 3. Defamation & High-Risk Claim Detection
  const highRiskHits = HIGH_RISK_KEYWORDS.filter((kw) => text.includes(kw));
  if (highRiskHits.length >= 2) {
    flags.push(`HIGH_RISK_ALLEGATIONS: ${highRiskHits.join(", ")}`);
  } else if (highRiskHits.length === 1) {
    flags.push(`MEDIUM_RISK_CLAIM: ${highRiskHits[0]}`);
  }

  // 4. Determine final risk classification
  let riskLevel = "LOW_RISK";
  if (flags.includes("INVOLVES_MINOR") || flags.some((f) => f.startsWith("HIGH_RISK"))) {
    riskLevel = "HIGH_RISK";
  } else if (flags.some((f) => f.startsWith("MEDIUM_RISK"))) {
    riskLevel = "MEDIUM_RISK";
  }

  return {
    riskLevel,
    flags,
    warning:
      riskLevel === "HIGH_RISK"
        ? "This post contains sensitive claims and will be flagged for Trust & Safety review."
        : null,
  };
}

module.exports = {
  screenGossipContent,
};
