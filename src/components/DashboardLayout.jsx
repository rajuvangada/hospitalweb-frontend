import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, User, LogOut, ChevronRight, Search, 
  LayoutDashboard, Calendar, History, FolderHeart, FileText, 
  Users, CalendarClock, PenTool, ClipboardList, Wallet, FilePieChart,
  ShoppingCart, Database
} from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('medicine_cart') || '[]');
      const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    const interval = setInterval(updateCartCount, 1200);
    return () => clearInterval(interval);
  }, []);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Appointment Confirmed", desc: "Your appointment with Dr. Sarah Jenkins is scheduled.", time: "10m ago", read: false },
    { id: 2, title: "New Prescription", desc: "Dr. Gregory House added a prescription.", time: "2h ago", read: false },
    { id: 3, title: "Record Uploaded", desc: "Your blood panel test record is available.", time: "1d ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const getSidebarLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'patient':
        return [
          { name: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
          { name: "Appointments", path: "/patient/appointments", icon: Calendar },
          { name: "Doctors", path: "/patient/book", icon: Users },
          { name: "Browse Medicines", path: "/patient/medicines", icon: Database },
          { name: "Medicine Cart", path: "/patient/cart", icon: ShoppingCart },
          { name: "Medical Records", path: "/patient/records", icon: FolderHeart },
          { name: "Prescriptions", path: "/patient/prescriptions", icon: FileText },
          { name: "Profile", path: "/patient/profile", icon: User },
        ];
      case 'doctor':
        return [
          { name: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
          { name: "Patients", path: "/doctor/patients", icon: Users },
          { name: "Appointments", path: "/doctor/appointments", icon: ClipboardList },
          { name: "Prescriptions", path: "/doctor/write-prescription", icon: PenTool },
          { name: "Schedule", path: "/doctor/schedule", icon: CalendarClock },
        ];
      case 'admin':
        return [
          { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Doctors", path: "/admin/doctors", icon: Users },
          { name: "Patients", path: "/admin/patients", icon: ClipboardList },
          { name: "Reports", path: "/admin/reports", icon: FilePieChart },
          { name: "Revenue", path: "/admin/revenue", icon: Wallet },
        ];
      default:
        return [];
    }
  };

  const sidebarLinks = getSidebarLinks();

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Determine current section title
  const getPageTitle = () => {
    const activeLink = sidebarLinks.find(link => location.pathname === link.path);
    return activeLink ? activeLink.name : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#111827] flex font-sans antialiased">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Promage Sticky Sidebar: Dark Charcoal background */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-[#131313] text-[#989898] z-40 flex flex-col transition-all duration-300 transform md:sticky md:translate-x-0 h-screen shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Promage Logo with Orange icon */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            {/* Orange Flower Logo Icon */}
            <div className="w-8 h-8 rounded-full bg-[#EA580C] flex items-center justify-center text-white shrink-0">
              <span className="font-extrabold text-sm">✦</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white tracking-tight font-display">
                Care<span className="text-[#EA580C] font-extrabold">Link</span>
              </span>
            )}
          </Link>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Capsule Pill Button below Logo */}
        <div className="px-4 py-5 border-b border-white/5">
          {user?.role === 'patient' && (
            <Link
              to="/patient/book"
              className={`flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-white/90 text-[#131313] font-bold rounded-full transition-all text-xs uppercase tracking-wider ${collapsed ? 'px-0' : 'px-4'}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#EA580C] flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              {!collapsed && <span>Book Slot</span>}
            </Link>
          )}
          {user?.role === 'doctor' && (
            <Link
              to="/doctor/write-prescription"
              className={`flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-white/90 text-[#131313] font-bold rounded-full transition-all text-xs uppercase tracking-wider ${collapsed ? 'px-0' : 'px-4'}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#EA580C] flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              {!collapsed && <span>Write Rx</span>}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin/doctors"
              className={`flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-white/90 text-[#131313] font-bold rounded-full transition-all text-xs uppercase tracking-wider ${collapsed ? 'px-0' : 'px-4'}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#EA580C] flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              {!collapsed && <span>Add Doctor</span>}
            </Link>
          )}
        </div>

        {/* Navigation Links: matching Promage style */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-white text-[#131313] shadow-md' 
                    : 'text-[#989898] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-[#989898] group-hover:scale-105'}`} />
                {!collapsed && <span className="truncate">{link.name}</span>}
                {!collapsed && link.name === "Medicine Cart" && cartCount > 0 && (
                  <span className="ml-auto bg-[#EA580C] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                    {cartCount}
                  </span>
                )}
                
                {/* Active Indicator Orange Dot */}
                {isActive && collapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-[#EA580C] rounded-full" />
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#131313] text-white text-xs font-semibold rounded-md shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-150 z-50 origin-left border border-white/5">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle & Logout */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2 bg-[#0d0d0d]">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center gap-3 w-full px-4 py-2.5 text-xs font-extrabold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
            {!collapsed && <span className="uppercase tracking-widest text-[10px]">Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Dashboard Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Promage Sticky Header: Warm Sand background matching container */}
        <header className="h-20 bg-[#F4F0EB] sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/50"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            {/* Header Title */}
            <h2 className="text-xl font-bold font-display text-[#111827] hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Header Search Bar matching Promage center search */}
            <div className="hidden md:flex items-center relative w-64 group">
              <span className="absolute left-3.5 text-slate-400 pointer-events-none group-focus-within:text-[#EA580C]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-white border border-[#E6E1DA] hover:border-slate-350 focus:border-[#EA580C] rounded-full text-xs font-semibold focus:outline-none transition-all"
              />
            </div>

            {/* Notifications Trigger Bell */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#E6E1DA] hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3.5 w-80 rounded-2xl bg-white border border-[#E6E1DA] shadow-xl z-50 flex flex-col py-1.5 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-4 py-2 border-b border-[#E6E1DA] flex justify-between items-center bg-[#F4F0EB]/50">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] text-[#EA580C] hover:underline font-bold bg-transparent cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#E6E1DA]">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 text-xs transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-[#EA580C]/5' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                        </div>
                        <p className="text-slate-500 mt-1 leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown matching Promage circle right pill */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1 bg-white border border-[#E6E1DA] rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left shrink-0 max-w-[100px]">
                    <span className="text-xs font-bold text-[#111827] truncate leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mt-1">{user.role}</span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3.5 w-56 rounded-2xl bg-white border border-[#E6E1DA] shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-[#E6E1DA] mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    {user.role === 'patient' && (
                      <Link to="/patient/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors">
                        <User className="w-4 h-4 text-slate-400" /> View Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-red-50 text-red-500 transition-colors text-left w-full mt-1 cursor-pointer font-bold"
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
