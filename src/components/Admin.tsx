import React, { useState, useEffect } from "react";
import { Lock, Sparkles, LogOut, TrendingUp, DollarSign, CalendarCheck, HelpCircle, Users, Plus, Edit2, Trash2, Mail, CheckCircle2, ShieldAlert, PhoneCall, Gift, Settings, PlusCircle, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Package, Booking, CustomerMessage, SupportContact } from "../types";

interface AdminProps {
  services: Service[];
  packages: Package[];
  supportInfo: SupportContact;
  onRefreshAllData: () => Promise<void>;
  onLogin: (password: string) => Promise<{ success: boolean; token?: string; error?: string }>;
}

export default function Admin({ services, packages, supportInfo, onRefreshAllData, onLogin }: AdminProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem("beaution_admin_token"));
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  // Active Admin Panel Tab (analytics, services, packages, bookings, messages, contacts)
  const [activeTab, setActiveTab] = useState("analytics");
  const [analytics, setAnalytics] = useState<any>({
    totalSales: 0,
    totalBookings: 0,
    revenue: 0,
    customerSatisfaction: 98,
    recentBookings: [],
    salesByService: []
  });

  // Data registers
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [messagesList, setMessagesList] = useState<CustomerMessage[]>([]);
  
  // Settings or forms editing registers
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", originalPrice: "", offerPrice: "", image: "makeup_setup" });
  const [packageForm, setPackageForm] = useState({ name: "", price: "", discount: "", badge: "", services: "" });
  const [manualBookingForm, setManualBookingForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", date: "", time: "", selectedName: "", amountPaid: "" });
  const [supportEditForm, setSupportEditForm] = useState({ dealerName: "", contactNumber: "", email: "", location: "", supportTiming: "", whatsappNumber: "" });
  
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionSuccessText, setActionSuccessText] = useState("");

  // Fetch full live admin dashboard feeds
  const fetchAdminFeeds = async () => {
    if (!sessionToken) return;
    try {
      const headers = { "Authorization": `Bearer ${sessionToken}` };
      
      // Fetch dynamic analytical statistics
      const r1 = await fetch("/api/admin/analytics", { headers });
      if (r1.ok) {
        const d1 = await r1.json();
        setAnalytics(d1);
        setBookingsList(d1.recentBookings || []);
      }
      
      // Fetch messages list
      const r2 = await fetch("/api/messages", { headers });
      if (r2.ok) {
        const d2 = await r2.json();
        setMessagesList(d2 || []);
      }
    } catch {
      console.log("Could not load secure dashboard metrics.");
    }
  };

  useEffect(() => {
    if (sessionToken) {
      fetchAdminFeeds();
      // Synchronize support edit structure initial values
      setSupportEditForm({
        dealerName: supportInfo.dealerName,
        contactNumber: supportInfo.contactNumber,
        email: supportInfo.email,
        location: supportInfo.location,
        supportTiming: supportInfo.supportTiming,
        whatsappNumber: supportInfo.whatsappNumber
      });
    }
  }, [sessionToken, supportInfo]);

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setAuthenticating(true);

    try {
      const result = await onLogin(adminPassword);
      if (result.success && result.token) {
        localStorage.setItem("beaution_admin_token", result.token);
        setSessionToken(result.token);
        setAdminPassword("");
      } else {
        setLoginError(result.error || "Password matched failed. Unauthorized.");
      }
    } catch {
      setLoginError("Credentials system verification failed.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("beaution_admin_token");
    setSessionToken(null);
  };

  // CRUD on SERVICES
  const handleServiceCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionSuccessText("");

    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`
      };

      let method = "POST";
      let url = "/api/services";

      if (updatingId) {
        method = "PUT";
        url = `/api/services/${updatingId}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(serviceForm)
      });

      if (res.ok) {
        setActionSuccessText(updatingId ? "Service updated successfully!" : "New service added successfully!");
        setServiceForm({ title: "", description: "", originalPrice: "", offerPrice: "", image: "makeup_setup" });
        setUpdatingId(null);
        await onRefreshAllData();
        await fetchAdminFeeds();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to finalize service catalog.");
      }
    } catch {
      alert("Error contacting API endpoint.");
    } finally {
      setLoadingAction(false);
    }
  };

  const editServiceSetup = (srv: Service) => {
    setUpdatingId(srv.id);
    setServiceForm({
      title: srv.title,
      description: srv.description,
      originalPrice: String(srv.originalPrice),
      offerPrice: String(srv.offerPrice),
      image: srv.image
    });
  };

  const deleteServiceHandler = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this service? All linked records will remain untouched.")) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        await onRefreshAllData();
        await fetchAdminFeeds();
        alert("Service deleted successfully.");
      }
    } catch {
      alert("Removal failure.");
    }
  };

  // CRUD on PACKAGES/OFFERS
  const handlePackageCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionSuccessText("");

    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`
      };

      let method = "POST";
      let url = "/api/offers";

      if (updatingId) {
        method = "PUT";
        url = `/api/offers/${updatingId}`;
      }

      const payload = {
        name: packageForm.name,
        price: Number(packageForm.price),
        discount: Number(packageForm.discount),
        badge: packageForm.badge,
        services: packageForm.services.split(",").map(s => s.trim())
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setActionSuccessText(updatingId ? "Combo deal updated successfully!" : "New combo pack seeded successfully!");
        setPackageForm({ name: "", price: "", discount: "", badge: "", services: "" });
        setUpdatingId(null);
        await onRefreshAllData();
        await fetchAdminFeeds();
      } else {
        alert("Problem committing packet deal.");
      }
    } catch {
      alert("API Error.");
    } finally {
      setLoadingAction(false);
    }
  };

  const editPackageSetup = (pkg: Package) => {
    setUpdatingId(pkg.id);
    setPackageForm({
      name: pkg.name,
      price: String(pkg.price),
      discount: String(pkg.discount),
      badge: pkg.badge,
      services: pkg.services.join(", ")
    });
  };

  const deletePackageHandler = async (id: string) => {
    if (!window.confirm("Remove this expired package deal?")) return;
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        await onRefreshAllData();
        await fetchAdminFeeds();
        alert("Package deleted.");
      }
    } catch {
      alert("Error removing pac.");
    }
  };

  // Offline walkin customer booking
  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionSuccessText("");

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify(manualBookingForm)
      });

      if (res.ok) {
        setActionSuccessText("Offline walk-in guest registered successfully!");
        setManualBookingForm({ customerName: "", customerEmail: "", customerPhone: "", date: "", time: "", selectedName: "", amountPaid: "" });
        await fetchAdminFeeds();
      } else {
        alert("Walk-in registration fails.");
      }
    } catch {
      alert("Failure.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Dealer timing support editing
  const handleSupportUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionSuccessText("");

    try {
      const response = await fetch("/api/support", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify(supportEditForm)
      });
      if (response.ok) {
        setActionSuccessText("Dealer contact, locations, support hours updated successfully!");
        await onRefreshAllData();
        await fetchAdminFeeds();
      } else {
        alert("Failed to edit support variables.");
      }
    } catch {
      alert("Error processing updates.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Client Msg Spam delete
  const deleteClientMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        await fetchAdminFeeds();
        alert("Message thread deleted from active indices.");
      }
    } catch {
      alert("Delete transaction failed.");
    }
  };


  // --- LOGIN PANEL PORTAL ---
  if (!sessionToken) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center bg-stone-50 py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-100 shadow-xl"
        >
          <div className="text-center mb-8">
            <span className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </span>
            <h1 className="font-serif font-black text-2xl text-stone-900 uppercase tracking-tight">Beaution Admin</h1>
            <p className="text-stone-400 text-xs mt-1">Provide secure credential codes to access CRM dashboard</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5" id="admin_login_form">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Director Email *</label>
              <input
                type="email"
                placeholder="admin@beaution.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                defaultValue="admin@beaution.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase mb-2 font-mono">Authentication Code / Password *</label>
              <input
                type="password"
                placeholder="Enter password (default: admin123)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono"
                required
              />
            </div>

            {loginError && (
              <p className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={authenticating}
              id="admin_signin_btn"
              className="w-full py-3 rounded-full bg-stone-900 text-white hover:bg-rose-500 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              {authenticating ? "Verifying..." : "Sign in CRM"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- CRM AUTHENTICATED PANEL ---
  return (
    <div className="w-full bg-stone-100 min-h-[90vh]">
      {/* CRM Ribbon Subheader */}
      <div className="bg-stone-950 text-white px-4 py-4 sm:py-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-stone-950 rounded-full">
              CRM DIRECTORY
            </span>
            <h1 className="font-serif font-black text-xl tracking-tight uppercase">
              Beaution CRM Systems
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-white/20 bg-white/5 hover:bg-rose-500/10 hover:border-rose-400 text-rose-300 hover:text-rose-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out CRM
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Analytics Top Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/40 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-xs block uppercase font-semibold">Total revenue</span>
              <strong className="text-stone-900 text-xl sm:text-2xl font-black block mt-1 font-mono">
                ₹{analytics.revenue.toLocaleString()}
              </strong>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/40 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-xs block uppercase font-semibold">Reservations Log</span>
              <strong className="text-stone-900 text-xl sm:text-2xl font-black block mt-1 font-mono">
                {analytics.totalBookings} slots
              </strong>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/40 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-xs block uppercase font-semibold">Message Index</span>
              <strong className="text-stone-900 text-xl sm:text-2xl font-black block mt-1 font-mono">
                {messagesList.length} threads
              </strong>
            </div>
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-500 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100/40 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-xs block uppercase font-semibold">Client Satisfaction</span>
              <strong className="text-stone-900 text-xl sm:text-2xl font-black block mt-1 font-mono">
                {analytics.customerSatisfaction}% Rating
              </strong>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action success messaging overlay */}
        {actionSuccessText && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccessText}</span>
            </div>
            <button onClick={() => setActionSuccessText("")} className="font-bold underline text-[10px] uppercase">Dismiss</button>
          </div>
        )}

        {/* MAIN CRUD SLATE WORKSPACE WITH SIDEBAR CONTROLBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CRM Navigation Panel */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: "analytics", label: "Consultation Log", icon: <CalendarCheck className="w-4 h-4" /> },
              { id: "services", label: "Manage Services", icon: <PlusCircle className="w-4 h-4" /> },
              { id: "packages", label: "Offers & combos", icon: <Gift className="w-4 h-4" /> },
              { id: "messages", label: "Spam & Messages", icon: <Mail className="w-4 h-4 text-rose-500" /> },
              { id: "contacts", label: "Dealer timings", icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActionSuccessText(""); setUpdatingId(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase transition-all tracking-wider text-left ${
                  activeTab === tab.id
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* CRM Content Workspace (Right Columns) */}
          <div className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/60 shadow-sm min-h-[60vh]">
            
            {/* TAB: SECURE CONSULTATION BOOKINGS */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-50 pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">Consultation Bookings</h2>
                    <p className="text-zinc-400 text-xs sm:text-sm font-light">Add walk-ins or view live customer online slots</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("add_walkin"); }}
                    className="px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-stone-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Walk-In Slot
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase">
                        <th className="py-3 px-2">Id / Receipt</th>
                        <th className="py-3 px-2">Client Name</th>
                        <th className="py-3 px-2">Chosen Service/Pkg</th>
                        <th className="py-3 px-2">Date & hour</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsList.map((bk) => (
                        <tr key={bk.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-2 font-mono">
                            <span className="block font-bold text-stone-800">{bk.receiptNo}</span>
                            <span className="text-[10px] text-stone-400">{bk.paymentMethod}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold text-stone-900">{bk.customerName}</p>
                            <span className="text-[10px] text-stone-400 block">{bk.customerPhone}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-1 rounded bg-stone-100 text-stone-700 font-semibold uppercase text-[9px]">
                              {bk.selectedName}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-rose-500 font-semibold">{bk.date} @ {bk.time}</td>
                          <td className="py-3.5 px-2 font-mono font-bold">₹{bk.amountPaid.toLocaleString()}</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px]">
                              {bk.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SERVICES CRUD */}
            {activeTab === "services" && (
              <div className="space-y-8">
                <div className="border-b border-rose-50 pb-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    {updatingId ? "Edit Makeup service structure" : "Create New Makeup service"}
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm font-light">Structure service directory and edit pricing details</p>
                </div>

                {/* Create/Edit Form */}
                <form onSubmit={handleServiceCreateOrUpdate} className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Service Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Airbrush Bridal Makeup"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Image mapping key *</label>
                      <select
                        value={serviceForm.image}
                        onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      >
                        <option value="bridal_makeup">Bridal Makeup Image</option>
                        <option value="glam_makeup">Party Glam Makeup Image</option>
                        <option value="makeup_setup">Makeup Setup/Brushes Image</option>
                        <option value="hero_makeup_model">Hero Makeup Model Portrait</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-mono">Original Price (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 15000"
                        value={serviceForm.originalPrice}
                        onChange={(e) => setServiceForm({ ...serviceForm, originalPrice: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-mono">Offer Price (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 11999"
                        value={serviceForm.offerPrice}
                        onChange={(e) => setServiceForm({ ...serviceForm, offerPrice: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Inclusions Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Complete HD transformation, includes 3D mink eyelashes, skin prep and settings lock"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-6 py-2.5 bg-stone-900 text-white hover:bg-rose-500 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      {updatingId ? "Update service details" : "Register service"}
                    </button>
                    {updatingId && (
                      <button
                        type="button"
                        onClick={() => { setUpdatingId(null); setServiceForm({ title: "", description: "", originalPrice: "", offerPrice: "", image: "makeup_setup" }); }}
                        className="px-4 py-2.5 bg-stone-200 text-stone-600 hover:bg-stone-350 rounded-full text-xs uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Services Directory index table */}
                <div className="border-t border-rose-50 pt-6">
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-4">Active service Directory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((srv) => (
                      <div key={srv.id} className="p-4 border border-rose-100 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:border-rose-300">
                        <div>
                          <strong className="text-sm font-serif font-extrabold text-stone-900 block">{srv.title}</strong>
                          <span className="text-xs text-rose-500 block font-mono">
                            ₹{srv.offerPrice.toLocaleString()} <span className="text-stone-400 line-through">₹{srv.originalPrice.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="flex gap-2 text-stone-500 shrink-0">
                          <button onClick={() => editServiceSetup(srv)} className="p-2 hover:bg-stone-100 rounded-lg text-amber-600"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteServiceHandler(srv.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PACKAGES/OFFERS COMBOS */}
            {activeTab === "packages" && (
              <div className="space-y-8">
                <div className="border-b border-rose-50 pb-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    {updatingId ? "Edit beauty package price" : "Create New Combo package"}
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm font-light font-light">Bundle makeup styles, set bundle discounts and limited validity tags</p>
                </div>

                {/* Packages Create OR edit Form */}
                <form onSubmit={handlePackageCreateOrUpdate} className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Package Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Diamond Bridal VIP Combo"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Countdown validity Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP Royal Treatment"
                        value={packageForm.badge}
                        onChange={(e) => setPackageForm({ ...packageForm, badge: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-mono">Discount price (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 19999"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-mono">Discount Percent (%) </label>
                      <input
                        type="number"
                        placeholder="e.g. 35"
                        value={packageForm.discount}
                        onChange={(e) => setPackageForm({ ...packageForm, discount: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Included Services (Comma separated strings) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Airbrush Makeup, Hair Styling, Lash extensions, Hydration Serum"
                      value={packageForm.services}
                      onChange={(e) => setPackageForm({ ...packageForm, services: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-6 py-2.5 bg-stone-900 text-white hover:bg-rose-500 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      {updatingId ? "Update combo pack" : "Publish combo package"}
                    </button>
                    {updatingId && (
                      <button
                        type="button"
                        onClick={() => { setUpdatingId(null); setPackageForm({ name: "", price: "", discount: "", badge: "", services: "" }); }}
                        className="px-4 py-2.5 bg-stone-200 text-stone-600 hover:bg-stone-350 rounded-full text-xs uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Packages listings */}
                <div className="border-t border-rose-50 pt-6">
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-4">Combos & Tiers Registry</h3>
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="p-4 border border-rose-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm gap-4 hover:border-rose-300">
                        <div>
                          <strong className="text-sm font-serif font-extrabold text-stone-900 block">{pkg.name}</strong>
                          <span className="text-xs text-rose-500 font-mono block">₹{pkg.price.toLocaleString()} ({pkg.discount}% savings)</span>
                          <span className="text-[10px] text-stone-400 mt-1 block font-light">Services: {pkg.services.join(", ")}</span>
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <button onClick={() => editPackageSetup(pkg)} className="p-2 hover:bg-stone-100 rounded-lg text-amber-600"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deletePackageHandler(pkg.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MANUAL GUEST LOG ADD */}
            {activeTab === "add_walkin" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-rose-50 pb-3">
                  <button onClick={() => setActiveTab("analytics")} className="text-xs underline text-stone-500 hover:text-rose-500">&lt; Back To bookings</button>
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Register Manuel Walk-In Client</h2>
                
                <form onSubmit={handleManualBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Client Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Juhi Chawla"
                        value={manualBookingForm.customerName}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, customerName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Phone Contact</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={manualBookingForm.customerPhone}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, customerPhone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Appointment Date (YYYY-MM-DD) *</label>
                      <input
                        type="date"
                        required
                        value={manualBookingForm.date}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Appointment Hour Slot (HH:MM) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 14:30"
                        value={manualBookingForm.time}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-sans">Service/Combo Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Custom Bridal Look"
                        value={manualBookingForm.selectedName}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, selectedName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5 font-mono">Amount Received (₹) </label>
                      <input
                        type="number"
                        placeholder="e.g. 11999"
                        value={manualBookingForm.amountPaid}
                        onChange={(e) => setManualBookingForm({ ...manualBookingForm, amountPaid: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-6 py-3 bg-stone-900 hover:bg-rose-500 text-white font-bold rounded-full text-xs uppercase tracking-widest"
                  >
                    Register offline booking
                  </button>
                </form>
              </div>
            )}

            {/* TAB: BROWSE CLIENT MESSAGE threads */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 border-b border-rose-50 pb-2">Client Inquiry Letters</h2>
                  <p className="text-stone-400 text-xs sm:text-sm mt-1">Review user submissions or delete spam threads</p>
                </div>

                <div className="space-y-4">
                  {messagesList.length > 0 ? (
                    messagesList.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-5 rounded-3xl border flex flex-col justify-between bg-stone-50 ${
                          msg.status === 'Spam' ? "border-rose-200 bg-rose-50/10 opacity-70" : "border-stone-100"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <strong className="text-sm font-serif font-extrabold text-stone-900">{msg.name}</strong>
                            <span className="text-[10px] text-stone-400 block font-mono">{msg.email} | {msg.phone}</span>
                          </div>
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${
                            msg.status === 'Spam' ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-stone-600 text-xs font-light tracking-wide mt-3 leading-relaxed">
                          {msg.message}
                        </p>
                        <div className="flex justify-between items-center border-t border-stone-100 pt-3 mt-4 text-[10px] text-stone-400">
                          <span className="font-mono">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => deleteClientMessage(msg.id)}
                            className="text-rose-500 flex items-center gap-1 hover:underline font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Thread
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-stone-400">
                      <Mail className="w-12 h-12 mx-auto mb-3" /> No client message logs found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CONTACT SETTINGSTIMINGS */}
            {activeTab === "contacts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 border-b border-rose-50 pb-2">Dealer and timetables Update</h2>
                  <p className="text-stone-400 text-xs sm:text-sm mt-1">Configure physical addresses, phone lines, and operating schedules</p>
                </div>

                <form onSubmit={handleSupportUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Business / Dealer Name *</label>
                    <input
                      type="text"
                      required
                      value={supportEditForm.dealerName}
                      onChange={(e) => setSupportEditForm({ ...supportEditForm, dealerName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Contact Number *</label>
                      <input
                        type="text"
                        required
                        value={supportEditForm.contactNumber}
                        onChange={(e) => setSupportEditForm({ ...supportEditForm, contactNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">WhatsApp Number (e.g. 919342956011) *</label>
                      <input
                        type="text"
                        required
                        value={supportEditForm.whatsappNumber}
                        onChange={(e) => setSupportEditForm({ ...supportEditForm, whatsappNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Studio Support Email *</label>
                      <input
                        type="email"
                        required
                        value={supportEditForm.email}
                        onChange={(e) => setSupportEditForm({ ...supportEditForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Support hours text *</label>
                      <input
                        type="text"
                        required
                        value={supportEditForm.supportTiming}
                        onChange={(e) => setSupportEditForm({ ...supportEditForm, supportTiming: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-1.5">Physical Studio Location *</label>
                    <textarea
                      rows={2}
                      required
                      value={supportEditForm.location}
                      onChange={(e) => setSupportEditForm({ ...supportEditForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-6 py-3 bg-stone-900 hover:bg-rose-500 text-white font-bold rounded-full text-xs uppercase tracking-widest"
                  >
                    Save timings changes
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
