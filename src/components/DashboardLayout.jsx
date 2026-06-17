import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Menu, X, Bell, User, LogOut, ChevronRight,
  LayoutDashboard, Calendar, History, FolderHeart, FileText, 
  Users, CalendarClock, PenTool, ClipboardList, Wallet, FilePieChart
} from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Appointment Confirmed", desc: "Your appointment with Dr. Sarah Jenkins is scheduled.", time: "10m ago", read: false },
    { id: 2, title: "New Prescription", desc: "Dr. Elena Rostova added a prescription.", time: "2h ago", read: false },
    { id: 3, title: "Record Uploaded", desc: "Your blood panel test record is available.", time: "1d ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Define links based on user role
  const getSidebarLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'patient':
        return [
          { name: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
          { name: "My Profile", path: "/patient/profile", icon: User },
          { name: "Book Appointment", path: "/patient/book", icon: Calendar },
          { name: "My Appointments", path: "/patient/appointments", icon: History },
          { name: "Medical Reports", path: "/patient/records", icon: FolderHeart },
          { name: "Upload Reports", path: "/patient/records", icon: FolderHeart },
          { name: "Prescriptions", path: "/patient/prescriptions", icon: FileText },
        ];
      case 'doctor':
        return [
          { name: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
          { name: "Patients", path: "/doctor/patients", icon: Users },
          { name: "Appointments", path: "/doctor/appointments", icon: ClipboardList },
          { name: "Schedule", path: "/doctor/schedule", icon: CalendarClock },
          { name: "Prescriptions", path: "/doctor/write-prescription", icon: PenTool },
          { name: "Upload Reports", path: "/doctor/patients", icon: FolderHeart },
          { name: "Profile", path: "/doctor/schedule", icon: User },
        ];
      case 'admin':
        return [
          { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Manage Doctors", path: "/admin/doctors", icon: Users },
          { name: "Manage Patients", path: "/admin/patients", icon: ClipboardList },
          { name: "Manage Medicines", path: "/admin/dashboard", icon: FileText },
          { name: "Manage Appointments", path: "/admin/dashboard", icon: Calendar },
          { name: "Reports", path: "/admin/reports", icon: FilePieChart },
          { name: "Analytics", path: "/admin/revenue", icon: Wallet },
          { name: "Uploaded Files", path: "/admin/reports", icon: FolderHeart },
        ];
      default:
        return [];
    }
  };

  const sidebarLinks = getSidebarLinks();

  // Close overlays on path changes
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Component */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-card border-r border-border/50 z-40 flex flex-col transition-all duration-300 transform md:sticky md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 shrink-0">
              <Activity className="w-5.5 h-5.5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-black tracking-tight text-foreground transition-all duration-300">
                Medi<span className="text-primary">HMS</span>
              </span>
            )}
          </Link>
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:scale-105 transition-transform'}`} />
                {!collapsed && <span className="truncate">{link.name}</span>}
                
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-popover border border-border text-xs text-foreground font-semibold rounded-md shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-150 z-50 origin-left">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapsible toggle & Logout */}
        <div className="p-4 border-t border-border/30 flex flex-col gap-2">
          {/* Collapse toggle (desktop only) */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-none">Role Access</span>
              <span className="text-sm font-bold text-foreground capitalize mt-1">{user?.role} Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Trigger */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center border border-border/50 hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground ring-2 ring-card animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-popover border border-border shadow-xl z-50 flex flex-col py-1 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-4 py-2 border-b border-border/40 flex justify-between items-center bg-muted/20">
                    <span className="text-xs font-bold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] text-primary hover:underline font-bold bg-transparent"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border/30">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 text-xs transition-colors hover:bg-muted/30 ${!notif.read ? 'bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">{notif.title}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{notif.time}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-muted/50 border border-border/50 rounded-full hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-foreground truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-popover border border-border shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-border/40 mb-1">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {user.role === 'patient' && (
                      <Link to="/patient/profile" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground transition-colors">
                        <User className="w-4 h-4 text-muted-foreground" /> View Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-destructive/10 text-destructive transition-colors text-left w-full mt-1 cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </header>

        {/* Dashboard Main Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
