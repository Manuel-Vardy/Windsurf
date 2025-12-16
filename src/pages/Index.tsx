import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { SchoolProvider } from '@/contexts/SchoolContext';
import LoginPage from '@/components/LoginPage';
import MainLayout from '@/components/MainLayout';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
