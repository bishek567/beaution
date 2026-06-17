import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { SupportContact } from "../types";

interface ContactProps {
  supportInfo: SupportContact;
  onSubmitMessage: (msg: { name: string; phone: string; email: string; message: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function Contact({ supportInfo, onSubmitMessage }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', msg: "Please fill out all required fields (Name, Email and Message)." });
      return;
    }

    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const response = await onSubmitMessage(formData);
      if (response.success) {
        setStatus({
          type: 'success',
          msg: response.message || "Message sent successfully! Our beauty advisor will respond to you soon."
        });
        setFormData({ name: "", phone: "", email: "", message: "" });
      } else {
        setStatus({
          type: 'error',
          msg: response.error || "Failed to deliver message. Please check the network and try again."
        });
      }
    } catch {
      setStatus({ type: 'error', msg: "An error occurred. Action timed out." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-500 font-semibold uppercase tracking-widest text-xs">Always Welcoming</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2 mb-4">Contact Beaution Desk</h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6" />
          <p className="text-stone-500 font-light text-sm text-balance">
            Have questions about bridal customization, stylist travel slots, or event package rates? Message us directly or choose any quick support support channel below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Quick Support channels (Left column) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-stone-950">Luxury Headquarters</h2>
              <div className="w-12 h-0.5 bg-rose-300 mb-6" />

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-1">Studio Address</h4>
                  <p className="text-stone-700 text-sm leading-relaxed">{supportInfo.location}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-1">Call Booking Desk</h4>
                  <p className="text-stone-700 text-sm font-semibold">{supportInfo.contactNumber}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-1">Email support</h4>
                  <p className="text-stone-700 text-sm font-semibold">{supportInfo.email}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-1">Studio timings</h4>
                  <p className="text-stone-700 text-sm leading-relaxed font-light">{supportInfo.supportTiming}</p>
                </div>
              </div>
            </div>

            {/* Quick action buttons block */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${supportInfo.whatsappNumber}?text=Hi%20Beaution!%20I'd%20like%20to%20inquire%20about%20makeup%20services.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-sm text-sm font-bold transition-all text-center"
              >
                <MessageSquare className="w-4 h-4" /> Whatsapp Support
              </a>
              <a
                href={`tel:${supportInfo.contactNumber}`}
                className="flex items-center justify-center gap-2.5 p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-sm text-sm font-bold transition-all text-center"
              >
                <Phone className="w-4 h-4 animate-bounce" /> Call Now Desk
              </a>
            </div>
          </div>

          {/* Contact and message form (Right column) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Send customer message</h2>
              <p className="text-stone-400 font-light text-xs sm:text-sm mb-6">
                All messages are scanned and registered securely. We respond within 2-4 working hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Your Full Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light"
                      placeholder="e.g. Kareena Kapoor"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Your Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light"
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Your Message / Query *</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light resize-none"
                    placeholder="Describe your event date, required slots, skin details, or booking questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                {status.type && (
                  <div className={`p-4 rounded-xl text-xs flex gap-2 items-center ${
                    status.type === 'success' ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                  }`}>
                    {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{status.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-stone-900 text-white font-semibold hover:bg-rose-500 hover:shadow-md transition-colors text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  {loading ? "Transmitting..." : <>Send Message <Send className="w-3.5 h-3.5" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
