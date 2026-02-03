import { usePostStore } from '@/store/postStore';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';

export function Feed() {
  const { getFeedPosts } = usePostStore();
  const posts = getFeedPosts();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Лента</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Смотрите что нового у других пользователей
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 max-w-2xl mx-auto">
          <CreatePost />
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Пока нет постов
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Будьте первым! Создайте свой первый пост выше.
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
