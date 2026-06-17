import React, { useState, useEffect } from "react";
import { Sparkles, Phone, ShieldCheck, CheckCircle, Calendar, Clock, User, Mail, ArrowRight, Lock, RefreshCw, LogOut, Edit3, BookOpen, Tag, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomerPortalProps {
  customer: { name: string; email: string; phone: string } | null;
  setCustomer: (cust: { name: string; email: string; phone: string } | null) => void;
  customerBookings: any[];
  setCustomerBookings: React.Dispatch<React.SetStateAction<any[]>>;
  addNotification: (msg: string) => void;
  onBookTrigger: (item: any) => void;
  services: any[];
  packages: any[];
  darkMode: boolean;
}

export default function CustomerPortal({
  customer,
  setCustomer,
  customerBookings,
  setCustomerBookings,
  addNotification,
  onBookTrigger,
  services,
  packages,
  darkMode
}: CustomerPortalProps) {
  // Login System States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authStep, setAuthStep] = useState<'enter-phone' | 'verify-otp'>('enter-phone');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Booking CRUD management states
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editBookingDate, setEditBookingDate] = useState("");
  const [editBookingTime, setEditBookingTime] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // Sync profile details if customer exists
  useEffect(() => {
    if (customer) {
      setProfileName(customer.name || "");
      setProfileEmail(customer.email || "");
    }
  }, [customer]);

  // Handle requesting verification SMS Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMessage("Please enter a valid phone number (at least 8 digits) for OTP recognition.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setSimulatedOtp(data.simulatedOtp);
        setAuthStep('verify-otp');
        setCountdown(60);
        addNotification(`Security OTP sent successfully to ${phoneNumber}!`);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Failed to dispatch verification code.");
      }
    } catch {
      setErrorMessage("Transmitter timeout. Please make sure the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  // Handle confirming OTP and signing in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!otpCode || otpCode.trim().length === 0) {
      setErrorMessage("Please enter the received 6-digit security OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          otp: otpCode.trim()
        } )
      });

      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        setCustomer(profile);
        setCustomerBookings(data.bookings || []);
        localStorage.setItem("beaution_customer", JSON.stringify(profile));
        
        if (data.isNewCustomer) {
          addNotification("Welcome to Beaution! Please complete your name details below to personalize your bookings.");
          setIsEditingProfile(true);
        } else {
          addNotification(`Welcome back, recognized guest ${profile.name || "Customer"}!`);
        }
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Verification failed. Incorrect OTP entered.");
      }
    } catch {
      setErrorMessage("Verification system connectivity timed out.");
    } finally {
      setLoading(false);
    }
  };

  // Handle saving customer look details (Name, Email)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      addNotification("Please enter a non-empty name and email address.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customer?.phone,
          name: profileName.trim(),
          email: profileEmail.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCustomer(data.profile);
        setCustomerBookings(data.bookings || []);
        localStorage.setItem("beaution_customer", JSON.stringify(data.profile));
        setIsEditingProfile(false);
        addNotification("Your unique customer profile portfolio has been secured successfully!");
      } else {
        const errorData = await res.json();
        addNotification(errorData.error || "Failed to save profile.");
      }
    } catch {
      addNotification("Connection error saving guest parameters.");
    } finally {
      setSavingProfile(false);
    }
  };

  const startEditingBooking = (booking: any) => {
    setEditingBookingId(booking.id);
    setEditBookingDate(booking.date);
    setEditBookingTime(booking.time);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent, bookingId: string) => {
    e.preventDefault();
    if (!customer?.phone) return;
    
    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customer.phone,
          date: editBookingDate,
          time: editBookingTime
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerBookings(prev => prev.map(b => b.id === bookingId ? data.booking : b));
        setEditingBookingId(null);
        addNotification("Appointment has been successfully rescheduled under your selected details!");
      } else {
        const err = await res.json();
        addNotification(err.error || "Failed to update slot.");
      }
    } catch {
      addNotification("Network timeout while updating appointment.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleCancelSubmit = async (bookingId: string) => {
    if (!customer?.phone) return;
    
    setSubmittingCancel(true);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}?phone=${encodeURIComponent(customer.phone)}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setCustomerBookings(prev => prev.filter(b => b.id !== bookingId));
        setCancellingBookingId(null);
        addNotification("Your beauty appointment slot was safely cancelled.");
      } else {
        const err = await res.json();
        addNotification(err.error || "Failed to cancel appointment.");
      }
    } catch {
      addNotification("Error releasing booking slot.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Logout customer
  const handleSignOut = () => {
    setCustomer(null);
    setCustomerBookings([]);
    setPhoneNumber("");
    setOtpCode("");
    setSimulatedOtp(null);
    setAuthStep('enter-phone');
    localStorage.removeItem("beaution_customer");
    addNotification("Signed out from luxury profile securely.");
  };

  return (
    <div className="py-12" id="customer_portal_tab">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UNAUTHENTICATED SCREEN (OTP VERIFICATION) */}
        {!customer ? (
          <div className="max-w-md mx-auto" id="auth_portal_container">
            <div className="text-center mb-8">
              <span className="text-rose-500 font-extrabold text-[10px] sm:text-xs font-mono uppercase tracking-widest block mb-2">Authentic Verification</span>
              <h2 className="font-serif font-bold text-3xl tracking-tight text-stone-900 dark:text-stone-100">Customer Look Recognition</h2>
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                Unlock your curated beauty portfolio, track scheduled salon events, and access quick reservations using your verified mobile number.
              </p>
            </div>

            <motion.div 
              layout
              className="bg-white dark:bg-stone-900 border border-rose-100/60 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
              id="auth_card_wrapper"
            >
              {/* Top ambient luxury bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-300" />
              
              {errorMessage && (
                <div className="p-3.5 mb-6 text-xs text-rose-700 bg-rose-50 rounded-2xl font-medium border border-rose-150 flex items-start gap-2">
                  <span className="font-bold shrink-0">✕</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: ENTER PHONE NUMBER */}
              {authStep === 'enter-phone' && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">Enter Mobile Phone *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-2.5 leading-relaxed">
                      Enter your mobile number to check past look reservations or generate a brand-new Customer Recognition Card.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-950 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-400" />
                    ) : (
                      <>
                        Generate Security OTP <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER OTP SECURITY RECOGNITION CODE */}
              {authStep === 'verify-otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* Dynamic simulated verification popup alert */}
                  {simulatedOtp && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-900 animate-pulse">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Simulated SMS Gateway</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[10px] font-mono text-amber-800">Delivered</span>
                      </div>
                      <p className="text-zinc-600 leading-normal text-stone-700">
                        To maintain direct client safety, your generated authentication key is:
                      </p>
                      <div className="flex items-center justify-center p-2.5 bg-stone-950 text-white rounded-xl text-center tracking-[0.25em] font-mono font-extrabold text-lg select-all">
                        {simulatedOtp}
                      </div>
                      <p className="text-[9px] text-stone-400 text-center font-light">Copy and paste this code to authorize this session.</p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Verify Security Code *</label>
                      <button
                        type="button"
                        onClick={() => { setAuthStep('enter-phone'); setOtpCode(""); }}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Type 6-digit code"
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all font-mono text-center tracking-[0.4em] font-bold text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-stone-950 dark:bg-white text-white dark:text-stone-950 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Confirm & Access Cabinet <CheckCircle className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <span className="text-[11px] text-stone-400">
                        Resend code in <strong className="font-mono text-stone-600 dark:text-stone-300">{countdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-xs font-bold text-stone-900 dark:text-stone-200 hover:text-rose-500 hover:underline"
                      >
                        Resend Security SMS OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        ) : (
          
          /* AUTHENTICATED REAL CUSTOMER DIGITAL DESK */
          <div className="space-y-8" id="guest_dashboard">
            
            {/* Elegant Header Greeting Block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-rose-100/60 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-pink-400 to-amber-400 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl ring-4 ring-rose-50">
                  {customer.name ? customer.name.substring(0, 2).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider">
                      Recognized Beaution Guest
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h2 className="font-serif font-black text-2xl text-stone-950 dark:text-stone-50 mt-1">
                    Welcome back, {customer.name || "Special Guest!"}
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">Verified number: <span className="font-mono">{customer.phone}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`py-2 px-4 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                    isEditingProfile 
                      ? "bg-rose-50 text-rose-600 border border-rose-200" 
                      : "bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="py-2 px-4 bg-stone-950 dark:bg-rose-950 text-white dark:text-rose-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            {/* EXPANDABLE EDIT PROFILE PANEL */}
            <AnimatePresence>
              {isEditingProfile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-rose-50/25 dark:bg-stone-900 border border-rose-100/50 dark:border-stone-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <div className="border-b border-rose-50 pb-2">
                      <h3 className="font-serif font-bold text-stone-9w0 dark:text-white text-base">Complete Your Recognition Signature</h3>
                      <p className="text-stone-500 text-xs mt-0.5">This name and email will automatically pre-populate bookings and digital coupons instantly.</p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">First / Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Madhuri Dixit"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. name@beaution.com"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="py-2 px-4 border border-zinc-200 dark:border-zinc-700 text-stone-605 text-xs font-bold rounded-lg hover:bg-stone-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="py-2.5 px-6 bg-stone-950 dark:bg-white text-white dark:text-stone-950 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          {savingProfile ? "Securing..." : "Confirm Security Signature"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CUSTOMER RESERVATIONS CABINET */}
            <div className="space-y-4" id="reservations_cabinet">
              <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-rose-500" /> My Beauty Reservation History
                </h3>
                <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-full font-bold text-[10px] sm:text-xs">
                  {customerBookings.length} bookings discovered
                </span>
              </div>

              {customerBookings.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl" id="empty_cabinet_block">
                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-black text-stone-900 dark:text-white text-lg">No reservations generated yet</h4>
                  <p className="text-stone-400 dark:text-stone-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                    You have verified your telephone successfully but have no looks reserved under {customer.phone}. Change the trend by scheduling your beauty makeover combination right now!
                  </p>
                  
                  <button
                    onClick={() => onBookTrigger({ type: 'service', id: services[0]?.id || 's1', name: services[0]?.title || 'Bridal Makeup', price: services[0]?.offerPrice || 11999 })}
                    className="mt-6 px-6 py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-950 hover:bg-rose-500 hover:text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all"
                  >
                    Reserving My First Look
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="bookings_grid">
                  {customerBookings.map((b) => (
                    <div 
                      key={b.id} 
                      className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5 shadow-xl space-y-4 hover:shadow-2xl hover:border-rose-200/70 transition-all flex flex-col justify-between"
                    >
                      {/* OPTION 1: INLINE RESCHEDULING FORM */}
                      {editingBookingId === b.id ? (
                        <form onSubmit={(e) => handleRescheduleSubmit(e, b.id)} className="space-y-4">
                          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-805 pb-2">
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Change Reservation Slot
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setEditingBookingId(null)}
                              className="text-[10px] uppercase font-bold text-stone-400 hover:text-stone-700 bg-stone-100 px-2 py-1 rounded"
                            >
                              Back
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">New Appointment Date *</label>
                              <input 
                                type="date" 
                                required
                                value={editBookingDate} 
                                onChange={(e) => setEditBookingDate(e.target.value)}
                                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-rose-300"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Preferred Time Slot *</label>
                              <select 
                                required
                                value={editBookingTime}
                                onChange={(e) => setEditBookingTime(e.target.value)}
                                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-rose-300"
                              >
                                <option value="09:00 AM">09:00 AM (Morning Prep)</option>
                                <option value="11:00 AM">11:00 AM (Midday Glow)</option>
                                <option value="01:00 PM">01:00 PM (Afternoon Style)</option>
                                <option value="03:00 PM">03:00 PM (Sunset Party Prep)</option>
                                <option value="05:00 PM">05:00 PM (Evening Gala Set)</option>
                                <option value="07:00 PM">07:00 PM (Late Night Premium)</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submittingEdit}
                            className="w-full py-2 bg-stone-950 dark:bg-white text-white dark:text-stone-950 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                          >
                            {submittingEdit ? "Updating Schedule..." : "Confirm Reschedule Slot"}
                          </button>
                        </form>
                      ) : cancellingBookingId === b.id ? (
                        
                        /* OPTION 2: DANGER CANCEL WARNING DIALOG */
                        <div className="space-y-4">
                          <div className="pb-1 border-b border-rose-100">
                            <span className="text-xs font-serif font-black text-rose-600 block">Cancel Luxury Appointment</span>
                            <span className="text-[10px] text-stone-400">Reservation #{b.receiptNo}</span>
                          </div>

                          <p className="text-xs text-stone-600 dark:text-stone-450 leading-relaxed">
                            Are you absolutely sure you want to cancel this beauty makeover slot? This action will release the reserved time slot and cannot be undone.
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleCancelSubmit(b.id)}
                              disabled={submittingCancel}
                              className="py-2 px-3 bg-rose-600 text-white hover:bg-rose-700 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-colors"
                            >
                              {submittingCancel ? "Cancelling..." : "Yes, Release"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancellingBookingId(null)}
                              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-colors"
                            >
                              Keep slot
                            </button>
                          </div>
                        </div>

                      ) : (

                        /* OPTION 3: REGULAR COMPACT CARD DETAILS */
                        <>
                          {/* Booking receipt top header banner */}
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-300 font-bold text-[9px] uppercase tracking-wider leading-none">
                                  {b.receiptNo}
                                </span>
                                <h4 className="font-serif font-bold text-stone-900 dark:text-white text-base mt-1.5">{b.selectedName}</h4>
                              </div>

                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase">
                                {b.paymentStatus || "Completed"}
                              </span>
                            </div>

                            {/* Timing and client information */}
                            <div className="mt-4 space-y-2 text-xs text-stone-500 dark:text-stone-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                                <span>Reserved Date: <strong className="text-stone-700 dark:text-stone-300">{b.date}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-rose-400" />
                                <span>Salon Appointment Slot: <strong className="text-stone-700 dark:text-stone-300">{b.time} IST</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-rose-400" />
                                <span>Registered Guest: <span className="font-semibold text-stone-800 dark:text-stone-200">{b.customerName}</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Action button triggers for CRUD */}
                          <div className="flex flex-col gap-2.5 pt-3 border-t border-dashed border-stone-100 dark:border-stone-800">
                            
                            {/* Inner pricing parameters and print trigger */}
                            <div className="flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/10 px-3 py-2 rounded-xl">
                              <div>
                                <span className="text-[10px] text-stone-400 block font-light leading-none">Paid Value:</span>
                                <strong className="text-amber-600 dark:text-amber-500 font-mono font-bold text-sm tracking-tight">₹{b.amountPaid.toLocaleString()}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-1.5 bg-zinc-100 hover:bg-rose-500 hover:text-white dark:bg-zinc-800 text-stone-750 dark:text-stone-300 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1 font-mono"
                              >
                                Print Ticket
                              </button>
                            </div>

                            {/* Custom Update (Reschedule) & Cancel triggers for client-level self-service */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => startEditingBooking(b)}
                                className="py-2 bg-stone-100 hover:bg-amber-500 hover:text-stone-950 dark:bg-zinc-800 dark:hover:bg-amber-500 text-stone-800 dark:text-stone-250 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancellingBookingId(b.id)}
                                className="py-2 bg-stone-50 hover:bg-rose-500 hover:text-white dark:bg-zinc-900/40 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest rounded-xl border border-rose-100/45 dark:border-stone-800 transition-all"
                              >
                                Cancel Slot
                              </button>
                            </div>

                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
