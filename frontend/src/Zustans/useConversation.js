import { create } from "zustand";

const userConversation = create((set) => ({
  // Selected user conversation
  selectedConversation: null,
  setSelectedConversation: (updater) =>
    set((state) => ({
      selectedConversation:
        typeof updater === "function"
          ? updater(state.selectedConversation)
          : updater,
    })),

  // Messages array
  messages: [],
  setMessages: (updater) =>
    set((state) => ({
      messages: typeof updater === "function" ? updater(state.messages) : updater,
    })),

  // Add message to existing messages
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));

export default userConversation;