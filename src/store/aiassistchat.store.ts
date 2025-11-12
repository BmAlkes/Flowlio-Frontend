import { create } from "zustand";
import { axios } from "@/configs/axios.config";

export type ChatMessage = {
  role: "user" | "ai";
  text: string;
  timestamp?: Date;
  isLoading?: boolean;
  attachments?: File[];
  imageUrl?: string; // Added for generated images
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

interface AiAssistChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  userId: string | null;
  addChat: (chat: Omit<Chat, "id">) => string;
  editChatTitle: (id: string, newTitle: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setActiveChat: (id: string) => void;
  setUserId: (userId: string) => void;
  loadUserChats: (userId: string) => Promise<void>;
  sendAIRequest: (
    message: string,
    chatId: string,
    attachments?: File[]
  ) => Promise<void>;
  clearAllChats: () => void;
  clearUserSession: () => void;
  generateImage: (prompt: string, chatId: string) => Promise<void>;
}

export const useAiAssistChatStore = create<AiAssistChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  isLoading: false,
  userId: null,

  setUserId: (userId) => set({ userId }),

  addChat: (chat) => {
    const id = Date.now().toString();
    const newChat: Chat = {
      ...chat,
      id,
      userId: get().userId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      chats: [...state.chats, newChat],
      activeChatId: id,
    }));
    return id;
  },

  editChatTitle: (id, newTitle) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: new Date() } : c
      ),
    }));
  },

  deleteChat: async (id) => {
    set((state) => {
      const chats = state.chats.filter((c) => c.id !== id);
      const activeChatId =
        state.activeChatId === id ? chats[0]?.id ?? null : state.activeChatId;
      return { chats, activeChatId };
    });

    // Update localStorage after deleting chat
    const { userId } = get();
    if (userId) {
      const updatedChats = get().chats;
      localStorage.setItem(`ai_chats_${userId}`, JSON.stringify(updatedChats));
    }

    // Here you can add API call to delete chat from backend
    // if (get().userId) await axios.delete(`/ai/chat/${id}`);
  },

  addMessage: (chatId, message) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date(),
    };

    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, messageWithTimestamp],
              updatedAt: new Date(),
              // Update chat title based on first user message if still default
              title:
                c.title === "New Chat" && message.role === "user"
                  ? message.text.substring(0, 50) +
                    (message.text.length > 50 ? "..." : "")
                  : c.title,
            }
          : c
      ),
    }));
  },

  setActiveChat: (id) => set({ activeChatId: id }),

  // Load user's chat history from backend
  loadUserChats: async (userId) => {
    if (!userId) {
      // Clear chats if no userId provided
      set({ chats: [], activeChatId: null, userId: null });
      return;
    }

    // Always clear existing chats when loading chats for any user
    // This ensures no cross-user data leakage
    set({ chats: [], activeChatId: null, isLoading: true, userId });

    try {
      // For now, we'll use localStorage but in production this should be API call
      const savedChats = localStorage.getItem(`ai_chats_${userId}`);
      const chats = savedChats
        ? JSON.parse(savedChats).map((chat: any) => ({
            ...chat,
            createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date(),
            updatedAt: chat.updatedAt ? new Date(chat.updatedAt) : new Date(),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            })),
          }))
        : [];

      set({ chats });

      if (chats.length > 0) {
        set({ activeChatId: chats[0].id });
      }
    } catch (error) {
      console.error("Error loading user chats:", error);
      // Clear chats on error to prevent showing corrupted data
      set({ chats: [], activeChatId: null });
    } finally {
      set({ isLoading: false });
    }
  },
  sendAIRequest: async (message, chatId, attachments) => {
    const { userId } = get();
    if (
      !userId ||
      (!message.trim() && (!attachments || attachments.length === 0))
    )
      return;

    set({ isLoading: true });

    // Add user message with attachments
    get().addMessage(chatId, {
      role: "user",
      text:
        message ||
        (attachments ? `Uploaded ${attachments.length} file(s)` : ""),
      attachments: attachments,
    });

    // Add loading message
    get().addMessage(chatId, { role: "ai", text: "", isLoading: true });

    try {
      // Prepare FormData for file uploads
      const formData = new FormData();
      formData.append("userInput", message);

      // Add conversation history for context
      const activeChat = get().chats.find((c) => c.id === chatId);
      if (activeChat && activeChat.messages.length > 2) {
        const history = activeChat.messages
          .slice(-10, -1) // Last 10 messages excluding the current one
          .map((msg) => ({ role: msg.role, content: msg.text }));
        formData.append("conversationHistory", JSON.stringify(history));
      }

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Use the new advanced conversation endpoint
      const response = await axios.post("/ai/conversation", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const aiResponse =
        response.data.data?.response ||
        "Hello! I'm Flowlio AI, your intelligent assistant. I can help you with absolutely anything - from answering questions and solving problems to creative writing and brainstorming ideas. What would you like to explore or work on today?";

      // Update loading message with AI response
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((msg, index) =>
                  index === c.messages.length - 1 && msg.isLoading
                    ? { role: "ai", text: aiResponse, timestamp: new Date() }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : c
        ),
      }));
    } catch (error) {
      console.error("AI request failed:", error);

      // Update loading message with error response
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((msg, index) =>
                  index === c.messages.length - 1 && msg.isLoading
                    ? {
                        role: "ai",
                        text: "I'm sorry, I encountered an error. Please try again later.",
                        timestamp: new Date(),
                      }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : c
        ),
      }));
    } finally {
      set({ isLoading: false });

      // Save to localStorage (in production this would be saved to backend)
      const updatedChats = get().chats;
      localStorage.setItem(`ai_chats_${userId}`, JSON.stringify(updatedChats));
    }
  },

  clearAllChats: () => {
    set({ chats: [], activeChatId: null });

    const { userId } = get();
    if (userId) {
      localStorage.removeItem(`ai_chats_${userId}`);
    }
  },

  // Clear chats when user logs out
  clearUserSession: () => {
    set({ chats: [], activeChatId: null, userId: null });
  },

  // Generate image using DALL-E
  generateImage: async (prompt: string, chatId: string) => {
    const { userId } = get();
    if (!userId || !prompt.trim()) return;

    set({ isLoading: true });

    // Add user message
    get().addMessage(chatId, {
      role: "user",
      text: `Generate image: ${prompt}`,
    });

    // Add loading AI message
    get().addMessage(chatId, {
      role: "ai",
      text: "Generating image...",
      isLoading: true,
    });

    try {
      const response = await axios.post("/ai/generate-image", {
        prompt,
        size: "1024x1024",
      });

      const imageUrl = response.data.data?.imageUrl;

      if (imageUrl) {
        // Update the loading message with the image
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((msg, index) =>
                    index === c.messages.length - 1 && msg.isLoading
                      ? {
                          role: "ai",
                          text: `Here's your generated image:`,
                          imageUrl: imageUrl,
                          timestamp: new Date(),
                        }
                      : msg
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      } else {
        throw new Error("No image URL received");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      // Update the loading message with error
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((msg, index) =>
                  index === c.messages.length - 1 && msg.isLoading
                    ? {
                        role: "ai",
                        text: "I'm sorry, I couldn't generate the image. Please try again later.",
                        timestamp: new Date(),
                      }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : c
        ),
      }));
    } finally {
      set({ isLoading: false });
      // Save to localStorage
      const updatedChats = get().chats;
      localStorage.setItem(`ai_chats_${userId}`, JSON.stringify(updatedChats));
    }
  },
}));
