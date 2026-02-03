import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  MessageCircle,
  User,
  LogOut,
  Users,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMessages: () => void;
}

export function Sidebar({ activeTab, onTabChange, onOpenMessages }: SidebarProps) {
  const { currentUser, logout } = useAuthStore();
  const { getConversations } = useMessageStore();

  const conversations = currentUser ? getConversations(currentUser.id) : [];
  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const menuItems = [
    { id: 'feed', label: 'Лента', icon: Home },
    { id: 'messages', label: 'Сообщения', icon: MessageCircle, badge: unreadCount },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'users', label: 'Пользователи', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    onTabChange('feed');
  };

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Дрочильня
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Общайся freely</p>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User Info */}
      {currentUser && (
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'messages') {
                    onOpenMessages();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Bottom Actions */}
      <div className="p-3 space-y-1">
        {currentUser ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Войти</span>
          </button>
        )}
      </div>
    </div>
  );
}
