import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';
import { 
  Activity, HeartPulse, User, PhoneCall, LogOut, ChevronDown, 
  MapPin, Mail, Loader2, ArrowRight, ShieldCheck, Stethoscope,
  Users, Award, ShieldAlert, Star, Search, Calendar, Clock, 
  ClipboardList, Heart, Sparkles, Building2, Facebook, Twitter, 
  Linkedin, Instagram, HelpCircle, FileText, Play, CheckCircle2, ChevronRight,
  Shield, Key, Clipboard, ChevronUp, Stethoscope as StethIcon, Database, Layers
} from 'lucide-react';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State managers
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  
  const [medicines, setMedicines] = useState([]);
  const [medsLoading, setMedsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Appointment Form State
  const [bookingLoading, setBookingLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    date: '',
    time: '09:00 AM',
    reason: '',
    symptoms: ''
  });

  // Fetch doctors and medicines
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err.message);
      } finally {
        setDoctorsLoading(false);
      }
    };

    const fetchMedicines = async () => {
      try {
        const res = await api.get('/medicines');
        setMedicines(res.data || []);
      } catch (err) {
        console.warn("Medicines API offline or unavailable:", err.message);
        setMedicines([]);
      } finally {
        setMedsLoading(false);
      }
    };

    fetchDoctors();
    fetchMedicines();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully!");
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  // Handle Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to your patient account to book an appointment.");
      navigate('/login');
      return;
    }

    if (user.role !== 'patient') {
      toast.error("Only registered patient accounts can book appointments.");
      return;
    }

    if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.reason) {
      toast.error("Please fill in all booking fields.");
      return;
    }

    setBookingLoading(true);
    const bookToastId = toast.loading("Scheduling checkup slot...");

    try {
      await api.post('/appointments', {
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms || appointmentData.reason
      });
      
      toast.success("Appointment scheduled successfully! Review in dashboard.", { id: bookToastId });
      setAppointmentData({
        doctorId: '',
        date: '',
        time: '09:00 AM',
        reason: '',
        symptoms: ''
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to schedule appointment.", { id: bookToastId });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  // Fallbacks for offline database / empty states to maintain premium visuals
  const displayDoctors = doctors.length > 0 ? doctors : [
    { id: "doc-1", name: "Dr. Sarah Jenkins", specialty: "Cardiologist", experience: "12 Years", bio: "Board-certified cardiologist specializing in cardiovascular health and preventative care.", shiftStart: "09:00 AM", shiftEnd: "05:00 PM" },
    { id: "doc-2", name: "Dr. Gregory House", specialty: "Diagnostics & Neurology", experience: "15 Years", bio: "Renowned diagnostician specializing in infectious diseases and complex neurological queries.", shiftStart: "10:00 AM", shiftEnd: "06:00 PM" },
    { id: "doc-3", name: "Dr. Clara Oswald", specialty: "Pediatrics & Medicine", experience: "8 Years", bio: "Dedicated pediatrician offering compassionate general care and health checks for children.", shiftStart: "09:00 AM", shiftEnd: "04:00 PM" },
    { id: "doc-4", name: "Dr. Stephen Strange", specialty: "Neurosurgeon", experience: "14 Years", bio: "Leading neurosurgeon specializing in complex neurological and brain tissue consultations.", shiftStart: "08:00 AM", shiftEnd: "03:00 PM" }
  ];

  const displayMedicines = medicines.length > 0 ? medicines : [
    { id: "med-1", name: "Paracetamol 650mg", category: "Analgesic", price: 4.99, availability: true, imageUrl: "" },
    { id: "med-2", name: "Amoxicillin 500mg", category: "Antibiotic", price: 12.50, availability: true, imageUrl: "" },
    { id: "med-3", name: "Ibuprofen 400mg", category: "Anti-inflammatory", price: 6.20, availability: true, imageUrl: "" },
    { id: "med-4", name: "Cetirizine 10mg", category: "Antihistamine", price: 5.40, availability: true, imageUrl: "" }
  ];

  // Filter medicines by search keyword
  const filteredMedicines = displayMedicines.filter(med => 
    med.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    med.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    { q: "How do I schedule an appointment with a specialist?", a: "You can book directly using our online booking panel. Simply register or log in as a patient, select your preferred doctor, pick an available date and time slot, and submit the request. Your scheduled consultation will immediately appear in your Patient Dashboard." },
    { q: "Are my electronic medical records secure?", a: "Yes, absolutely. We enforce strict end-to-end security protocols for digital patient histories, clinical files, and diagnostics reports. Only authenticated clinical specialists and authorized administrators have permission to review medical files." },
    { q: "Can I manage and view my prescriptions online?", a: "Definitely. After your diagnostic consultation, your physician writes and uploads the prescription details directly to the HMS system. You can view, search, and verify formulation logs in your dashboard." },
    { q: "How are administrative audits and billing settled?", a: "Administrators coordinate daily invoice settlements, department lists, and clinical report metrics inside the Admin Dashboard. Patients can audit invoice histories, payment receipts, and balance sheets dynamically." }
  ];

  return (
    <div className="bg-[#F4F0EB] text-[#111827] min-h-screen flex flex-col font-sans scroll-smooth selection:bg-[#EA580C]/20">
      
      {/* 1. TOP HEADER INFORMATION BAR */}
      <div className="bg-[#111827] text-white/80 text-[11px] py-3 border-b border-white/5 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center font-medium">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-[#EA580C]" /> +1 (234) 567 890
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#EA580C]" /> support@carelink.com
            </span>
          </div>
          <span className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#EA580C]" /> 123 Health Avenue, Medical District, NY
          </span>
        </div>
      </div>

      {/* 2. STICKY NAVBAR (GLASSMORPHISM) */}
      <header className="sticky top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-[#E6E1DA] z-50 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shadow-md shadow-[#EA580C]/35 shrink-0 transition-transform group-hover:scale-105">
              <span className="font-extrabold text-lg">✦</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] font-display">
              Care<span className="text-[#EA580C] font-extrabold">Link</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-[#EA580C] transition-colors">Home</a>
            <a href="#services" className="hover:text-[#EA580C] transition-colors">Services</a>
            <a href="#features" className="hover:text-[#EA580C] transition-colors">Features</a>
            <a href="#doctors" className="hover:text-[#EA580C] transition-colors">Doctors</a>
            <a href="#medicines" className="hover:text-[#EA580C] transition-colors">Pharmacy</a>
            <a href="#appointments" className="hover:text-[#EA580C] transition-colors">Appointments</a>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 bg-white border border-[#E6E1DA] hover:bg-[#F4F0EB]/50 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white border border-[#E6E1DA] shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardPath()} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors">
                      <Activity className="w-4.5 h-4.5 text-slate-400" /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-red-50 text-red-500 transition-colors text-left w-full mt-1 cursor-pointer font-bold"
                    >
                      <LogOut className="w-4.5 h-4.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-[11px] font-extrabold text-slate-600 px-4 py-2 hover:text-[#EA580C] transition-colors uppercase tracking-widest">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 text-[11px] font-bold bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-xl transition-all shadow-md shadow-[#EA580C]/25 uppercase tracking-wider font-display"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative py-20 lg:py-28 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column Description */}
        <div className="lg:col-span-6 space-y-6 text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#EA580C]/35 bg-[#EA580C]/5 text-[#EA580C] text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Verified Medical Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] tracking-tight leading-[1.08] text-[#111827] font-extrabold font-display">
            We Are Here To <br />
            <span className="text-[#EA580C] bg-gradient-to-r from-[#EA580C] to-red-500 bg-clip-text text-transparent">Hear And Heal</span> <br />
            Your Health Problems
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl font-medium leading-relaxed">
            Welcome to CareLink — a premium hospital ecosystem matching specialist doctors, medical histories, and digital records seamlessly under one light theme dashboard portal.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#appointments" 
              className="px-8 py-3.5 bg-[#EA580C] hover:bg-[#EA580C]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#EA580C]/25 transition-all flex items-center gap-2 cursor-pointer font-display"
            >
              Book Appointment <ArrowRight className="w-4 h-4" />
            </a>
            {!user && (
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="px-6 py-3.5 border border-[#E6E1DA] bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-3.5 border border-[#E6E1DA] bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column Custom Premium UI Grid Representation (Glassmorphism Mockup) */}
        <div className="lg:col-span-6 relative w-full flex justify-center items-center">
          <div className="absolute inset-0 bg-[#EA580C]/10 rounded-full blur-[140px] pointer-events-none" />
          
          {/* Dashboard Preview Wrapper */}
          <div className="relative w-full max-w-lg aspect-square bg-white border border-[#E6E1DA] rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-[#EA580C]/35 transition-all duration-300">
            {/* Top Row: User / Doctor pill */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-sm">
                  Dr
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-800">Dr. Sarah Jenkins</h4>
                  <span className="text-[9px] text-slate-400 font-black uppercase">Cardiology Expert</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#EA580C]/5 border border-[#EA580C]/20 text-[9px] font-black text-[#EA580C] uppercase tracking-wider">
                Online
              </div>
            </div>

            {/* Middle Row: Heart rate SVG and metrics */}
            <div className="my-5 flex-1 flex flex-col justify-center gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F4F0EB] p-3 rounded-xl border border-[#E6E1DA] text-left">
                  <span className="text-[8px] text-slate-400 font-black uppercase">Oxygen</span>
                  <span className="block text-sm font-black text-slate-850 mt-1">98%</span>
                </div>
                <div className="bg-[#F4F0EB] p-3 rounded-xl border border-[#E6E1DA] text-left">
                  <span className="text-[8px] text-slate-400 font-black uppercase">Heart Rate</span>
                  <span className="block text-sm font-black text-slate-850 mt-1">72 bpm</span>
                </div>
                <div className="bg-[#F4F0EB] p-3 rounded-xl border border-[#E6E1DA] text-left">
                  <span className="text-[8px] text-slate-400 font-black uppercase">Blood Temp</span>
                  <span className="block text-sm font-black text-slate-850 mt-1">98.6°F</span>
                </div>
              </div>

              {/* Heart Pulse Chart Visualizer */}
              <div className="h-24 bg-[#111827] rounded-xl flex items-center justify-center relative p-3 border border-white/5 overflow-hidden">
                <div className="absolute top-2.5 left-3 text-[8px] font-black text-white/40 uppercase tracking-widest">ECG Signal Monitoring</div>
                {/* SVG waveform representing health signal */}
                <svg className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="2" viewBox="0 0 100 40">
                  <path d="M 0,20 L 20,20 L 25,10 L 30,30 L 35,20 L 50,20 L 53,5 L 57,35 L 61,20 L 80,20 L 85,10 L 90,20 L 100,20" />
                </svg>
              </div>
            </div>

            {/* Bottom Row: Pill details and notifications count */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" /> HIPAA Compliant Portal
              </span>
              <span>Checked: Today at 04:30 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-20 bg-white border-y border-[#E6E1DA]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Section title */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Clinics & Departments</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We offer a complete suite of professional medical solutions, clinical checkups, and record tracking.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "General Consultation", desc: "Access primary medical consults, diagnostic checkups, and wellness recommendations.", icon: HeartPulse },
              { title: "Specialist Doctors", desc: "Schedule visits with cardiologists, pediatricians, and expert clinical surgeons.", icon: StethIcon },
              { title: "Diagnostics", desc: "Search detailed pathology reports, blood panels, and clinical diagnostic histories.", icon: Activity },
              { title: "Emergency Care", desc: "Continuous ambulance dispatch, critical trauma coordinates, and rapid clinical care.", icon: PhoneCall },
              { title: "Digital Records", desc: "View clinical prescriptions, billing invoices, and secure electronic health reports.", icon: FileText }
            ].map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-[#F4F0EB]/60 border border-[#E6E1DA] hover:border-[#EA580C]/40 p-6 rounded-2xl transition-all group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4 text-left">
                    <div className="w-11 h-11 rounded-xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold">
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="font-bold text-base text-[#111827] group-hover:text-[#EA580C] transition-colors font-display leading-tight">{srv.title}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{srv.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#E6E1DA] text-left">
                    <a href="#appointments" className="text-[10px] font-extrabold text-[#EA580C] flex items-center gap-1 hover:underline uppercase tracking-wider">
                      Request Slot <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Platform Utilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">
              Advanced Clinical Portal Features
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Explore the customized systems that make patient care coordination fluid and completely secure.
            </p>
          </div>

          {/* Interactive Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { title: "Online Appointments", desc: "Browse schedules, select medical experts, and coordinate checkup slots directly on the frontend.", icon: Calendar, badge: "Patient" },
              { title: "Patient Dashboard", desc: "Access current profiles, diagnostic trends, prescription lists, and medical history trackers.", icon: User, badge: "Patient" },
              { title: "Doctor Dashboard", desc: "Manage patient files, configure checking shift ranges, and compile diagnostics indices.", icon: Stethoscope, badge: "Doctor" },
              { title: "Secure Medical Records", desc: "Ensure secure record management and clinical reviews under encrypted file frameworks.", icon: Shield, badge: "Security" },
              { title: "Prescription Management", desc: "Physicians formulate clinical prescriptions directly, enabling patient overview indices.", icon: FileText, badge: "Clinical" },
              { title: "Pharmacy Directory", desc: "Search database formulation inventories, categories, pricing guidelines, and stock indications.", icon: Database, badge: "Pharmacy" }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-[#E6E1DA] hover:border-[#EA580C]/35 rounded-2xl p-6.5 shadow-sm transition-all duration-300 relative overflow-hidden group hover:translate-y-[-2px]"
                >
                  <div className="absolute top-4 right-4 text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F4F0EB] text-slate-450 border border-[#E6E1DA]">
                    {feat.badge}
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold mb-4">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-850 font-display">{feat.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DOCTOR SHOWCASE SECTION */}
      <section id="doctors" className="py-20 bg-white border-y border-[#E6E1DA]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Specialist Registry</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">
              Meet Our Specialist Doctors
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Consult with certified clinical specialists tailored to your specific pathology queries.
            </p>
          </div>

          {/* Cards Grid */}
          {doctorsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
              <span className="text-xs font-bold text-slate-500">Querying live medical directory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayDoctors.map(doc => (
                <div 
                  key={doc.id || doc._id} 
                  className="bg-[#F4F0EB]/40 border border-[#E6E1DA] rounded-2xl p-5 hover:border-[#EA580C]/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group text-left"
                >
                  <div className="space-y-4">
                    {/* Placeholder doctor graphic representation */}
                    <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden border border-[#E6E1DA] relative group">
                      <div className="absolute inset-0 bg-[#EA580C]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl font-display">
                        {doc.name.replace("Dr. ", "").charAt(0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] bg-[#EA580C]/10 text-[#EA580C] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        {doc.specialty}
                      </span>
                      <h3 className="font-bold text-lg text-slate-850 mt-2 font-display">{doc.name}</h3>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-semibold">
                      {doc.bio || 'Consulting physician providing primary healthcare services.'}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-[#E6E1DA] flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#EA580C]" /> {doc.experience}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#EA580C]" /> {doc.shiftStart || '09:00 AM'} - {doc.shiftEnd || '05:00 PM'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. INTERACTIVE BOOKING FORM PANEL */}
      <section id="appointments" className="py-20 max-w-4xl mx-auto px-6 w-full space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Scheduling</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">Book A Clinic Appointment</h2>
          <div className="w-12 h-0.5 bg-[#EA580C] mx-auto mt-2" />
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 md:p-8 shadow-md">
          <form onSubmit={handleBookingSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Doctor Selection */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <StethIcon className="w-3.5 h-3.5 text-[#EA580C]" /> Select Specialist
                </label>
                <select
                  name="doctorId"
                  required
                  value={appointmentData.doctorId}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                >
                  <option value="">Choose a doctor...</option>
                  {displayDoctors.map(doc => (
                    <option key={doc.id || doc._id} value={doc.id || doc._id}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#EA580C]" /> Appointment Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={appointmentData.date}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 cursor-pointer"
                />
              </div>

              {/* Time */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#EA580C]" /> Desired Time Slot
                </label>
                <select
                  name="time"
                  required
                  value={appointmentData.time}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              {/* Symptoms */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <Clipboard className="w-3.5 h-3.5 text-[#EA580C]" /> Symptoms Reported
                </label>
                <input
                  type="text"
                  name="symptoms"
                  value={appointmentData.symptoms}
                  onChange={handleInputChange}
                  placeholder="Headache, checkup, etc."
                  className="w-full h-11 px-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                />
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-[#EA580C]" /> Reason for Visit
              </label>
              <textarea
                name="reason"
                required
                rows="3"
                value={appointmentData.reason}
                onChange={handleInputChange}
                placeholder="Describe your query or medical history request for this checkup..."
                className="w-full p-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl transition-all shadow-md shadow-[#EA580C]/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 uppercase tracking-wider text-[10px] font-display mt-4"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                </>
              ) : (
                "Confirm Appointment Slot"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* 8. PHARMACY CATALOG SEARCH SECTION */}
      <section id="medicines" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-10 border-t border-[#E6E1DA]">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">HMS Pharmacy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">Search Medicines & Formulations</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">Browse formulations availability, categories, and stock checklists.</p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-[#EA580C]">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#E6E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
            />
          </div>
        </div>

        {medsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
            <span className="text-xs font-bold text-slate-500">Searching pharmacy catalog...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedicines.map(med => (
              <div 
                key={med.id || med._id} 
                className="bg-white border border-[#E6E1DA] hover:border-[#EA580C]/40 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between gap-4 text-left"
              >
                <div className="space-y-3.5">
                  <div className="w-full h-36 bg-[#F4F0EB] rounded-xl flex items-center justify-center overflow-hidden border border-[#E6E1DA]">
                    <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-base">
                      Rx
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] bg-[#EA580C]/10 text-[#EA580C] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {med.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-855 mt-2 font-display">{med.name}</h3>
                    <span className="text-base font-black text-slate-900 mt-1 block">${med.price}</span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#E6E1DA] flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    med.availability ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {med.availability ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <Link 
                    to={`/medicine/${med.id || med._id}`}
                    className="text-[10px] font-bold text-[#EA580C] hover:text-[#EA580C]/80 transition-colors uppercase tracking-wider flex items-center gap-0.5 font-display"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 9. STATISTICS SECTION */}
      <section className="py-16 bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black font-display text-[#EA580C]">25k+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Patients Served</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black font-display text-[#EA580C]">100+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Doctors Available</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black font-display text-[#EA580C]">50k+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Appointments Completed</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black font-display text-[#EA580C]">12+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Clinical Departments</span>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS SECTION */}
      <section className="py-20 bg-white border-b border-[#E6E1DA]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Patient Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">
              Hear From Those Who Trust CareLink
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Read review records submitted regarding our digital portal coordination and clinical staff.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Booking slot consultations was exceptionally simple. The digital prescription indexes are a game-changer for monitoring active treatment charts.", user: "Arthur Pendragon", role: "Cardiac Consult Case" },
              { text: "My medical diagnostics reports loaded dynamically on the dashboard. I was able to print them with zero loading lag. Extremely premium product.", user: "Bruce Wayne", role: "Neurological Patient" },
              { text: "The practitioner interface is secure. I can manage emergency contact data and scheduling histories under one unified account.", user: "Selina Kyle", role: "Pediatrics Case" }
            ].map((test, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-[#F4F0EB]/50 border border-[#E6E1DA] rounded-2xl flex flex-col justify-between gap-5 text-left"
              >
                <div className="space-y-3">
                  <div className="flex text-[#EA580C] gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#EA580C]" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed font-semibold">
                    "{test.text}"
                  </p>
                </div>
                <div className="border-t border-[#E6E1DA] pt-4 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-xs text-[#111827] font-display">{test.user}</span>
                    <span className="block text-[8px] uppercase font-black text-slate-400 tracking-wider mt-0.5">{test.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-[10px]">
                    {test.user.charAt(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION (INTERACTIVE ACCORDION) */}
      <section className="py-20 max-w-4xl mx-auto px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">General Assistance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] font-display">Frequently Asked Questions</h2>
          <div className="w-12 h-0.5 bg-[#EA580C] mx-auto mt-2" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden transition-all text-left"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors font-bold text-xs sm:text-sm text-[#111827] font-display cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#EA580C]" /> : <ChevronDown className="w-4 h-4 text-[#EA580C]" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. EMERGENCY SUPPORT HELPLINE BANNER */}
      <section className="bg-[#EA580C] text-white py-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-wider text-left">
          <div className="flex items-center gap-4">
            <PhoneCall className="w-6 h-6 animate-bounce text-white shrink-0" />
            <div>
              <span className="block text-white font-extrabold text-sm tracking-tight">Emergency Helpline: +1 (234) 567 890</span>
              <span className="text-white/80 text-[10px] block mt-1 font-medium font-sans uppercase">Trauma response and continuous critical care coordinating.</span>
            </div>
          </div>
          <a href="tel:+1234567890" className="px-5 py-3 border border-white/20 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[10px] font-display uppercase tracking-widest text-white">
            Call Dispatch
          </a>
        </div>
      </section>

      {/* 13. PROFESSIONAL FOOTER */}
      <footer className="bg-[#111827] text-white/70 py-16 border-t border-white/5 text-xs text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5 mb-8 font-sans">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <span className="text-lg font-bold text-white font-display flex items-center gap-2">
              <span className="text-[#EA580C] font-extrabold text-xl">✦</span> CareLink
            </span>
            <p className="leading-relaxed text-slate-400 font-semibold">
              Premium Hospital Management System offering online scheduling, secure patient diagnostic files, and real-time pharmacy catalogs.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Contact Info</h4>
            <div className="space-y-3 text-slate-400 font-semibold">
              <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-[#EA580C] shrink-0" /> <span>123 Health Ave, Medical City, NY</span></div>
              <div className="flex items-center gap-2.5"><PhoneCall className="w-4 h-4 text-[#EA580C] shrink-0" /> <span>+1 (234) 567 890</span></div>
              <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-[#EA580C] shrink-0" /> <span>support@carelink.com</span></div>
            </div>
          </div>

          {/* Services Quicklinks */}
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Hospital Services</h4>
            <div className="flex flex-col gap-2 font-bold text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">General Consultation</a>
              <a href="#services" className="hover:text-white transition-colors">Specialist Doctors</a>
              <a href="#services" className="hover:text-white transition-colors">Diagnostics & Pathology</a>
              <a href="#services" className="hover:text-white transition-colors">Emergency Care Units</a>
            </div>
          </div>

          {/* Portal Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Portal Access</h4>
            <div className="flex flex-col gap-2 font-bold text-slate-400">
              <Link to="/login" className="hover:text-white transition-colors">Sign In Portal</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register Patient</Link>
              <Link to="/forgot-password" className="hover:text-white transition-colors">Reset Password</Link>
              <a href="#appointments" className="hover:text-white transition-colors">Book Consultations</a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & socials */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <span>&copy; {new Date().getFullYear()} CareLink Hospital Management. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
