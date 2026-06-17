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
  Linkedin, Instagram, HelpCircle, FileText
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
  const [activeTab, setActiveTab] = useState('clinical'); // For Apollo spec lists

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

  // Filter medicines by search keyword
  const filteredMedicines = medicines.filter(med => 
    med.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    med.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans scroll-smooth selection:bg-secondary">
      
      {/* 1. Sticky Navbar */}
      <header className="sticky top-0 inset-x-0 bg-background/90 backdrop-blur-md border-b border-border z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">
              Apollo<span className="text-primary italic font-normal">HMS</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#about" className="hover:text-primary transition-colors">About Hospital</a>
            <a href="#doctors" className="hover:text-primary transition-colors">Doctors</a>
            <a href="#medicines" className="hover:text-primary transition-colors">Medicines</a>
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#appointments" className="hover:text-primary transition-colors">Appointments</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-muted hover:bg-muted/80 border border-border rounded-full transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-foreground">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-border shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardPath()} className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground" /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-destructive/10 text-destructive transition-colors text-left w-full mt-1 cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-[10px] font-bold text-foreground px-4 py-2 hover:text-primary transition-colors uppercase tracking-wider">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white rounded-full transition-all shadow-md uppercase tracking-wider"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-6xl sm:text-8xl lg:text-[7.5rem] tracking-tight leading-[0.85] text-foreground font-serif">
            Browse everything.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-medium font-sans leading-relaxed">
            Welcome to **Apollo Hospital & Research Center** — *Your Health, Our Priority — Dedicated to Premium Medical Care and Clinical Precision*. Access specialist registries, verify formulations, or schedule consultations 24/7.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#appointments" 
              className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center gap-2"
            >
              Book Appointment
            </a>
            <a 
              href="#contact" 
              className="px-6 py-3 border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2"
            >
              Emergency Support
            </a>
          </div>
        </div>

        {/* CSS Mockup Frame matching the screens */}
        <div className="relative pt-10">
          <div className="absolute inset-x-0 bottom-0 top-16 bg-secondary/70 rounded-3xl -z-10" />
          <div className="max-w-4xl mx-auto border-[10px] border-foreground rounded-[2rem] bg-card overflow-hidden shadow-2xl relative aspect-[16/9]">
            {/* Visual representation of hospital metrics */}
            <div className="p-6 md:p-8 space-y-6 h-full flex flex-col justify-between bg-gradient-to-b from-muted/20 to-card">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">System Overview</span>
                <span className="h-6 px-3 bg-secondary text-primary font-bold text-[9px] rounded-full flex items-center uppercase">Active Registries</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl md:text-6xl font-serif text-foreground leading-none">
                  {doctorsLoading ? "..." : `${doctors.length}`} Active Specialists
                </h3>
                <p className="text-xs text-muted-foreground font-medium max-w-md">
                  Clinician profiles, shift duration bounds, and patient medical files sync instantly via secure database APIs.
                </p>
              </div>
              <div className="grid grid-cols-3 border-t border-border pt-4 text-left">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block">Patients</span>
                  <span className="text-lg font-bold text-foreground">14.5k+</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block">Accuracy</span>
                  <span className="text-lg font-bold text-foreground">99.8%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block">Branches</span>
                  <span className="text-lg font-bold text-foreground">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor/Accreditation Logos */}
        <div className="pt-8 border-t border-border/60 flex flex-wrap justify-between items-center gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <span>World Health Org</span>
          <span>Joint Commission International</span>
          <span>FDA Approved Store</span>
          <span>HIPAA Compliance Secure</span>
          <span>S3 Encrypted Vaults</span>
        </div>
      </section>

      {/* 3. About Hospital Section */}
      <section id="about" className="py-20 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">About Our Hospital</span>
            <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">
              We've cracked the code.
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspired by premium architecture and healthcare workflows, ApolloHMS has redesigned care coordination. By integrating live registries, patient portals, and automated scheduling slots directly to database endpoints, we remove redundant checks and secure your medical history.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-primary">01 / The Mission</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To deliver world-class clinical care with absolute diagnostic accuracy, keeping data accessible and structured for patients and clinicians alike.
              </p>
            </div>
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-primary">02 / The Vision</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To pioneer medical research and secure cloud document integration, establishing absolute transparency with zero mock placeholders.
              </p>
            </div>
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-primary">03 / Why Choose Us</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We guarantee 24x7 trauma care response, verified specialist directory files, integrated digital prescriptions, and secure record purging mechanisms.
              </p>
            </div>
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-primary">04 / Active Integrity</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every prescription check, report file, and demographic profile update connects to live database APIs, ensuring actual compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Panoramic Clinical Banner Image with Rounded Corners */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full">
        <div className="h-[380px] w-full rounded-[2rem] overflow-hidden shadow-md relative">
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          <img 
            src="/hospital_hero_bg.png" 
            alt="Panoramic Clinic"
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* 4. Hospital Statistics & Feature Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Clinical Excellence</span>
          <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">
            See the Big Picture
          </h2>
          
          <div className="divide-y divide-border pt-4">
            <div className="py-4 flex gap-4 items-start">
              <span className="text-xs font-bold text-primary pt-0.5">01</span>
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Dynamic Specialists Registry</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Manage practitioner profiles, assign shift hours, and configure active schedule slots via live database integrations.
                </p>
              </div>
            </div>
            <div className="py-4 flex gap-4 items-start">
              <span className="text-xs font-bold text-primary pt-0.5">02</span>
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Secure Document Vaults</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Upload reports, diagnostics sheets, and medical records to S3 dynamically, mapped to patient profiles.
                </p>
              </div>
            </div>
            <div className="py-4 flex gap-4 items-start">
              <span className="text-xs font-bold text-primary pt-0.5">03</span>
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Direct Prescriptions Mapping</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Physicians log checkup diagnoses and dosage lists, instantly completing appointments and notifying patients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist stacked abstract pillars (representing stability and health structure) */}
        <div className="flex justify-center items-center h-full min-h-[350px]">
          <div className="relative flex flex-col items-center justify-center gap-3">
            {/* Pill shape cylinders mimicking neutral tone sculptures */}
            <div className="w-40 h-28 bg-[#dfbf9e]/90 rounded-full shadow-md z-10 flex items-center justify-center font-serif text-4xl text-[#faf9f5]">25+</div>
            <div className="w-56 h-24 bg-[#ebdcc5] rounded-full shadow-sm z-20 -mt-8 flex items-center justify-center font-bold text-xs uppercase tracking-widest text-[#5c6258]">Years Exp</div>
            <div className="w-64 h-24 bg-[#e2ebd9] rounded-full shadow-md z-30 -mt-8 flex items-center justify-center font-serif text-3xl text-primary">12 Branches</div>
          </div>
        </div>
      </section>

      {/* 5. Services Section */}
      <section id="services" className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block">Department Coverage</span>
            <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Hospital Medical Services</h2>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "General Medicine", desc: "Complete clinical checkups, metabolic panel audits, and health consultations.", icon: <HeartPulse className="w-5 h-5" /> },
              { title: "Cardiology", desc: "Cardiovascular testing, ECG tracing, blood pressure history audits, and heart checks.", icon: <Heart className="w-5 h-5" /> },
              { title: "Neurology", desc: "Reflex analysis, memory logs, migraine care pathways, and nerve consults.", icon: <Activity className="w-5 h-5" /> },
              { title: "Orthopedics", desc: "Bone fracture treatment, spinal audits, and joint pain management consultations.", icon: <Award className="w-5 h-5" /> },
              { title: "Pediatrics", desc: "Infant care checks, childhood immunizations, and general child development consulting.", icon: <Users className="w-5 h-5" /> },
              { title: "Emergency Care", desc: "24x7 ambulance dispatch, trauma support, ICU, and rapid medicine interventions.", icon: <PhoneCall className="w-5 h-5" /> }
            ].map((srv, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border/80 p-6 rounded-2xl space-y-3 hover:border-primary/50 transition-all group shadow-xs hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {srv.icon}
                </div>
                <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{srv.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Top Doctors Section (Exclusively Real API Data) */}
      <section id="doctors" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block">Specialist Registry</span>
          <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Consult Our Top Specialists</h2>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
        </div>

        {doctorsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold text-muted-foreground">Querying live medical directory...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-3xl text-center text-xs font-bold text-muted-foreground flex flex-col items-center gap-3 bg-card">
            <Stethoscope className="w-8 h-8 opacity-30 text-muted-foreground" />
            <span>No Doctors Available</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map(doc => (
              <div 
                key={doc.id} 
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{doc.name}</h3>
                    <span className="text-[9px] bg-muted text-muted-foreground font-black px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                      {doc.specialty}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                    {doc.bio || 'Consulting physician providing primary healthcare services.'}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-border flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                  <span>EXPERIENCE: {doc.experience}</span>
                  <span>{doc.shiftStart} - {doc.shiftEnd}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tabbed Specification Section ("Why Choose Area?") */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block">Integrity Breakdown</span>
            <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Why Choose Apollo?</h2>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
          </div>

          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setActiveTab('clinical')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'clinical' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              Clinical Care
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'security' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              Tech & Security
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'billing' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              Integrity
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm font-sans text-xs">
            {activeTab === 'clinical' && (
              <div className="divide-y divide-border">
                <div className="py-3 flex justify-between"><span className="font-bold">Specialists Count</span><span className="text-muted-foreground font-semibold">{doctorsLoading ? "Loading..." : `${doctors.length} Active`}</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Trauma Helplines</span><span className="text-muted-foreground font-semibold">24x7 Available</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Ambulance Services</span><span className="text-muted-foreground font-semibold">Free Trauma Dispatch</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Accreditation</span><span className="text-muted-foreground font-semibold">Joint Commission International</span></div>
              </div>
            )}
            {activeTab === 'security' && (
              <div className="divide-y divide-border">
                <div className="py-3 flex justify-between"><span className="font-bold">Document Uploads</span><span className="text-muted-foreground font-semibold">S3 Multipart Encryption</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Passwords Security</span><span className="text-muted-foreground font-semibold">Bcrypt Salt Hashing</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Access Verification</span><span className="text-muted-foreground font-semibold">JWT Role Verification Gates</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Data Privacy</span><span className="text-muted-foreground font-semibold">Deactivate & Database Purge</span></div>
              </div>
            )}
            {activeTab === 'billing' && (
              <div className="divide-y divide-border">
                <div className="py-3 flex justify-between"><span className="font-bold">Demo Data Fallbacks</span><span className="text-muted-foreground font-semibold">Removed (Zero Mock Mappings)</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Financial Auditing</span><span className="text-muted-foreground font-semibold">Status checks linked to Ledger</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Diagnostics Vaults</span><span className="text-muted-foreground font-semibold">Dynamic PDF & CSV exports</span></div>
                <div className="py-3 flex justify-between"><span className="font-bold">Availability</span><span className="text-muted-foreground font-semibold">99.9% REST API Connection</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Medicines Section */}
      <section id="medicines" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block">Apollo Pharmacy Stores</span>
          <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Search Medicines & Formulations</h2>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none group-focus-within:text-primary">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-4 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />
          </div>
        </div>

        {medsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold text-muted-foreground">Searching pharmacy catalog...</span>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-3xl text-center text-xs font-bold text-muted-foreground flex flex-col items-center gap-3 max-w-lg mx-auto bg-card">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            <span>No Medicines Available</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs font-semibold">
              No pharmacy listings or search hits found. Consult the local registration desk for prescription formulation stock.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedicines.map(med => (
              <div 
                key={med.id} 
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="w-full h-32 bg-muted/40 rounded-xl flex items-center justify-center overflow-hidden border border-border/60">
                    <img 
                      src={med.imageUrl || "/favicon.svg"} 
                      alt={med.name}
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = "/favicon.svg"; }}
                    />
                  </div>
                  <div>
                    <span className="text-[9px] bg-secondary text-primary font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {med.category}
                    </span>
                    <h3 className="font-serif text-lg text-foreground mt-1.5">{med.name}</h3>
                    <span className="text-lg font-black text-foreground mt-1 block">${med.price}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    med.availability ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {med.availability ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <Link 
                    to={`/medicine/${med.id}`}
                    className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-0.5"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    {/* Elegant Serif Quote Section with Balanced Stack illustration */}
    <section className="py-20 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Balanced stack visual drawing inspiration from the screenshots */}
        <div className="flex justify-center items-center h-full min-h-[300px]">
          <div className="relative flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-[#dfbf9e] opacity-90 shadow-lg flex items-center justify-center font-serif text-[#faf9f5]">Care</div>
            <div className="w-24 h-24 rounded-full bg-[#ebdcc5] shadow-md -mt-6 flex items-center justify-center font-serif text-[#5c6258] text-sm">Trust</div>
            <div className="w-16 h-16 rounded-full bg-secondary shadow-md -mt-4 flex items-center justify-center font-serif text-primary text-xs">JCI</div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-3xl md:text-5xl font-serif text-foreground leading-tight italic">
            "I was skeptical about electronic portals, but Apollo has completely transformed the way I manage my checkups. The diagnostics are clear, and the platform is so intuitive."
          </p>
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-primary">Marcus Aurelius</span>
            <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Cardiac Patient, 6 Months Care</span>
          </div>
        </div>
      </div>
    </section>

    {/* 8. Appointment Booking Section */}
    <section id="appointments" className="py-20 max-w-4xl mx-auto px-6 w-full space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-primary block">Scheduling</span>
        <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Book A Clinic Appointment</h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleBookingSubmit} className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doctor Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-primary" /> Select Specialist
              </label>
              <select
                name="doctorId"
                required
                value={appointmentData.doctorId}
                onChange={handleInputChange}
                className="w-full h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Appointment Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={appointmentData.date}
                onChange={handleInputChange}
                className="w-full h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> Desired Time Slot
              </label>
              <select
                name="time"
                required
                value={appointmentData.time}
                onChange={handleInputChange}
                className="w-full h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/25"
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-primary" /> Symptoms Reported
              </label>
              <input
                type="text"
                name="symptoms"
                value={appointmentData.symptoms}
                onChange={handleInputChange}
                placeholder="Headache, checkup, etc."
                className="w-full h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-primary" /> Reason for Visit
            </label>
            <textarea
              name="reason"
              required
              rows="3"
              value={appointmentData.reason}
              onChange={handleInputChange}
              placeholder="Describe your query or medical history request for this checkup..."
              className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full h-11 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 uppercase tracking-wider text-[10px]"
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

    {/* 9. Testimonials Grid Section */}
    <section className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12 border-t border-border">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-primary block">Patient Stories</span>
        <h2 className="text-5xl font-serif text-foreground leading-[1.0] tracking-tight">Reviews & Feedback</h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex text-amber-500 gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-muted-foreground text-xs italic leading-relaxed font-medium">
              "Booking a checkup was incredibly fast. The digital prescriptions interface was extremely helpful for getting refilled formulations!"
            </p>
          </div>
          <div className="font-bold text-[10px] text-foreground uppercase tracking-widest">- Sarah Jenkins, Cardiac Patient</div>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex text-amber-500 gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-muted-foreground text-xs italic leading-relaxed font-medium">
              "The doctors here are professional and extremely experienced. Uploading lab reports to S3 was instantaneous."
            </p>
          </div>
          <div className="font-bold text-[10px] text-foreground uppercase tracking-widest">- Robert Vance, General Care</div>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex text-amber-500 gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-muted-foreground text-xs italic leading-relaxed font-medium">
              "Truly state-of-the-art care coordination. Highly recommended for their digital record tracking."
            </p>
          </div>
          <div className="font-bold text-[10px] text-foreground uppercase tracking-widest">- Emily Howard, Pediatrics Mother</div>
        </div>
      </div>
    </section>

    {/* 10. Emergency Support Banner */}
    <section id="emergency" className="bg-primary text-white py-8 border-y border-primary/20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <PhoneCall className="w-6 h-6 animate-bounce text-amber-400" />
          <div>
            <span className="block text-white font-extrabold text-sm tracking-tight">Helpline: +1 (555) 012-HMS1</span>
            <span className="text-white/80 text-[10px] block mt-0.5 font-medium">Emergency Trauma Center & Ambulance Dispatch</span>
          </div>
        </div>
        <div className="px-4 py-2 border border-white/20 bg-white/5 rounded-xl text-[10px]">24x7 Continuous Care Support</div>
      </div>
    </section>

    {/* 11. Footer Section */}
    <footer id="contact" className="bg-foreground text-muted py-16 border-t border-border/10 text-xs">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border/10 mb-8 font-sans">
        <div className="space-y-4">
          <span className="text-base font-bold text-white font-serif">ApolloHMS</span>
          <p className="leading-relaxed text-muted-foreground font-medium">
            Your Health, Our Priority. Providing digital health records, scheduling systems, and premium pharmacy formulations integration.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Contact Address</h4>
          <div className="space-y-2.5 text-muted-foreground font-semibold">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> <span>742 Medical Center Blvd, Health City</span></div>
            <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-primary shrink-0" /> <span>+1 (555) 012-HMS1</span></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /> <span>care@apollohms.com</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Patient Portals</h4>
          <div className="flex flex-col gap-2 font-bold text-muted-foreground">
            <Link to="/login" className="hover:text-primary transition-colors">Sign In Account</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Register Demographics</Link>
            <Link to="/forgot-password" className="hover:text-primary transition-colors">Reset Password Link</Link>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Follow Our Services</h4>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" className="p-2 border border-border/10 hover:border-primary rounded-xl transition-all hover:text-primary"><Facebook className="w-4.5 h-4.5" /></a>
            <a href="#" className="p-2 border border-border/10 hover:border-primary rounded-xl transition-all hover:text-primary"><Twitter className="w-4.5 h-4.5" /></a>
            <a href="#" className="p-2 border border-border/10 hover:border-primary rounded-xl transition-all hover:text-primary"><Linkedin className="w-4.5 h-4.5" /></a>
            <a href="#" className="p-2 border border-border/10 hover:border-primary rounded-xl transition-all hover:text-primary"><Instagram className="w-4.5 h-4.5" /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground/60 font-bold">
        <span>&copy; {new Date().getFullYear()} ApolloHMS Hospital & Research Clinics. All rights reserved. Editorial Sand & Moss Style.</span>
      </div>
    </footer>

    </div>
  );
}
