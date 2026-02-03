import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  userId: string;
  messages: Message[];
  lastMessageAt: string;
}

interface MessageState {
  messages: Message[];
  sendMessage: (senderId: string, receiverId: string, content: string) => void;
  getConversation: (userId1: string, userId2: string) => Message[];
  getConversations: (userId: string) => { userId: string; lastMessage: Message | null; unreadCount: number }[];
  markAsRead: (senderId: string, receiverId: string) => void;
  deleteMessage: (messageId: string) => void;
}

const sampleMessages: Message[] = [
  {
    id: 'm1',
    senderId: '1',
    receiverId: '2',
    content: 'Привет! Как дела?',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'm2',
    senderId: '2',
    receiverId: '1',
    content: 'Отлично! А у тебя?',
    createdAt: new Date(Date.now() - 86000000).toISOString(),
    read: true,
  },
  {
    id: 'm3',
    senderId: '1',
    receiverId: '2',
    content: 'Тоже хорошо, спасибо!',
    createdAt: new Date(Date.now() - 85000000).toISOString(),
    read: true,
  },
];

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: sampleMessages,

      sendMessage: (senderId: string, receiverId: string, content: string) => {
        const newMessage: Message = {
          id: `m${Date.now()}`,
          senderId,
          receiverId,
          content,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },

      getConversation: (userId1: string, userId2: string) => {
        return get()
          .messages.filter(
            (m) =>
              (m.senderId === userId1 && m.receiverId === userId2) ||
              (m.senderId === userId2 && m.receiverId === userId1)
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      },

      getConversations: (userId: string) => {
        const userMessages = get().messages.filter(
          (m) => m.senderId === userId || m.receiverId === userId
        );

        const conversationsMap = new Map<
          string,
          { messages: Message[]; unreadCount: number }
        >();

        userMessages.forEach((m) => {
          const otherUserId = m.senderId === userId ? m.receiverId : m.senderId;
          if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, { messages: [], unreadCount: 0 });
          }
          const conv = conversationsMap.get(otherUserId)!;
          conv.messages.push(m);
          if (m.receiverId === userId && !m.read) {
            conv.unreadCount++;
          }
        });

        return Array.from(conversationsMap.entries())
          .map(([otherUserId, data]) => ({
            userId: otherUserId,
            lastMessage: data.messages.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0] || null,
            unreadCount: data.unreadCount,
          }))
          .sort((a, b) => {
            if (!a.lastMessage || !b.lastMessage) return 0;
            return (
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
            );
          });
      },

      markAsRead: (senderId: string, receiverId: string) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.senderId === senderId && m.receiverId === receiverId && !m.read
              ? { ...m, read: true }
              : m
          ),
        }));
      },

      deleteMessage: (messageId: string) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }));
      },
    }),
    {
      name: 'message-storage',
    }
  )
);
