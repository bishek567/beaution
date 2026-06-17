import React, { useState } from "react";
import { Sparkles, Eye, Instagram, Plus, Minus, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Gallery() {
  // Before / After Slider Position State (20 to 80 percent)
  const [sliderPos, setSliderPos] = useState(50);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const instagramPosts = [
    { id: 1, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&fit=crop&q=80", likes: "1,248" },
    { id: 2, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&fit=crop&q=80", likes: "982" },
    { id: 3, img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&fit=crop&q=80", likes: "1,530" },
    { id: 4, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&fit=crop&q=80", likes: "2,041" }
  ];

  const faqs = [
    {
      q: "What cosmetics brands do you use for bridal makeovers?",
      a: "We use strictly high-end international designer cosmetics including Dior, Chanel, Estée Lauder, MAC, Huda Beauty, Charlotte Tilbury, and Anastasia Beverly Hills. All products are authentic and dermatologically pre-vetted."
    },
    {
      q: "Do you travel to the wedding venue or do makeup at home?",
      a: "Yes! Our elite senior stylists can travel directly to your hotel suite, wedding venue, or home for Bridal, Engagement and Premium combo groups. A travel out-fee is indexed depending on the travel distance."
    },
    {
      q: "How early should I book my bridal beauty slot?",
      a: "Since wedding seasons are highly demanded, we recommend locking your dates at least 3-6 months in advance. You can secure dates immediately online by placing a lock-fee pre-payment here."
    },
    {
      q: "What is your policy on cancellations or date rescheduling?",
      a: "We allow one-time complementary date rescheduling up to 7 days before your original appointment. For cancellations, 50% of the booking pre-payment is credited as gift coupons, and 50% is retained as reservation retainer slot loss."
    },
    {
      q: "Do your packages include mock trials?",
      a: "Our Premium Package includes a complementary 1-hour styling trial on skin prep and lip shade selection relative to your wedding jewelry. For other packages, mock trials can be separately booked."
    }
  ];

  return (
    <div className="w-full py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Intro */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Exquisite Showcase</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2 mb-4">Artistry & FAQ</h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto" />
        </div>

        {/* Before / After Slider section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-100 shadow-sm mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider block mb-1">Interactive Comparison</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">Before / After Slider</h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light mt-1 max-w-md mx-auto">
              Drag the golden central bar left and right to inspect the seamless texture transition, color-correction and highlighting.
            </p>
          </div>

          {/* Interactive slider widget frame */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden select-none shadow-md max-w-2xl mx-auto border border-stone-200">
            {/* Before state (Base image under slider coverage) */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&fit=crop&q=80"
                alt="Client Before Makeup"
                className="w-full h-full object-cover filter saturate-50 blur-[0.5px]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute left-6 top-6 bg-stone-900/80 backdrop-blur-sm text-stone-300 text-xs font-semibold px-4 py-2 rounded-lg tracking-widest uppercase border border-stone-700/50">
                Natural Skin
              </span>
            </div>

            {/* After state (Covering image overlay with dynamic width) */}
            <div 
              className="absolute inset-y-0 left-0 right-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&fit=crop&q=80"
                alt="Client Luxury Transformation After"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: "100%", maxWidth: "none" }}
                referrerPolicy="no-referrer"
              />
              <span className="absolute left-6 bottom-6 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-lg tracking-widest uppercase border border-rose-400 shadow-md">
                Beaution Finish
              </span>
            </div>

            {/* Slider Drag Bar Trigger */}
            <div 
              className="absolute inset-y-0 w-1 bg-amber-500 cursor-ew-resize flex items-center justify-center z-10"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-stone-950 border-2 border-amber-500 text-amber-500 flex items-center justify-center shadow-lg -ml-3.5 focus:outline-none hover:scale-110 active:scale-95 transition-transform">
                <span className="font-mono text-xs font-extrabold uppercase select-none">&lt;&gt;</span>
              </div>
            </div>

            {/* Hidden native input for easy mobile dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
            />
          </div>
        </section>

        {/* Social Feed - Instagram section */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900">Connect On Socials</h2>
              <p className="text-stone-400 text-slate-400 text-xs sm:text-sm font-light mt-1">
                Tag your final look with <strong className="text-stone-700 font-semibold">#BeautionGlow</strong> to receive featuring.
              </p>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 hover:border-rose-400 rounded-full text-xs font-semibold uppercase tracking-wider bg-white transition-all text-stone-700 hover:text-rose-500"
            >
              <Instagram className="w-4 h-4 text-rose-500 shrink-0" /> Follow @BeautionStudio
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {instagramPosts.map((post) => (
              <div key={post.id} className="relative aspect-square group overflow-hidden rounded-3xl bg-stone-200 border border-stone-100">
                <img
                  src={post.img}
                  alt="Past client look"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-xs font-bold gap-1.5 font-mono">
                  <Instagram className="w-4 h-4" /> ♥ {post.likes} Likes
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-100 shadow-sm max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border-b border-rose-55 w-full flex flex-col pb-4">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex justify-between items-center text-left py-2 text-stone-850 hover:text-rose-500 transition-colors w-full focus:outline-none"
                  >
                    <span className="font-serif font-bold text-base sm:text-lg">{faq.q}</span>
                    <span className="text-xl text-stone-400 ml-4 shrink-0 font-light">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-stone-500 text-xs sm:text-sm font-light mt-2 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
