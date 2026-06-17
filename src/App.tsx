import React, { useState, useEffect } from "react";
import { Sparkles, Phone, MapPin, Clock, Search, Menu, X, Sun, Moon, Bell, Shield, Heart, HelpCircle, BookOpen, Star, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Package, SupportContact } from "./types";
import Home from "./components/Home";
import Services from "./components/Services";
import Packages from "./components/Packages";
import Contact from "./components/Contact";
import Blog from "./components/Blog";
import Gallery from "./components/Gallery";
import BookModal from "./components/BookModal";
import Admin from "./components/Admin";
import CustomerPortal from "./components/CustomerPortal";

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState("home");
  
  // Theme state: default light, toggleable to dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Customer state: initialized from localStorage
  const [customer, setCustomer] = useState<{ name: string; email: string; phone: string } | null>(() => {
    const saved = localStorage.getItem("beaution_customer");
    return saved ? JSON.parse(saved) : null;
  });
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);

  // Data registers
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [supportInfo, setSupportInfo] = useState<SupportContact>({
    dealerName: "Beaution Headquarters",
    contactNumber: "+91 93429 56011",
    email: "support@beaution.com",
    location: "7th Avenue, Luxury Plaza, MG Road, Bangalore",
    supportTiming: "Daily 9:00 AM - 9:00 PM IST",
    whatsappNumber: "919342956011"
  });

  // Modals and notifications
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingPreSelect, setBookingPreSelect] = useState<{ type: 'service' | 'package'; id: string; name: string; price: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);

  // Search filter query bar (Global overlay)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

  // Load all central registry data on mount
  const loadRegistryData = async () => {
    try {
      const r1 = await fetch("/api/services");
      if (r1.ok) {
        const d1 = await r1.json();
        setServices(d1);
      }
      const r2 = await fetch("/api/offers");
      if (r2.ok) {
        const d2 = await r2.json();
        setPackages(d2);
      }
      const r3 = await fetch("/api/support");
      if (r3.ok) {
        const d3 = await r3.json();
        setSupportInfo(d3);
      }
    } catch (err) {
      console.error("Failed to compile initial database register feeds", err);
    }
  };

  useEffect(() => {
    loadRegistryData();
    // Pre-feed some custom notification alerts after a slight delay
    const t = setTimeout(() => {
      addNotification("Welcome! Explore our new 35% Flat Discount packages for this high-fashion wedding season.");
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (customer?.phone) {
      fetch(`/api/customer/bookings?phone=${encodeURIComponent(customer.phone)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCustomerBookings(data);
          }
        })
        .catch(err => console.error("Could not sync customer bookings:", err));
    } else {
      setCustomerBookings([]);
    }
  }, [customer?.phone]);

  const addNotification = (text: string) => {
    const id = "notif_" + Date.now();
    setNotifications((prev) => [...prev, { id, text }]);
    // Auto erase notifications after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Click-to-book handler
  const handleBookingTrigger = (item: { type: 'service' | 'package'; id: string; name: string; price: number }) => {
    setBookingPreSelect(item);
    setShowBookModal(true);
  };

  const handleBookingSubmit = async (payload: any) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        addNotification(`Booking Confirmed! Receipt ${result.booking.receiptNo} has been generated.`);
        if (customer?.phone) {
          fetch(`/api/customer/bookings?phone=${encodeURIComponent(customer.phone)}`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setCustomerBookings(data);
              }
            })
            .catch(err => console.error("Could not sync customer bookings:", err));
        }
        return { success: true, booking: result.booking };
      } else {
        const errData = await response.json();
        return { success: false, error: errData.error };
      }
    } catch {
      return { success: false, error: "Network timeout or API server down." };
    }
  };

  const handleFeedbackSubmit = async (payload: any) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        addNotification("Thank you! Feedback received safely.");
        return { success: true, message: result.message };
      } else {
        const errData = await response.json();
        return { success: false, error: errData.error };
      }
    } catch {
      return { success: false, error: "Error contacting feedback service." };
    }
  };

  const handleAdminVerify = async (password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@beaution.com", password })
      });
      if (res.ok) {
        const data = await res.json();
        addNotification("Signed into Admin Portal successfully!");
        return { success: true, token: data.token };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: "Verification unavailable." };
    }
  };

  // Search trigger inside global directory search
  const handleGlobalSearchNavigate = (id: string, name: string) => {
    setGlobalSearchOpen(false);
    setGlobalQuery("");
    // Route tab
    setActiveTab("services");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      darkMode ? "bg-stone-950 text-stone-100 dark" : "bg-stone-50 text-stone-900"
    }`} id="main_app_wrapper">
      
      {/* Dynamic Absolute Notifier overlay lists */}
      <div className="fixed bottom-6 right-6 z-55 max-w-sm space-y-3 pointer-events-none" id="notifications_hub">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl bg-stone-900 text-white border border-rose-400 text-xs shadow-xl pointer-events-auto flex items-start gap-2.5"
            >
              <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{notif.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Luxury Brand Mini announcement Bar */}
      <div className="bg-stone-950 text-white py-2 text-center text-[10px] sm:text-xs font-semibold tracking-widest uppercase border-b border-stone-800">
        <span className="text-amber-400">♥ Special Wedding Promo 2026:</span> flat 35% discount on all custom bundle styling sets
      </div>

      {/* Main Luxury Header Navigation Bar */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 border-b backdrop-blur-md ${
        darkMode ? "bg-stone-950/90 border-stone-800/80" : "bg-white/95 border-rose-100/60"
      }`} id="app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo Identity */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-1 bg-transparent border-0 focus:outline-none shrink-0 group cursor-pointer"
            id="logo_btn"
          >
            <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-serif font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-rose-600 dark:from-white dark:to-rose-300">
              Beaution
            </span>
          </button>

          {/* Desktop Tab links list */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-widest">
            {[
              { id: "home", label: "Home" },
              { id: "services", label: "Services" },
              { id: "offers", label: "Combos" },
              { id: "gallery", label: "Gallery" },
              { id: "blog", label: "Journal" },
              { id: "contact", label: "Support" },
              { id: "portal", label: customer ? `♥ ${customer.name || "My Bookings"}` : "My Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-rose-500 text-rose-500"
                    : "border-transparent text-stone-600 dark:text-stone-300 hover:text-rose-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Header Tools (Toggles, Searches, Books) */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {/* Dark/Light mode toggle */}
            <button
              onClick={() => { setDarkMode(!darkMode); addNotification(`Switched to ${!darkMode ? "Dark" : "Light"} theme.`); }}
              id="theme_toggle_btn"
              className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-white/5 transition-colors text-stone-500 dark:text-stone-300"
              title="Toggle Dark Slate Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Direct CRM administrative Portal CTA */}
            <button
              onClick={() => setActiveTab("admin")}
              id="crm_portal_btn"
              className={`p-2 rounded-full transition-colors ${
                activeTab === "admin" ? "bg-rose-100 text-rose-600" : "hover:bg-rose-50 dark:hover:bg-white/5 text-stone-500 dark:text-stone-300"
              }`}
              title="CRM Admin Portal"
            >
              <Shield className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleBookingTrigger({ type: 'service', id: services[0]?.id || 's1', name: services[0]?.title || 'Bridal Makeup', price: services[0]?.offerPrice || 11999 })}
              id="header_book_cta"
              className="px-6 py-3 bg-stone-900 dark:bg-white dark:text-stone-950 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile view Action Triggers */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-stone-500"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`p-2 rounded-md ${activeTab === 'admin' ? 'text-rose-500' : 'text-stone-500'}`}
            >
              <Shield className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile_hamburger_btn"
              className="p-2 text-stone-800 dark:text-stone-100 shrink-0"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation panels */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-6 space-y-4" id="mobile_menu">
            <div className="flex flex-col gap-3 font-bold text-xs uppercase tracking-widest text-left">
              {[
                { id: "home", label: "Home" },
                { id: "services", label: "Services" },
                { id: "offers", label: "Combos" },
                { id: "gallery", label: "Gallery" },
                { id: "blog", label: "Journal" },
                { id: "contact", label: "Support" },
                { id: "portal", label: customer ? `♥ ${customer.name || "My Bookings"}` : "My Profile" },
              ].map((mTab) => (
                <button
                  key={mTab.id}
                  onClick={() => { setActiveTab(mTab.id); setMobileMenuOpen(false); }}
                  className={`py-2 border-l-4 pl-3 text-left ${
                    activeTab === mTab.id
                      ? "border-rose-500 text-rose-500"
                      : "border-transparent text-stone-600 dark:text-stone-300"
                  }`}
                >
                  {mTab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setMobileMenuOpen(false); handleBookingTrigger({ type: 'service', id: services[0]?.id || 's1', name: services[0]?.title || 'Bridal Makeup', price: services[0]?.offerPrice || 11999 }); }}
              className="w-full py-3 bg-stone-900 text-white hover:bg-rose-500 rounded-full text-xs font-bold uppercase tracking-wider text-center block"
            >
              Book Session
            </button>
          </div>
        )}
      </header>

      {/* CORE REACT STATE MAIN TABS CONTAINER */}
      <main className="flex-grow">
        {activeTab === "home" && (
          <Home
            services={services}
            packages={packages}
            onNavigate={(tab) => setActiveTab(tab)}
            onBook={handleBookingTrigger}
          />
        )}

        {activeTab === "services" && (
          <Services
            services={services}
            onBook={handleBookingTrigger}
          />
        )}

        {activeTab === "offers" && (
          <Packages
            packages={packages}
            onBook={handleBookingTrigger}
          />
        )}

        {activeTab === "gallery" && (
          <Gallery />
        )}

        {activeTab === "blog" && (
          <Blog />
        )}

        {activeTab === "contact" && (
          <Contact
            supportInfo={supportInfo}
            onSubmitMessage={handleFeedbackSubmit}
          />
        )}

        {activeTab === "admin" && (
          <Admin
            services={services}
            packages={packages}
            supportInfo={supportInfo}
            onRefreshAllData={loadRegistryData}
            onLogin={handleAdminVerify}
          />
        )}

        {activeTab === "portal" && (
          <CustomerPortal
            customer={customer}
            setCustomer={setCustomer}
            customerBookings={customerBookings}
            setCustomerBookings={setCustomerBookings}
            addNotification={addNotification}
            onBookTrigger={handleBookingTrigger}
            services={services}
            packages={packages}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Luxury Footer bar */}
      <footer className={`py-12 border-t ${
        darkMode ? "bg-stone-900 border-stone-800 text-stone-300" : "bg-stone-50 border-rose-100 text-stone-600"
      }`} id="app_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div>
              <div className="flex justify-center md:justify-start items-center gap-1.5 mb-4 select-none">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-serif font-black text-xl tracking-wider text-stone-900 dark:text-white">
                  Beaution
                </span>
              </div>
              <p className="text-stone-400 text-xs font-light leading-relaxed max-w-xs mx-auto md:mx-0">
                Premium high-fashion makeup services executing classic elegance and camera-defined contours using deluxe global cosmetics.
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm mb-4 uppercase tracking-widest">Aesthetic links</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => setActiveTab("services")} className="hover:text-rose-400">Classrooms & Services</button></li>
                <li><button onClick={() => setActiveTab("offers")} className="hover:text-rose-400">Combos & Discounts</button></li>
                <li><button onClick={() => setActiveTab("gallery")} className="hover:text-rose-400">Client Comparison slider</button></li>
                <li><button onClick={() => setActiveTab("blog")} className="hover:text-rose-400">Skincare Journal Tips</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm mb-4 uppercase tracking-widest">Dealer Support</h4>
              <ul className="space-y-2.5 text-xs text-stone-500 font-light">
                <li className="flex items-center gap-2 justify-center md:justify-start"><Phone className="w-3.5 h-3.5" /> {supportInfo.contactNumber}</li>
                <li className="flex items-center gap-2 justify-center md:justify-start"><Clock className="w-3.5 h-3.5" />Timings: {supportInfo.supportTiming}</li>
                <li className="flex items-center gap-2 justify-center md:justify-start"><MapPin className="w-3.5 h-3.5" />MG Road, Bangalore - 560001</li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm mb-4 uppercase tracking-widest">Security certified</h4>
              <ul className="space-y-2 text-xs text-stone-400 font-light">
                <li>Secure Escrow Payments</li>
                <li>Hashed CRM Auditing</li>
                <li>GDPR Compliant Data Vault</li>
                <li><button onClick={() => alert("GDPR Compliant: Beaution utilizes local secure registries only for reservation callbacks. Your phone or email records are never sold or transmitted to third-party ad registries.")} className="underline text-stone-500">View Privacy Notice</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6 text-center text-[10px] text-stone-400 font-light flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Beaution Beauty Studio. All Rights Reserved. Crafted with pristine premium typography.</p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-rose-500"><Instagram className="w-4 h-4" /></a>
              <span>SSL Secure Gate</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DYNAMIC RESERVATION BOOKMODAL */}
      <AnimatePresence>
        {showBookModal && (
          <BookModal
            selectedItem={bookingPreSelect}
            services={services}
            packages={packages}
            customer={customer}
            onClose={() => { setShowBookModal(false); setBookingPreSelect(null); }}
            onFormSubmit={handleBookingSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
