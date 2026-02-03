import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, MessageCircle } from 'lucide-react';

interface UsersListProps {
  onSelectUser: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}

export function UsersList({ onSelectUser, onMessageUser }: UsersListProps) {
  const { currentUser, users } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Пользователи</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} пользователей
            </p>
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
        <div className="p-4 max-w-2xl mx-auto">
          {filteredUsers.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Пользователи не найдены
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Попробуйте изменить поисковый запрос
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        className="w-14 h-14 cursor-pointer"
                        onClick={() => onSelectUser(user.id)}
                      >
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-lg">
                          {user.displayName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectUser(user.id)}
                      >
                        <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                          {user.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onMessageUser(user.id)}
                        className="p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
