"use client";

import dynamic from "next/dynamic";

// ChatBubble is a floating widget, not needed for first paint/LCP or content
// access. `ssr: false` requires a Client Component boundary in the App
// Router, hence this thin wrapper — it defers ChatBubble's JS (SSE client +
// message list) until after hydration instead of shipping it in the
// critical path on every page load.
const ChatBubble = dynamic(() => import("./ChatBubble"), { ssr: false });

export default function ChatBubbleLazy() {
    return <ChatBubble />;
}
