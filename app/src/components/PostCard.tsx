import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePostStore, type Post } from '@/store/postStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { currentUser, getUserById } = useAuthStore();
  const { likePost, unlikePost, deletePost, addComment, deleteComment } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const author = getUserById(post.authorId);
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser?.id === post.authorId;
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;

  const handleLike = () => {
    if (!currentUser) return;
    if (isLiked) {
      unlikePost(post.id, currentUser.id);
    } else {
      likePost(post.id, currentUser.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Удалить этот пост?')) {
      deletePost(post.id);
    }
  };

  const handleAddComment = () => {
    if (!currentUser || !commentText.trim()) return;
    addComment(post.id, currentUser.id, commentText.trim());
    setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Удалить этот комментарий?')) {
      deleteComment(post.id, commentId);
    }
  };

  if (!author) return null;

  return (
    <Card className="bg-card border-border mb-4 animate-fadeIn">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{author.displayName}</p>
              <p className="text-xs text-muted-foreground">
                @{author.username} · {formatDistanceToNow(post.createdAt)}
              </p>
            </div>
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={post.image}
              alt="Post image"
              className="w-full max-h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked
                ? 'text-accent'
                : 'text-muted-foreground hover:text-accent'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 transition-colors ${
              showComments
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{commentsCount}</span>
          </button>

          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border animate-fadeIn">
            {/* Comment Input */}
            {currentUser && (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Написать комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment();
                    }}
                    className="flex-1 bg-muted border-border"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    size="icon"
                    className="bg-primary hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Пока нет комментариев. Будьте первым!
                </p>
              ) : (
                post.comments
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((comment) => {
                    const commentAuthor = getUserById(comment.authorId);
                    if (!commentAuthor) return null;
                    const isCommentAuthor = currentUser?.id === comment.authorId;

                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={commentAuthor.avatar} />
                          <AvatarFallback>
                            {commentAuthor.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {commentAuthor.displayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(comment.createdAt)}
                              </span>
                            </div>
                            {isCommentAuthor && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
