import { create } from "zustand";

const userConversation = create((set) => ({
  // Selected user conversation
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  
  // Messages array
  messages: [],
  setMessages: (messages) => set({ messages }),
  
  // Add message to existing messages
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  }))
}));

export default userConversation;