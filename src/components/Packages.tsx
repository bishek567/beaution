import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Flame, Gift, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Package } from "../types";

interface PackagesProps {
  packages: Package[];
  onBook: (item: { type: 'service' | 'package'; id: string; name: string; price: number }) => void;
}

export default function Packages({ packages, onBook }: PackagesProps) {
  // Countdown Timer state (e.g. Set target relative to render date)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let sec = prev.seconds - 1;
        let min = prev.minutes;
        let hr = prev.hours;

        if (sec < 0) {
          sec = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          hr -= 1;
        }
        if (hr < 0) {
          // Reset countdown timer once expired to keep visual intact
          hr = 12;
          min = 0;
          sec = 0;
        }

        return { hours: hr, minutes: min, seconds: sec };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Map package ids to premium colors for luxury layout
  const themeColors: { [key: string]: { bg: string, border: string, text: string, button: string } } = {
    p1: { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-800", button: "bg-stone-900 text-white hover:bg-stone-800" },
    p2: { bg: "bg-white", border: "border-rose-100", text: "text-rose-600", button: "bg-rose-500 text-white hover:bg-rose-600" },
    p3: { bg: "bg-gradient-to-b from-amber-500/5 to-rose-50/20", border: "border-amber-400", text: "text-amber-600", button: "bg-amber-500 text-stone-950 hover:bg-amber-600 font-extrabold" },
    p4: { bg: "bg-stone-900 text-white", border: "border-stone-800 shadow-2xl", text: "text-amber-400", button: "bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 hover:opacity-90 font-bold" }
  };

  const getTheme = (id: string) => themeColors[id] || { bg: "bg-white", border: "border-stone-200", text: "text-stone-800", button: "bg-stone-900 text-white" };

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Urgent Countdown Timer Block */}
        <div className="bg-stone-950 text-white rounded-3xl p-8 sm:p-12 mb-20 relative overflow-hidden shadow-xl border border-stone-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-lg text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4">
                <Flame className="w-3.5 h-3.5" /> Special Promotional Rates
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-4">
                Luxury Combination Packs expiring shortly
              </h2>
              <p className="text-stone-400 text-sm font-light">
                Secure your slot today with our special package deals. Our countdown timer denotes remaining validity hours for online pre-payment discount locks.
              </p>
            </div>

            {/* Countdown Display Panels */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-900 rounded-2xl flex items-center justify-center border border-stone-800 shadow-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-stone-400 mt-2 uppercase tracking-widest font-semibold">Hours</span>
              </div>

              <span className="text-2xl font-bold text-amber-400 -mt-6">:</span>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-900 rounded-2xl flex items-center justify-center border border-stone-800 shadow-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-stone-400 mt-2 uppercase tracking-widest font-semibold">Mins</span>
              </div>

              <span className="text-2xl font-bold text-amber-400 -mt-6">:</span>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500 rounded-2xl flex items-center justify-center border border-amber-400 shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-stone-950 animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-stone-400 mt-2 uppercase tracking-widest font-semibold">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Exquisite Combos</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-2 mb-4">Beaution Package Suite</h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6" />
          <p className="text-stone-500 font-light text-sm text-balance">
            Our luxury tiers are custom-designed to bring multiple services under cohesive, discounted price-locks. All options integrate lashes, styling, and premium touch-up bags.
          </p>
        </div>

        {/* Pricing Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, idx) => {
            const config = getTheme(pkg.id);
            const isPremium = pkg.id === "p4";
            const isGold = pkg.id === "p3";

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`rounded-3xl p-8 border ${config.border} ${config.bg} flex flex-col justify-between relative shadow-sm hover:shadow-xl transition-all duration-300 ${
                  isPremium ? "ring-2 ring-amber-400/50" : ""
                }`}
              >
                {/* Popular Badge */}
                {pkg.badge && (
                  <span className={`absolute -top-3.5 left-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-10 ${
                    isPremium ? "bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950" : 
                    isGold ? "bg-amber-500 text-stone-950" : "bg-rose-100 text-rose-700"
                  }`}>
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-serif text-xl font-extrabold tracking-tight mb-2 uppercase">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black">₹{pkg.price.toLocaleString()}</span>
                    <span className={`text-xs uppercase font-bold tracking-wider ${isPremium ? "text-stone-400" : "text-stone-500"}`}>
                      ({pkg.discount}% Savings)
                    </span>
                  </div>

                  <span className={`block w-full h-px mb-6 ${isPremium ? "bg-stone-800" : "bg-rose-50"}`} />

                  <p className={`text-xs uppercase tracking-widest font-black mb-4 ${isPremium ? "text-amber-400" : "text-rose-500"}`}>
                    Services Included:
                  </p>
                  
                  <ul className="space-y-3.5 mb-8">
                    {pkg.services.map((item, keyIdx) => (
                      <li key={keyIdx} className="flex gap-2.5 items-start text-xs font-light">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isPremium ? "text-rose-400" : "text-amber-500"}`} />
                        <span className={isPremium ? "text-stone-300" : "text-stone-600"}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onBook({ type: 'package', id: pkg.id, name: pkg.name, price: pkg.price })}
                  className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${config.button}`}
                >
                  Book Combo Deck <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Combo Offer helper block */}
        <div className="mt-16 bg-stone-50 border border-stone-200/50 rounded-3xl p-8 text-center max-w-3xl mx-auto">
          <Gift className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-800">Need a Customized Styling Bundle?</h3>
          <p className="text-stone-500 text-sm font-light mt-1 max-w-md mx-auto leading-relaxed">
            Planning a multi-location event with 5+ guests? Contact our support desk to draft a custom bouquet with specific group discounts or customized artist travel slots.
          </p>
        </div>
      </div>
    </div>
  );
}
