import React, { useState } from "react";
import { Search, Sparkles, Filter, CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { Service } from "../types";
import { getServiceImage } from "../lib/images";

interface ServicesProps {
  services: Service[];
  onBook: (item: { type: 'service' | 'package'; id: string; name: string; price: number }) => void;
}

export default function Services({ services, onBook }: ServicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "bridal") return matchesSearch && s.title.toLowerCase().includes("bridal") || s.title.toLowerCase().includes("engagement");
    if (filterType === "party") return matchesSearch && s.title.toLowerCase().includes("party") || s.title.toLowerCase().includes("glam") || s.title.toLowerCase().includes("hd");
    if (filterType === "styling") return matchesSearch && s.title.toLowerCase().includes("styling") || s.title.toLowerCase().includes("draping") || s.title.toLowerCase().includes("saree");
    
    return matchesSearch;
  });

  return (
    <div className="w-full py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Royal Directory</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2 mb-4">Our Makeup Services</h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6" />
          <p className="text-stone-500 font-light text-sm sm:text-base">
            From luxury bridal packages using elite level cosmetics to simple glamorous hairdos, explore our professional makeover directory. All pricing includes premium artist charges, tools, lashes, and prep serums.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm max-w-4xl mx-auto mb-12 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search for bridal, party, airbrush look..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-center">
            {[
              { id: "all", label: "All Services" },
              { id: "bridal", label: "Bridal / Rituals" },
              { id: "party", label: "Party / HD Glam" },
              { id: "styling", label: "Hair & Saree Styling" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition-all ${
                  filterType === tab.id
                    ? "bg-rose-500 text-white hover:opacity-90"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Showcase Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, idx) => {
              const savePercent = Math.round(((service.originalPrice - service.offerPrice) / service.originalPrice) * 100);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                  className="bg-white rounded-3xl overflow-hidden border border-rose-100/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group justify-between"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={getServiceImage(service.image)}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-stone-90 z-10 bg-stone-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
                      Professional Series
                    </div>
                    <div className="absolute top-4 right-4 bg-amber-400 text-stone-950 text-xs font-black shadow-md px-3 py-1 rounded-full">
                      -{savePercent}% OFF
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 group-hover:text-rose-500 transition-colors">
                        {service.title}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>

                    <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed mb-6 flex-grow">
                      {service.description}
                    </p>

                    <div className="space-y-2 mb-6 text-xs text-stone-600 bg-rose-50/20 p-3.5 rounded-2xl border border-rose-100/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Including Elite False Lashes (3D Silk)
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Hydrating Prep Serum & Setting Seal
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-rose-50/80 pt-4">
                      <div>
                        <span className="text-stone-400 text-xs line-through block font-light">Original: ₹{service.originalPrice.toLocaleString()}</span>
                        <span className="text-rose-500 font-extrabold text-xl">₹{service.offerPrice.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => onBook({ type: 'service', id: service.id, name: service.title, price: service.offerPrice })}
                        className="px-5 py-2.5 bg-stone-950 hover:bg-rose-500 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/50">
            <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h4 className="font-serif font-bold text-lg text-stone-800">No Services Found</h4>
            <p className="text-stone-500 text-sm font-light mt-1 max-w-sm mx-auto">
              We couldn't find matching makeups for "{searchQuery}". Try editing filters or search for 'bridal' or 'party'.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setFilterType("all"); }}
              className="mt-6 px-4 py-2 rounded-full bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-rose-400"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
