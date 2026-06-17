import React, { useState } from "react";
import { X, Calendar, Clock, User, Phone, Mail, CreditCard, ShieldCheck, CheckCircle, Sparkles, Printer, ArrowRight, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { Service, Package } from "../types";

interface BookModalProps {
  onClose: () => void;
  selectedItem: { type: 'service' | 'package'; id: string; name: string; price: number } | null;
  services: Service[];
  packages: Package[];
  onFormSubmit: (data: any) => Promise<{ success: boolean; booking?: any; message?: string; error?: string }>;
  customer?: { name: string; email: string; phone: string } | null;
}

export default function BookModal({ onClose, selectedItem, services, packages, onFormSubmit, customer }: BookModalProps) {
  const [step, setStep] = useState(1); // 1: Service details, 2: Info form, 3: Payment select, 4: Receipt screen
  
  // Form values
  const [choiceType, setChoiceType] = useState<'service' | 'package'>(selectedItem?.type || 'service');
  const [itemId, setItemId] = useState<string>(selectedItem?.id || services[0]?.id || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [custName, setCustName] = useState(customer?.name || "");
  const [custPhone, setCustPhone] = useState(customer?.phone || "");
  const [custEmail, setCustEmail] = useState(customer?.email || "");
  
  // Payment selected
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [netBank, setNetBank] = useState("SBI");
  const [processing, setProcessing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Dynamic values computation
  const getSelectedDetails = () => {
    if (choiceType === 'service') {
      const s = services.find((srv) => srv.id === itemId);
      return { name: s?.title || "Custom Treatment", price: s?.offerPrice || 0 };
    } else {
      const p = packages.find((pkg) => pkg.id === itemId);
      return { name: p?.name || "Custom combo Pack", price: p?.price || 0 };
    }
  };

  const activeDetails = getSelectedDetails();

  // Navigation handlers
  const handleNextStep = () => {
    setErrorText("");
    if (step === 1) {
      if (!itemId || !date || !time) {
        setErrorText("Please select your beauty service, consultation date and appointment hour slot first.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!custName || !custEmail || !custPhone) {
        setErrorText("Full Name, active email and mobile number are mandatory to dispatch confirmation receipts.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorText("");
    setStep((prev) => prev - 1);
  };

  // Process Mock Checkout
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setProcessing(true);

    // Run dynamic basic sanitization checks
    if (paymentMethod === "UPI" && !upiId.includes("@")) {
      setErrorText("Please write a complete valid UPI ID handle (e.g. name@upi).");
      setProcessing(false);
      return;
    }
    if (paymentMethod === "Card" && (cardNumber.replace(/\s/g, "").length < 15 || !cardExpiry || !cardCvv)) {
      setErrorText("Please enter a valid credit/debit card number, expiry date, and CVV code.");
      setProcessing(false);
      return;
    }

    try {
      const finalPayload = {
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        date,
        time,
        serviceId: choiceType === 'service' ? itemId : undefined,
        packageId: choiceType === 'package' ? itemId : undefined,
        selectedName: activeDetails.name,
        amountPaid: activeDetails.price,
        paymentMethod
      };

      const res = await onFormSubmit(finalPayload);
      if (res.success && res.booking) {
        setBookingResult(res.booking);
        setStep(4);
      } else {
        setErrorText(res.error || "Payment verification failed. Please try a different card/UPI mode.");
      }
    } catch {
      setErrorText("Check connection timeout. API unavailable.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Hour options for beauty studio scheduling
  const availableHours = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center z-55 p-4 overflow-y-auto" id="booking_modal">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-rose-100 flex flex-col my-8"
      >
        {/* Modal Top Ribbon Header */}
        <div className="bg-stone-950 text-white p-6 relative">
          <button
            onClick={onClose}
            id="close_modal_btn"
            className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="font-serif font-black text-xl tracking-tight uppercase">
              {step <= 3 ? "Secure Booking Portal" : "Appointment Confirmed"}
            </h2>
          </div>
          
          {step <= 3 && (
            <div className="flex gap-2.5 mt-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-grow h-1.5 rounded-full transition-all duration-300 ${
                    s <= step ? "bg-amber-400" : "bg-stone-800"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal core forms container */}
        <div className="p-6 sm:p-8 flex-grow">
          {errorText && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs mb-6 font-semibold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" /> {errorText}
            </div>
          )}

          {/* STEP 1: SERVICE & TIME SLOT CHOOSE */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-rose-50 pb-2">Step 1: Choose Makeover</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setChoiceType('service'); setItemId(services[0]?.id || ""); }}
                  className={`py-3 rounded-2xl text-xs font-bold uppercase border-2 transition-all ${
                    choiceType === 'service'
                      ? "border-rose-400 bg-rose-50/20 text-rose-600 font-extrabold"
                      : "border-stone-100 hover:border-stone-300 text-stone-500"
                  }`}
                >
                  Single Service
                </button>
                <button
                  type="button"
                  onClick={() => { setChoiceType('package'); setItemId(packages[0]?.id || ""); }}
                  className={`py-3 rounded-2xl text-xs font-bold uppercase border-2 transition-all ${
                    choiceType === 'package'
                      ? "border-rose-400 bg-rose-50/20 text-rose-600 font-extrabold"
                      : "border-stone-100 hover:border-stone-300 text-stone-500"
                  }`}
                >
                  Combo Pack Deal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Select Item *</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {choiceType === 'service' ? (
                    services.map((s) => (
                      <option key={s.id} value={s.id}>{s.title} (₹{s.offerPrice.toLocaleString()})</option>
                    ))
                  ) : (
                    packages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price.toLocaleString()})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Consultation Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Time picker list */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Appointment hour slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableHours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTime(h)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono border transition-all ${
                        time === h
                          ? "bg-stone-900 border-stone-900 text-white font-bold"
                          : "bg-white border-stone-200 hover:border-stone-400 text-stone-600"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-rose-50">
                <div>
                  <span className="text-zinc-400 text-stone-400 text-xs block">Estimated Amount:</span>
                  <span className="text-rose-500 font-extrabold text-lg">₹{activeDetails.price.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-stone-950 text-white hover:bg-rose-500 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION FORM */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-rose-50 pb-2">Step 2: Customer Details</h3>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  Your Full Name *
                  {customer?.name && <span className="ml-2 text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wider uppercase font-mono">✓ Recognized</span>}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Madhuri Dixit"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light ${
                      customer?.name ? "bg-emerald-50/10 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-stone-800 dark:text-stone-100" : "border-stone-200 dark:border-stone-700"
                    }`}
                    required
                    disabled={!!customer?.name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  WhatsApp / Phone *
                  {customer?.phone && <span className="ml-2 text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wider uppercase font-mono">✓ OTP Verified</span>}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light ${
                      customer?.phone ? "bg-emerald-50/10 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-stone-800 dark:text-stone-100 font-mono" : "border-stone-200 dark:border-stone-700"
                    }`}
                    required
                    disabled={!!customer?.phone}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  Email Address *
                  {customer?.email && <span className="ml-2 text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wider uppercase font-mono">✓ Sync Completed</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="e.g. support@beaution.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-light ${
                      customer?.email ? "bg-emerald-50/10 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-stone-800 dark:text-stone-100" : "border-stone-200 dark:border-stone-700"
                    }`}
                    required
                    disabled={!!customer?.email}
                  />
                </div>
              </div>

              {/* Inclusions Recap card */}
              <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl text-xs space-y-1 text-stone-600">
                <span className="font-semibold block text-stone-800">Booking Summary:</span>
                <p>Selected Stylist Action: <strong>{activeDetails.name}</strong></p>
                <p>Consult Date: <strong>{date}</strong> | Slot time: <strong>{time}</strong></p>
              </div>

              <div className="pt-4 flex justify-between border-t border-rose-50">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-stone-200 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-stone-950 hover:bg-rose-500 text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  Go to Payments <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MOCK CHECKOUT PAYMENT FORM */}
          {step === 3 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-rose-50 pb-2">Step 3: Secure Payment Gateway</h3>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "UPI", label: "UPI (Paytm/GPay)", icon: <Wallet className="w-3.5 h-3.5" /> },
                  { id: "Card", label: "Cards", icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: "NetBank", label: "NetBanking", icon: <Clock className="w-3.5 h-3.5" /> },
                ].map((pMode) => (
                  <button
                    key={pMode.id}
                    type="button"
                    onClick={() => setPaymentMethod(pMode.id)}
                    className={`py-3 px-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === pMode.id
                        ? "border-amber-400 bg-gold-50/30 text-amber-600 font-extrabold"
                        : "border-stone-100 hover:border-stone-200 text-stone-500"
                    }`}
                  >
                    {pMode.icon}
                    {pMode.label}
                  </button>
                ))}
              </div>

              {/* Sub payment configurations inputs */}
              {paymentMethod === "UPI" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Secure UPI ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@paytm, customer@okhdfc"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-mono"
                  />
                  <span className="text-[10px] text-stone-400 block">UPI payment will redirect to your mobile app for authentication mock verification.</span>
                </div>
              )}

              {paymentMethod === "Card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4320 9012 3012 8821"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">CVV Security Code *</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="e.g. •••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "NetBank" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">Choose Net Bank Portal *</label>
                  <select
                    value={netBank}
                    onChange={(e) => setNetBank(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC bank portal</option>
                    <option value="ICICI">ICICI Corporate Bank</option>
                    <option value="AXIS">Axis retail vault</option>
                  </select>
                </div>
              )}

              {/* Secure Trust indicators */}
              <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-[10px] text-stone-500">
                  <p className="font-semibold text-stone-800 uppercase">SSL Certified Encryption Secured</p>
                  <p>Transactions are routed through a secure, hashed beauty escrow platform. No credit details are stored.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between border-t border-rose-50 items-center">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-stone-200 rounded-full text-xs font-semibold text-stone-650 hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-stone-950 font-bold uppercase tracking-wider text-xs rounded-full hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {processing ? "Authorizing..." : `Securely Pay ₹${activeDetails.price.toLocaleString()}`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: GENERATE BOOKING CONFIRMATION RECEIPT */}
          {step === 4 && bookingResult && (
            <div className="space-y-6 pt-2" id="printable_receipt_block">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-100">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-black text-2xl text-stone-950">Look Confirmed!</h3>
                <p className="text-stone-400 text-xs mt-1">Receipt generated under ID: {bookingResult.id}</p>
              </div>

              {/* Real Print Receipt Template styling */}
              <div className="border border-dashed border-stone-300 rounded-3xl p-6 bg-stone-50 outline outline-offset-4 outline-transparent" id="receipt_frame">
                <div className="flex justify-between items-start border-b border-dashed border-stone-200 pb-4">
                  <div>
                    <h4 className="font-serif font-extrabold text-stone-900 text-lg uppercase">Beaution</h4>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Luxurious Salon Hub & Artists</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-stone-800">{bookingResult.receiptNo}</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Receipt Issued No.</span>
                  </div>
                </div>

                <div className="py-4 space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Scheduled Guest Client:</span>
                    <strong className="text-stone-800 font-semibold">{bookingResult.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Contact Email:</span>
                    <strong className="text-stone-800 font-normal">{bookingResult.customerEmail}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mobile Phone:</span>
                    <strong className="text-stone-800 font-normal">{bookingResult.customerPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Booking Date & Time:</span>
                    <strong className="text-rose-500 font-bold">{bookingResult.date} at {bookingResult.time} IST</strong>
                  </div>
                  
                  <div className="h-px bg-stone-200 my-2" />

                  <div className="flex justify-between">
                    <span className="text-stone-500">Item Reserved:</span>
                    <strong className="text-stone-800 font-bold">{bookingResult.selectedName}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-500">Amount Charged Mock Paid:</span>
                    <strong className="text-stone-900 font-extrabold">₹{bookingResult.amountPaid.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Gateway/Mode:</span>
                    <strong className="text-emerald-600 font-bold uppercase">{bookingResult.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Status Code:</span>
                    <strong className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase text-[10px]">
                      {bookingResult.paymentStatus}
                    </strong>
                  </div>
                </div>

                <div className="border-t border-dashed border-stone-200 pt-4 text-center">
                  <p className="text-[10px] text-stone-400 leading-normal">
                    Please show this receipt or confirmation message at reception upon entry. Thank you for choosing Beaution!
                  </p>
                </div>
              </div>

              {/* Action buttons on receipt */}
              <div className="flex gap-4 shrink-0 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-grow py-3 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-grow py-3 px-4 bg-stone-950 text-white rounded-xl font-semibold text-xs uppercase tracking-wider text-center hover:bg-stone-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
