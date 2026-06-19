import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Loader2, Database, ShieldAlert, ArrowRight, Eye, ShoppingCart, X } from 'lucide-react';

export default function BrowseMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMedicine, setSelectedMedicine] = useState(null); // for details modal

  // Fallbacks for realistic visuals
  const mockMedicines = [
    { 
      id: "med-1", 
      name: "Paracetamol 650mg", 
      category: "Analgesic", 
      price: 4.99, 
      availability: true, 
      dosage: "Take 1 tablet every 6 hours as needed for fever or pain. Do not exceed 4 tablets in 24 hours.", 
      manufacturer: "CareLink Labs Inc.", 
      sideEffects: "Mild nausea, skin rash (rare), liver strain if taken in excess.", 
      instructions: "Keep out of reach of children. Store below 25°C in a dry place."
    },
    { 
      id: "med-2", 
      name: "Amoxicillin 500mg", 
      category: "Antibiotic", 
      price: 12.50, 
      availability: true, 
      dosage: "1 capsule three times a day for 7-10 days. Complete the entire course even if symptoms disappear.", 
      manufacturer: "BioPharma Pharmaceuticals", 
      sideEffects: "Diarrhea, stomach upset, allergic reactions.", 
      instructions: "Requires clinical doctor authorization. Do not share with others."
    },
    { 
      id: "med-3", 
      name: "Ibuprofen 400mg", 
      category: "Anti-inflammatory", 
      price: 6.20, 
      availability: true, 
      dosage: "Take 1 tablet with meals or milk every 8 hours. Max 3 tablets daily.", 
      manufacturer: "NovaHealth Diagnostics", 
      sideEffects: "Acid reflux, stomach pain, drowsiness.", 
      instructions: "Take with food. Consult a physician if history of stomach ulcers exists."
    },
    { 
      id: "med-4", 
      name: "Cetirizine 10mg", 
      category: "Antihistamine", 
      price: 5.40, 
      availability: true, 
      dosage: "Take 1 tablet once daily in the evening. May cause mild drowsiness.", 
      manufacturer: "SinoRx Formulations", 
      sideEffects: "Dry mouth, light fatigue, headache.", 
      instructions: "Avoid operating heavy machinery or driving if feeling drowsy."
    },
    { 
      id: "med-5", 
      name: "Metformin 850mg", 
      category: "Antidiabetic", 
      price: 18.00, 
      availability: true, 
      dosage: "Take 1 tablet twice daily with breakfast and dinner.", 
      manufacturer: "Zenith Lifesciences", 
      sideEffects: "Metallic taste, stomach cramps, appetite loss.", 
      instructions: "Regularly audit blood glucose indices. Keep hydrated."
    },
    { 
      id: "med-6", 
      name: "Atorvastatin 20mg", 
      category: "Cardiovascular", 
      price: 24.50, 
      availability: true, 
      dosage: "Take 1 tablet once daily at bedtime, with or without food.", 
      manufacturer: "AstraMed Care Co.", 
      sideEffects: "Muscle stiffness, joint pain, elevated liver enzymes.", 
      instructions: "Avoid drinking grapefruit juice during treatment."
    }
  ];

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await api.get('/medicines');
        if (res.data && res.data.length > 0) {
          // Merge details fallbacks into API results
          const enriched = res.data.map(med => {
            const matchesMock = mockMedicines.find(m => m.name.toLowerCase() === med.name.toLowerCase());
            return {
              ...med,
              dosage: med.dosage || matchesMock?.dosage || "Take as directed by doctor.",
              manufacturer: med.manufacturer || matchesMock?.manufacturer || "Generic Labs Ltd.",
              sideEffects: med.sideEffects || matchesMock?.sideEffects || "Consult doctor for side effects info.",
              instructions: med.instructions || matchesMock?.instructions || "Store in cool dry place."
            };
          });
          setMedicines(enriched);
        } else {
          setMedicines(mockMedicines);
        }
      } catch (err) {
        console.warn("Medicines catalog service offline, loading simulation data:", err.message);
        setMedicines(mockMedicines);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  // Filter logic
  const categories = ['All', 'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antihistamine', 'Antidiabetic', 'Cardiovascular'];
  
  const filteredMeds = medicines.filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddToCart = (med) => {
    try {
      const cart = JSON.parse(localStorage.getItem('medicine_cart') || '[]');
      const existingIdx = cart.findIndex(item => item.id === med.id || item._id === med.id || item.id === med._id);
      
      if (existingIdx > -1) {
        cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
      } else {
        cart.push({
          id: med.id || med._id,
          name: med.name,
          category: med.category,
          price: med.price,
          quantity: 1
        });
      }
      
      localStorage.setItem('medicine_cart', JSON.stringify(cart));
      toast.success(`Added ${med.name} to cart!`);
    } catch (e) {
      toast.error("Failed to add formulation to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#EA580C]" />
        <span className="text-xs font-bold text-slate-500">Querying pharmacy inventories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">Browse Medicines</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Search and purchase diagnostic formulations and healthcare supplements.</p>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white border border-[#E6E1DA] p-4 rounded-2xl shadow-xs">
        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#EA580C] text-white' 
                  : 'bg-[#F4F0EB]/60 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72 group">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-[#EA580C]">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search catalog formulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
          />
        </div>
      </div>

      {/* Grid List */}
      {filteredMeds.length === 0 ? (
        <div className="p-16 border border-dashed border-[#E6E1DA] rounded-3xl text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-3 bg-white max-w-lg mx-auto">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
          <span>No formulations match your filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMeds.map(med => (
            <div 
              key={med.id || med._id} 
              className="bg-white border border-[#E6E1DA] hover:border-[#EA580C]/40 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between gap-4 relative group"
            >
              <div className="space-y-3">
                <div className="w-full h-32 bg-[#F4F0EB] rounded-xl flex items-center justify-center border border-[#E6E1DA] relative">
                  <span className="font-extrabold text-[#EA580C] text-lg font-display uppercase">Rx</span>
                </div>
                <div>
                  <span className="text-[8px] bg-[#EA580C]/10 text-[#EA580C] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    {med.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-850 mt-2 font-display leading-tight truncate">{med.name}</h3>
                  <span className="text-base font-black text-slate-900 mt-1 block">${med.price}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E1DA] flex gap-2">
                <button
                  onClick={() => setSelectedMedicine(med)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#E6E1DA] font-bold text-[10px] rounded-xl uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={() => handleAddToCart(med)}
                  disabled={!med.availability}
                  className="flex-1 py-2 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => setSelectedMedicine(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5 text-left text-xs font-semibold text-slate-600">
              {/* Header */}
              <div className="border-b border-[#E6E1DA] pb-3.5">
                <span className="text-[9px] bg-[#EA580C]/10 text-[#EA580C] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedMedicine.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display mt-2">{selectedMedicine.name}</h3>
                <span className="text-lg font-black text-[#EA580C] mt-1.5 block">${selectedMedicine.price}</span>
              </div>

              {/* Grid lists */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Dosage Information</span>
                  <p className="text-slate-500 mt-1 leading-relaxed">{selectedMedicine.dosage}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Manufacturer</span>
                  <p className="text-slate-500 mt-1">{selectedMedicine.manufacturer}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Side Effects</span>
                  <p className="text-red-500/90 mt-1 leading-relaxed">{selectedMedicine.sideEffects}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Usage Instructions</span>
                  <p className="text-slate-500 mt-1 leading-relaxed">{selectedMedicine.instructions}</p>
                </div>
              </div>

              {/* Cart triggers */}
              <div className="pt-4 border-t border-[#E6E1DA] flex gap-3">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl uppercase tracking-wider text-center cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { handleAddToCart(selectedMedicine); setSelectedMedicine(null); }}
                  className="flex-1 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
