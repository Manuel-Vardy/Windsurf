import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ClassView from './ClassView';
import { useSchool } from '@/contexts/SchoolContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'class'>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { setSelectedClass } = useSchool();

  const handleClassClick = (classId: number) => {
    setSelectedClass(classId);
    setCurrentView('class');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar
            currentView={currentView}
            onViewChange={(view) => {
              setCurrentView(view);
              setMobileNavOpen(false);
            }}
            className="w-full min-h-0"
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden p-4 border-b border-border flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="font-semibold">School Canteen</div>
        </div>

        {currentView === 'dashboard' ? (
          <Dashboard onClassClick={handleClassClick} />
        ) : (
          <ClassView />
        )}
      </main>
    </div>
  );
};

export default MainLayout;
