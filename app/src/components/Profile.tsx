import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PostCard } from './PostCard';
import {
  Edit2,
  Calendar,
  MessageCircle,
  Heart,
  Save,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProfileProps {
  userId?: string;
}

export function Profile({ userId }: ProfileProps) {
  const { currentUser, getUserById, updateProfile } = useAuthStore();
  const { getPostsByUser } = usePostStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');

  const isOwnProfile = !userId || userId === currentUser?.id;
  const user = isOwnProfile ? currentUser : getUserById(userId);
  const posts = user ? getPostsByUser(user.id) : [];
  const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);

  const handleEdit = () => {
    if (!user) return;
    setEditDisplayName(user.displayName);
    setEditBio(user.bio);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editDisplayName.trim()) return;
    updateProfile({
      displayName: editDisplayName.trim(),
      bio: editBio.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Пользователь не найден</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-4 -mt-16 relative">
            <div className="flex items-end justify-between">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-4xl">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>

              {isOwnProfile && !isEditing && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="mb-4 border-border"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
            </div>

            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Отображаемое имя
                    </label>
                    <Input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="mt-1 bg-muted border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">О себе</label>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Расскажите о себе..."
                      className="mt-1 bg-muted border-border min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-primary hover:opacity-90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>

                  {user.bio && (
                    <p className="mt-3 text-foreground whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Присоединился {formatDate(user.joinedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{posts.length}</span>
                      <span className="text-muted-foreground">постов</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-accent" />
                      <span className="font-bold">{totalLikes}</span>
                      <span className="text-muted-foreground">лайков</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span className="font-bold">{totalComments}</span>
                      <span className="text-muted-foreground">комментариев</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Posts */}
          <div className="px-4 pb-4">
            <h2 className="text-xl font-bold mb-4">
              {isOwnProfile ? 'Мои посты' : `Посты ${user.displayName}`}
            </h2>

            {posts.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? 'У вас пока нет постов. Создайте свой первый пост!'
                      : 'У этого пользователя пока нет постов.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
