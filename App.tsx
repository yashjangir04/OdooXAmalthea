import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import { User, Role } from './types';
import { getCurrentUser, logoutUser } from './services/api';
import { Header } from './components/common/Header';

enum Page {
  Login,
  Signup,
  AdminDashboard,
  UserDashboard,
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (user.role === Role.Admin) {
          setCurrentPage(Page.AdminDashboard);
        } else {
          setCurrentPage(Page.UserDashboard);
        }
      } else {
        setCurrentPage(Page.Login);
      }
      setIsLoading(false);
    }
    checkCurrentUser();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === Role.Admin) {
      setCurrentPage(Page.AdminDashboard);
    } else {
      setCurrentPage(Page.UserDashboard);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentPage(Page.Login);
  };

  const navigateToSignup = () => {
    setCurrentPage(Page.Signup);
  };
  
  const navigateToLogin = () => {
    setCurrentPage(Page.Login);
  };

  const renderContent = () => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    
    switch (currentPage) {
      case Page.Login:
        return <LoginPage onLogin={handleLogin} onNavigateToSignup={navigateToSignup} />;
      case Page.Signup:
        return <SignupPage onSignupSuccess={navigateToLogin} onNavigateToLogin={navigateToLogin} />;
      case Page.AdminDashboard:
        return currentUser && <AdminDashboard />;
      case Page.UserDashboard:
        return currentUser && <UserDashboard user={currentUser} />;
      default:
        return <LoginPage onLogin={handleLogin} onNavigateToSignup={navigateToSignup} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {currentUser && <Header user={currentUser} onLogout={handleLogout} />}
      <main className={currentUser ? "p-4 md:p-8" : ""}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
