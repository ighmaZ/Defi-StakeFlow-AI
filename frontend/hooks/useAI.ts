import { useState, useCallback, useRef } from "react";
import type { AIMessage } from "@/types";

const INITIAL_MESSAGE: AIMessage = {
  role: "assistant",
  content:
    "Hi! I'm your DeFi assistant. Ask me about staking, rewards, or how to use this platform!",
  timestamp: Date.now(),
};

export interface AIContext {
  walletAddress?: string;
  stakedAmount?: string;
  pendingRewards?: string;
  [key: string]: unknown;
}

export function useAI() {
  const [messages, setMessages] = useState<AIMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: AIContext) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Add user message
      const userMessage: AIMessage = {
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, context }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to get AI response: ${response.status}`);
        }

        const data = await response.json();

        // Validate response shape
        if (!data || typeof data.message !== "string") {
          throw new Error("Invalid response format from AI");
        }

        // Add AI response
        const aiMessage: AIMessage = {
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        // Don't show error message if request was aborted
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("AI request failed:", error);
        }

        const errorMessage: AIMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    // Cancel any pending request when clearing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([{ ...INITIAL_MESSAGE, timestamp: Date.now() }]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
  };
}
