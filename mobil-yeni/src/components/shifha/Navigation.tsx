/**
 * Shifha Bottom Navigation
 * Alt sekme navigasyonu ve gerçek QR tarayıcı
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Activity, 
  TestTube, 
  User,
  MessageCircle,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: 'home' | 'tracking' | 'lab-results' | 'ai-chat' | 'blog' | 'profile' | 'appointments' | 'appointment-booking' | 'community';
  onTabChange: (tab: 'home' | 'tracking' | 'lab-results' | 'ai-chat' | 'blog' | 'profile' | 'appointments' | 'appointment-booking' | 'community') => void;
}



export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {

  const tabs = [
    {
      id: 'home' as const,
      label: 'Ana Sayfa',
      icon: Home,
      badge: null
    },
    {
      id: 'tracking' as const,
      label: 'Takip',
      icon: Activity,
      badge: '3'
    },
    {
      id: 'appointments' as const,
      label: 'Randevular',
      icon: Calendar,
      badge: '2'
    },
    {
      id: 'community' as const,
      label: 'Topluluk',
      icon: Users,
      badge: null
    },
    {
      id: 'lab-results' as const,
      label: 'Tahlil',
      icon: TestTube,
      badge: null
    },
    {
      id: 'ai-chat' as const,
      label: 'AI Destek',
      icon: MessageCircle,
      badge: null
    },
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: User,
      badge: null
    }
  ];



  return (
    <>
      {/* Ana Navigasyon */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="grid grid-cols-7 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "h-16 flex-col space-y-1 rounded-none relative text-xs",
                  isActive && "text-primary bg-primary/10"
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {tab.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 w-4 h-4 text-xs p-0 flex items-center justify-center"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
                
                {/* Aktif sekme göstergesi */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20" />
    </>
  );
};