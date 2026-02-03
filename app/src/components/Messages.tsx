import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';
import { formatDistanceToNow, formatTime } from '@/lib/utils';

interface MessagesProps {
  onClose: () => void;
}

export function Messages({ onClose }: MessagesProps) {
  const { currentUser, getUserById, users } = useAuthStore();
  const { getConversations, getConversation, sendMessage, markAsRead } = useMessageStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = currentUser ? getConversations(currentUser.id) : [];
  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;
  const currentMessages = selectedUserId && currentUser
    ? getConversation(currentUser.id, selectedUserId)
    : [];

  // Filter users for new conversation
  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedUserId && currentUser) {
      markAsRead(selectedUserId, currentUser.id);
    }
  }, [selectedUserId, currentUser, markAsRead]);

  const handleSendMessage = () => {
    if (!currentUser || !selectedUserId || !messageText.trim()) return;
    sendMessage(currentUser.id, selectedUserId, messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery('');
  };

  // Conversation List View
  if (!selectedUserId) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold">Сообщения</h2>
                <p className="text-sm text-muted-foreground">
                  {conversations.length} чатов
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Найти пользователя..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {searchQuery ? (
              // Search results
              filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Пользователи не найдены
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                ))
              )
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Нет сообщений
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Найдите пользователя выше, чтобы начать чат
                </p>
              </div>
            ) : (
              // Conversations list
              conversations.map((conv) => {
                const user = getUserById(conv.userId);
                if (!user) return null;

                return (
                  <button
                    key={conv.userId}
                    onClick={() => handleSelectUser(conv.userId)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage
                          ? conv.lastMessage.senderId === currentUser?.id
                            ? 'Вы: '
                            : ''
                          : ''}
                        {conv.lastMessage?.content || 'Нет сообщений'}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Chat View
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedUserId(null)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser?.avatar} />
              <AvatarFallback>{selectedUser?.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedUser?.displayName}</p>
              <p className="text-xs text-muted-foreground">
                @{selectedUser?.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {currentMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Начните общение с {selectedUser?.displayName}
              </p>
            </div>
          ) : (
            currentMessages.map((msg, index) => {
              const isOwn = msg.senderId === currentUser?.id;
              const showTime =
                index === 0 ||
                new Date(msg.createdAt).getTime() -
                  new Date(currentMessages[index - 1].createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <div key={msg.id}>
                  {showTime && (
                    <p className="text-center text-xs text-muted-foreground my-4">
                      {formatTime(msg.createdAt)}
                    </p>
                  )}
                  <div
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {isOwn && (
                          <span className="ml-2">
                            {msg.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Написать сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-muted border-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-primary hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
