import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// User type imported for future use

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface PostState {
  posts: Post[];
  createPost: (authorId: string, content: string, image?: string) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;
  addComment: (postId: string, authorId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  getPostsByUser: (userId: string) => Post[];
  getFeedPosts: () => Post[];
}

const generateSamplePosts = (): Post[] => [
  {
    id: '1',
    authorId: '1',
    content: 'Добро пожаловать в Дрочильню! Здесь можно общаться и делиться мыслями.',
    likes: ['2', '3'],
    comments: [
      {
        id: 'c1',
        postId: '1',
        authorId: '2',
        content: 'Крутое место!',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    authorId: '2',
    content: 'Привет всем! Как дела?',
    likes: ['1'],
    comments: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '3',
    authorId: '3',
    content: 'Сегодня отличный день для общения!',
    likes: ['1', '2'],
    comments: [
      {
        id: 'c2',
        postId: '3',
        authorId: '1',
        content: 'Согласен!',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
];

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: generateSamplePosts(),

      createPost: (authorId: string, content: string, image?: string) => {
        const newPost: Post = {
          id: Date.now().toString(),
          authorId,
          content,
          image,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ posts: [newPost, ...state.posts] }));
      },

      deletePost: (postId: string) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        }));
      },

      likePost: (postId: string, userId: string) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId && !p.likes.includes(userId)
              ? { ...p, likes: [...p.likes, userId] }
              : p
          ),
        }));
      },

      unlikePost: (postId: string, userId: string) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, likes: p.likes.filter((id) => id !== userId) }
              : p
          ),
        }));
      },

      addComment: (postId: string, authorId: string, content: string) => {
        const newComment: Comment = {
          id: `c${Date.now()}`,
          postId,
          authorId,
          content,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, comments: [...p.comments, newComment] }
              : p
          ),
        }));
      },

      deleteComment: (postId: string, commentId: string) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
              : p
          ),
        }));
      },

      getPostsByUser: (userId: string) => {
        return get().posts.filter((p) => p.authorId === userId);
      },

      getFeedPosts: () => {
        return [...get().posts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
    }),
    {
      name: 'post-storage',
    }
  )
);
