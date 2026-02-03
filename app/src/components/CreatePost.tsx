import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Send, X } from 'lucide-react';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { currentUser } = useAuthStore();
  const { createPost } = usePostStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!currentUser) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;

    createPost(currentUser.id, content.trim(), imageUrl || undefined);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
    onPostCreated?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Что у вас на уме?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] bg-muted border-border resize-none focus:ring-2 focus:ring-primary/50"
            />

            {showImageInput && (
              <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Вставьте ссылку на изображение"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl('');
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {imageUrl && (
              <div className="mt-3 relative animate-fadeIn">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-cover"
                  onError={() => setImageUrl('')}
                />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`p-2 rounded-lg transition-colors ${
                    showImageInput
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Опубликовать
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
