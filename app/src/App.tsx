import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Sidebar';
import { Feed } from '@/components/Feed';
import { Messages } from '@/components/Messages';
import { Profile } from '@/components/Profile';
import { UsersList } from '@/components/UsersList';
import { LoginModal } from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp } from 'lucide-react';
import './App.css';

type TabType = 'feed' | 'messages' | 'profile' | 'users' | 'login';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'login' && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if ((tab === 'profile' || tab === 'messages') && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tab as TabType);
    setSelectedUserId(null);
  };

  const handleOpenMessages = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowMessages(true);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
  };

  const handleMessageUser = (_userId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowMessages(true);
  };

  const renderContent = () => {
    if (showMessages) {
      return <Messages onClose={() => setShowMessages(false)} />;
    }

    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'profile':
        return <Profile userId={selectedUserId || undefined} />;
      case 'users':
        return (
          <UsersList
            onSelectUser={handleSelectUser}
            onMessageUser={handleMessageUser}
          />
        );
      default:
        return <Feed />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar - only show when not in messages */}
      {!showMessages && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenMessages={handleOpenMessages}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Welcome Toast for new users */}
      {!isAuthenticated && !showLoginModal && activeTab === 'feed' && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl animate-fadeIn max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Добро пожаловать в Дрочильню!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Войдите или создайте аккаунт, чтобы публиковать посты,
                  общаться с другими и ставить лайки.
                </p>
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-3 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Начать
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
