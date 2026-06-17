import React from "react";
import { BookOpen, Sparkles, User, Clock, Heart } from "lucide-react";
import { motion } from "motion/react";

export default function Blog() {
  const articles = [
    {
      id: 1,
      tag: "BRIDAL PREP",
      title: "The Ultimate 6-Month Skincare Routine Before Your Wedding Day",
      desc: "Planning your bridal look starts months ahead! Discover dermatologist-approved hydration rituals, exfoliating schedules, and nutrition cycles to make your skin look like glass.",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&fit=crop&q=80",
      author: "Aditi Sen, Senior Makeup Lead",
      time: "8 min read"
    },
    {
      id: 2,
      tag: "STYLE INSIGHTS",
      title: "HD Makeup vs. Airbrush Makeup: Which Is Perfect For You?",
      desc: "Confused between silicone airbrush mists and camera-level High Definition blending? We outline durability comparisons, sweat resistance, and close-up photography texture evaluations.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&fit=crop&q=80",
      author: "Ritu Verma, Master Stylist",
      time: "5 min read"
    },
    {
      id: 3,
      tag: "TIPS & TRENDS",
      title: "5 Luxury Makeup Kit Must-Haves for Indian Monsoons & Summers",
      desc: "How to combat extreme humidity without cakey deposits. Our professional breakdown of waterproof makeup setting sprays, mattifying primers, and lightweight mineral skin bases.",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&fit=crop&q=80",
      author: "Sneha Nair, Cosmetic Chemist",
      time: "6 min read"
    }
  ];

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header line */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Exquisite Journal</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2 mb-4">Beaution Editorial</h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6" />
          <p className="text-stone-500 font-light text-sm text-balance">
            Insights, tutorials, and trend catalogs straight from our master artists. Learn how to maintain your hair volume, secure glossy lips, and prep skin flawlessly.
          </p>
        </div>

        {/* Article layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <motion.article
              key={art.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-stone-50 border border-stone-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-100">
                    {art.tag}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 line-clamp-2 leading-tight mb-3 group-hover:text-rose-500 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed mb-4 line-clamp-3">
                    {art.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-rose-50 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" /> {art.author}
                </span>
                <span className="flex items-center gap-1 shrink-0 font-mono">
                  <Clock className="w-3.5 h-3.5" /> {art.time}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
