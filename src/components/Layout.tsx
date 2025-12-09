import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Dumbbell, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { CommandPalette } from './CommandPalette';
import { QuickActions } from './QuickActions';

const navigation = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard, badge: null, shortcut: '⌘1' },
  { name: 'ลูกเทรน', href: '/clients', icon: Users, badge: null, shortcut: '⌘2' },
  { name: 'ปฏิทิน', href: '/calendar', icon: Calendar, badge: 3, shortcut: '⌘3' },
  { name: 'โปรแกรม', href: '/programs', icon: Dumbbell, badge: null, shortcut: '⌘4' },
  { name: 'คลังท่า', href: '/library/exercises', icon: BookOpen, badge: null, shortcut: '⌘5' },
  { name: 'รายงาน', href: '/reports', icon: BarChart3, badge: null, shortcut: '⌘6' },
  { name: 'ตั้งค่า', href: '/settings', icon: Settings, badge: null, shortcut: '⌘,' },
];

// Mobile-friendly main navigation (top 5 items for bottom nav)
const mainNavigation = navigation.slice(0, 5);

interface SidebarContentProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function SidebarContent({ collapsed = false, onToggle }: SidebarContentProps) {
  const location = useLocation();
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full bg-sidebar">
        {/* Header with Logo */}
        <div className={`flex items-center justify-between p-4 border-b border-sidebar-border/50 ${collapsed ? 'px-2' : 'px-6'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary blur-lg opacity-30 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg">
                  <Dumbbell className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground tracking-tight">FitTrack Manager</h2>
                <p className="text-[10px] text-sidebar-foreground/60">ระบบจัดการลูกเทรน</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary blur opacity-40 rounded-lg"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent p-1.5 rounded-lg">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
          {onToggle && !collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Expand button when collapsed */}
        {collapsed && onToggle && (
          <div className="px-2 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-full h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            
            const linkContent = (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <div className="relative">
                  <item.icon className={`h-5 w-5 ${collapsed ? '' : 'flex-shrink-0'} transition-transform group-hover:scale-110`} />
                  {item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">{item.name}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-accent/20 text-accent-foreground border-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border/50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <div className="flex-1">
                <p className="text-xs font-medium text-sidebar-foreground">Pro Tips</p>
                <p className="text-[10px] text-sidebar-foreground/60">กด Cmd+K เพื่อค้นหา</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function MobileSidebarContent() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary blur-lg opacity-30 rounded-xl"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Trainer Pro</h2>
            <p className="text-xs text-muted-foreground">Professional Edition</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground/70 hover:bg-accent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge !== null && item.badge > 0 && (
                <Badge variant={isActive ? "secondary" : "default"} className="h-5 px-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">Pro Tips</p>
            <p className="text-[10px] text-muted-foreground truncate">ใช้งานได้ง่ายขึ้นทุกวัน</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const index = mainNavigation.findIndex(
      item => location.pathname === item.href || location.pathname.startsWith(item.href + '/')
    );
    if (index !== -1) setActiveIndex(index);
  }, [location.pathname]);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="relative grid grid-cols-5 h-16">
        {/* Animated Background Indicator */}
        <motion.div
          className="absolute top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
          initial={false}
          animate={{
            left: `${activeIndex * 20}%`,
            width: '20%',
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />

        {mainNavigation.map((item, index) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative flex flex-col items-center justify-center gap-1 transition-all"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.9,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    opacity: isActive ? 0.2 : 0,
                    scale: isActive ? 1.5 : 1,
                  }}
                  className="absolute inset-0 bg-primary rounded-full blur-md"
                />
                <item.icon 
                  className={`h-5 w-5 relative z-10 transition-colors ${
                    isActive 
                      ? 'text-primary stroke-[2.5]' 
                      : 'text-muted-foreground'
                  }`} 
                />
                {item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground shadow-lg">
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <motion.span 
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.9,
                }}
              >
                {item.name}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const currentPage = navigation.find(item => 
    location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  );

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Handle quick actions
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Quick Actions FAB */}
      <QuickActions onAction={handleQuickAction} />

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
      >
        <SidebarContent 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <div 
        className={`min-h-screen lg:transition-all lg:duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-foreground font-semibold">
                  {currentPage?.name || 'Trainer Pro'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  ยินดีต้อนรับกลับมา, {user?.name?.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-9"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="hidden xl:inline">ค้นหา</span>
                <kbd className="hidden xl:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  ⌘K
                </kbd>
              </Button>

              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.picture} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      ตั้งค่า
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <MobileSidebarContent />
              </SheetContent>
            </Sheet>

            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-foreground font-semibold">
                {currentPage?.name || 'Trainer Pro'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}