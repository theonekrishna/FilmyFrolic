import React from "react";

/**
 * INBOX ITEM SKELETON
 * Single conversation row placeholder
 */
export const InboxItemSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1 animate-pulse">
    <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-white/10" />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center gap-1 mb-2">
        <div className="h-3 w-44 bg-white/10 rounded" />
        <div className="w-2 h-2 flex-shrink-0 bg-white/10 rounded-full" />
      </div>
      <div className="h-2 w-32 bg-white/5 rounded" />
    </div>
  </div>
);

/**
 * INBOX LIST SKELETON
 * Multiple conversation rows
 */
export const InboxListSkeleton = ({ count = 6 }) => (
  <div className="px-2 pb-4">
    {Array.from({ length: count }).map((_, i) => (
      <InboxItemSkeleton key={i} />
    ))}
  </div>
);

/**
 * RECEIVED MESSAGE SKELETON (Left Side)
 * Larger profile icon and thicker message lines.
 */
export const ReceivedMessageSkeleton = () => (
  <div className="flex items-end gap-3 w-full mb-6 animate-pulse">
    {/* Larger Avatar */}
    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-white/10" />

    <div className="flex flex-col items-start max-w-[80%]">
      {/* Thicker, more substantial bubble */}
      <div className="px-5 py-4 bg-white/5 rounded-[22px] rounded-tl-none border border-white/5 shadow-sm">
        {/* Simulating 2-3 lines of text with varying widths */}
        <div className="h-3.5 w-48 md:w-64 bg-white/10 rounded-full mb-3" />
        <div className="h-3.5 w-32 md:w-40 bg-white/10 rounded-full" />
      </div>
      {/* Timestamp */}
      <div className="h-2 w-10 bg-white/5 rounded mt-2 ml-2" />
    </div>
  </div>
);

/**
 * SENT MESSAGE SKELETON (Right Side)
 * Bold, high-contrast bubble to simulate user's own messages.
 */
export const SentMessageSkeleton = () => (
  <div className="flex items-end justify-end w-full mb-6 animate-pulse">
    <div className="flex flex-col items-end max-w-[80%]">
      <div className="px-5 py-4 bg-white/15 rounded-[22px] rounded-tr-none shadow-md">
        {/* Higher opacity for the "sender" lines to show focus */}
        <div className="h-3.5 w-40 md:w-56 bg-white/20 rounded-full mb-3" />
        <div className="h-3.5 w-24 md:w-32 bg-white/20 rounded-full" />
      </div>
      {/* Timestamp */}
      <div className="h-2 w-10 bg-white/5 rounded mt-2 mr-2" />
    </div>
  </div>
);

/**
 * FULL CHAT SKELETON
 * Layout using the new larger bubbles.
 */
export const ChatMessagesSkeleton = ({ count = 6 }) => (
  <div className="flex flex-col p-6 overflow-hidden">
    {Array.from({ length: count }).map((_, i) =>
      i % 2 === 0 ? <ReceivedMessageSkeleton key={i} /> : <SentMessageSkeleton key={i} />
    )}
  </div>
);

const MessagingSkeleton = {
  Inbox: InboxListSkeleton,
  InboxItem: InboxItemSkeleton,
  Received: ReceivedMessageSkeleton,
  Sent: SentMessageSkeleton,
  Chat: ChatMessagesSkeleton,
};

export default MessagingSkeleton;
