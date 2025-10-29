import React, { useState, useEffect, FormEvent } from "react";
import { Bot, MessageSquare, SendHorizonal, X } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { findBestMatch } from "@/components/modules/chatbot/findBestMatch"; // Response matching logic

function Chatbot() {
  // UI state
  const [isOpen, setIsOpen] = useState(false); // Chatbox open/close
  const [messages, setMessages] = useState<string[]>([
    "chatbot.how-can-we-help-today",
  ]); // Message history
  const [input, setInput] = useState(""); // User input
  const [height, setHeight] = useState(300); // Chatbox height
  const [isResizing, setIsResizing] = useState(false); // Drag-to-resize state
  const [botTyping, setBotTyping] = useState(false); // Typing indicator

  // Handle user submitting a message
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, `You: ${userMessage}`]);
    setInput("");
    setBotTyping(true);

    // Simulate bot typing and respond after delay
    setTimeout(() => {
      const { responseIds, matched } = findBestMatch(userMessage);
      setMessages((prev) => [
        ...prev,
        ...responseIds.map((res) =>
            matched ? `Bot: ${res}` : `Bot: ${res}|HUMAN_OPTION`
          )
      ]);
      setBotTyping(false);
    }, 1000 + userMessage.length * 50);
  };

  // Mouse interaction for resize
  const startResize = () => setIsResizing(true);
  const stopResize = () => setIsResizing(false);

  // Handle vertical resizing of the chat box
  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY + 20;
    if (newHeight >= 200 && newHeight <= 600) {
      setHeight(newHeight);
    }
  };

  // Set up and clean up mouse events for resizing
  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle chat window button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full w-12 h-12 p-0 bg-gray-800 text-white hover:bg-gray-700 shadow-lg"
      >
        {isOpen ? <MessageSquare size={20} /> : <Bot size={20} />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{ height }}
          className="mt-2 w-[90vw] sm:w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
        >
          {/* Chat header */}
          <div className="flex justify-between items-center bg-gray-800 text-white px-3 py-2 text-sm">
            <span>Kuku</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 text-sm space-y-1">
            {messages.map((msg, idx) => {
              const isUser = msg.startsWith("You:");
              const content = msg.replace(/^You:\s|^Bot:\s/, "");

              return (
                <div
                  key={idx}
                  className={isUser ? "text-right text-blue-600" : "text-left text-gray-700"}
                >
                  {/* Support internationalized bot messages */}
                  {content.includes("chatbot.") ? (
                    <FormattedMessage id={content.split("|")[0]} />
                  ) : (
                    content
                  )}

                  {/* Show "talk to human" option if bot fallback triggered */}
                  {content.includes("HUMAN_OPTION") && (
                    <div className="mt-1">
                      <button className="text-sm text-blue-500 underline">
                        <FormattedMessage id="chatbot.agent-option" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bot typing indicator */}
            {botTyping && (
              <div className="text-left px-3 py-1 flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
              </div>
            )}
          </div>

          {/* Input box and send button */}
          <form onSubmit={handleSubmit} className="flex border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type..."
              className="flex-grow px-2 py-1 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-3 hover:bg-gray-700 text-sm"
            >
              <SendHorizonal size={16} />
            </button>
          </form>

          {/* Resize handle */}
          <div
            onMouseDown={startResize}
            className="h-2 cursor-ns-resize bg-gray-100 hover:bg-gray-300 transition"
            title="Drag to resize"
          />
        </div>
      )}
    </div>
  );
}

export default Chatbot;
