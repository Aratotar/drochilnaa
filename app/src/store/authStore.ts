import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  joinedAt: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password: string) => boolean;
  register: (username: string, displayName: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  getUserById: (id: string) => User | undefined;
}

const generateAvatar = (username: string) => {
  const colors = ['#9333ea', '#db2777', '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
  const color = colors[username.charCodeAt(0) % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color.replace('#', '')}&color=fff&size=128`;
};

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    displayName: 'Админ',
    avatar: generateAvatar('admin'),
    bio: 'Создатель Дрочильни',
    joinedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'user1',
    displayName: 'Пользователь 1',
    avatar: generateAvatar('user1'),
    bio: 'Люблю общаться!',
    joinedAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'user2',
    displayName: 'Пользователь 2',
    avatar: generateAvatar('user2'),
    bio: 'Привет всем!',
    joinedAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: defaultUsers,

      login: (username: string, _password: string) => {
        const user = get().users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      register: (username: string, displayName: string, _password: string) => {
        const exists = get().users.some(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (exists) return false;

        const newUser: User = {
          id: Date.now().toString(),
          username,
          displayName,
          avatar: generateAvatar(username),
          bio: '',
          joinedAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        }));
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) =>
            u.id === currentUser.id ? updatedUser : u
          ),
        }));
      },

      getUserById: (id: string) => {
        return get().users.find((u) => u.id === id);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
