import React from "react";
import { Sparkles, Calendar, Heart, Shield, Star, Award, ArrowRight, Quote, Compass } from "lucide-react";
import { motion } from "motion/react";
import { Service, Package } from "../types";
import { getServiceImage } from "../lib/images";

interface HomeProps {
  services: Service[];
  packages: Package[];
  onNavigate: (tab: string) => void;
  onBook: (item: { type: 'service' | 'package'; id: string; name: string; price: number }) => void;
}

export default function Home({ services, packages, onNavigate, onBook }: HomeProps) {
  // Take first 3 services as featured
  const featuredServices = services.slice(0, 3);
  
  // High quality premium dummy reviews
  const reviews = [
    {
      name: "Priyanka Sharma",
      role: "Bridal Client",
      rating: 5,
      comment: "Beaution made my wedding day. The airbrush makeup was absolutely flawless, and it stayed perfect under the hot studio lights for nearly 14 hours! Truly a luxury experience.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&fit=crop&q=80"
    },
    {
      name: "Meera Deshmukh",
      role: "Glam Party Event",
      rating: 5,
      comment: "I booked the Party Makeup for my corporate gala. The contouring and gold highlights were classy and elegant—not overdone. Staff was extremely polite and professional.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop&q=80"
    },
    {
      name: "Anjali Gupta",
      role: "Saree & Hair Client",
      rating: 5,
      comment: "Professional draping at its finest! My silk saree was pleated perfectly, and the designer floral braid look drew compliments from everyone at the ceremony.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&fit=crop&q=80"
    }
  ];

  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: "Premium Cosmetics Only",
      desc: "We exclusively style you using authentic international brands like Dior, Chanel, Estée Lauder and Charlotte Tilbury."
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      title: "Clean & Certified Staff",
      desc: "Our artists hold professional beauty diplomas and prioritize supreme sterilization and dermatological hygiene."
    },
    {
      icon: <Calendar className="w-6 h-6 text-amber-500" />,
      title: "Timely Appointment Slate",
      desc: "No waiting queues. When you reserve a slot, our expert makeup lead is dedicated 100% to you on schedule."
    }
  ];

  return (
    <div className="w-full">
      {/* Dynamic Hero Banner Banner */}
      <section className="relative min-h-[85vh] flex items-center bg-stone-950 overflow-hidden" id="home_hero">
        {/* Visual background image with soft vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={getServiceImage("hero_makeup_model")}
            alt="Beaution Luxury Makeup Model"
            className="w-full h-full object-cover object-right opacity-40 md:opacity-55"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 text-white w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> High-Fashion Studio
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-6">
              Enhance Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200">
                Natural Beauty
              </span> <br />
              with Expert Hands
            </h1>

            <p className="text-stone-300 text-base sm:text-lg lg:text-xl font-light leading-relaxed mb-10 max-w-xl">
              Indulge in a premium, personalized makeup session tailored to your occasion. Discover luxury bridal styling, camera-ready HD makeovers, and expert care.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onNavigate("services")}
                id="hero_book_btn"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-400 to-amber-500 text-stone-950 font-semibold tracking-wider uppercase text-xs rounded-full hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-300 hover:scale-105"
              >
                Book Makeup Session
              </button>
              <button
                onClick={() => onNavigate("offers")}
                id="hero_offers_btn"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 text-white font-semibold tracking-wider uppercase text-xs rounded-full transition-all duration-300"
              >
                Explore Beauty Packages
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges - Benefits Row */}
      <section className="bg-white py-12 border-b border-rose-100 relative z-10" id="benefits_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl hover:bg-rose-50/40 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-stone-900 mb-1">{b.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-24 bg-stone-50/50" id="featured_services_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Exquisite Artistry</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-2 mb-4">Our Featured Makeovers</h2>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6" />
            <p className="text-stone-500 font-light text-sm sm:text-base">
              Explore our highly coveted premium beauty and styling services, executed with top-tier designer cosmetic brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-rose-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={getServiceImage(service.image)}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-amber-500/95 backdrop-blur-sm text-stone-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    Save {Math.round(((service.originalPrice - service.offerPrice) / service.originalPrice) * 100)}%
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-2 group-hover:text-rose-500 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-stone-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-6 flex-grow">
                    {service.description}
                  </p>
                  <div className="flex items-end justify-between border-t border-rose-50/80 pt-4">
                    <div>
                      <span className="text-stone-400 text-xs line-through block">₹{service.originalPrice.toLocaleString()}</span>
                      <span className="text-rose-500 font-extrabold text-lg">₹{service.offerPrice.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => onBook({ type: 'service', id: service.id, name: service.title, price: service.offerPrice })}
                      className="px-4 py-2 rounded-full bg-stone-900 text-white hover:bg-rose-500 text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate("services")}
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-800 text-stone-800 hover:bg-stone-900 hover:text-white rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300"
            >
              View All Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Offers Promo Banner with Urgency Banner */}
      <section className="bg-gradient-to-b from-stone-900 to-rose-950 text-white py-20 relative overflow-hidden" id="promotional_offer_banner">
        {/* Subtle decorative background spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-3">Limited-Time Celebration Offer</span>
              <h2 className="font-serif text-3xl sm:text-5xl tracking-tight mb-6">
                Premium Gold Package <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">
                  Flat 35% Discount
                </span>
              </h2>
              <p className="text-stone-300 font-light leading-relaxed mb-6 text-sm sm:text-base">
                Pamper yourself like royalty with our top-selling celebrity style Gold Package! Complete HD makeup, professional structural hair design, saree pleading, hydration face massage, and aesthetic glue-on lashes.
              </p>
              
              <ul className="space-y-3 mb-8">
                {["Elite HD Camera-ready Cosmetics", "Design Haircut & Custom Styles", "Deep Hydrating Bio-Shield Care", "Stunning Individual Eyelash Placement"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-stone-200 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div>
                  <span className="text-stone-400 text-xs block line-through">Original Price: ₹30,760</span>
                  <span className="text-amber-300 text-3xl font-extrabold">₹19,999 Only</span>
                </div>
                <button
                  onClick={() => onNavigate("offers")}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-stone-900 hover:bg-amber-300 hover:text-stone-900 text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                >
                  Grab Package Deal
                </button>
              </div>
            </div>

            <div className="relative lg:pl-10">
              <div className="relative aspect-square max-w-[420px] mx-auto rounded-full overflow-hidden border-4 border-amber-500/20 shadow-2xl">
                <img
                  src={getServiceImage("glam_makeup")}
                  alt="Special Makeup Offer"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/20" />
              </div>
              
              {/* Overlay Badge */}
              <div className="absolute -bottom-4 right-1/4 bg-amber-400 text-stone-950 p-4 rounded-xl shadow-lg border border-amber-300 flex flex-col items-center justify-center animate-bounce">
                <span className="text-xs uppercase font-bold tracking-widest">Offers Ending</span>
                <span className="text-lg font-black font-mono">SOON!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Carousel Grid */}
      <section className="py-24 bg-white" id="testimonials_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Aesthetic Reviews</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-2 mb-4">Loved by Our Gorgeous Clients</h2>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-stone-50 border border-stone-100 rounded-3xl p-8 relative shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-rose-200/50" />
                  <p className="text-stone-600 font-light text-sm sm:text-base italic leading-relaxed mb-6">
                    "{r.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-rose-100/50 pt-4">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover border border-rose-300"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">{r.name}</h4>
                    <span className="text-stone-400 text-xs uppercase tracking-wider">{r.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Newsletter Signup Banner */}
      <section className="bg-stone-50 py-16 border-t border-stone-100" id="newsletter_signup">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Beaution Insiders Mailing List</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-2 mb-4">Subscribe for Secret Discounts & Beauty Tips</h2>
          <p className="text-stone-500 text-sm max-w-lg mx-auto mb-8 font-light">
            We drop premium promo codes, seasonal availability slot alerts, and exclusive editorial makeup catalogs direct to our subscribers once a month. No spam.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-5 py-3 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
            />
            <button
              onClick={() => alert("Thank you for subscribing to Beaution! We've registered your email to receive premium offers.")}
              className="px-6 py-3 rounded-full bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase hover:bg-stone-950 transition-colors shrink-0"
            >
              Sign Me Up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
