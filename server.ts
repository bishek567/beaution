import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Google Search Console site verification endpoint
app.get("/google08889434b9c01c68.html", (req: Request, res: Response) => {
  res.send("google-site-verification: google08889434b9c01c68.html");
});

// Helper function to non-blockingly forward submissions to Formspree
async function sendToFormspree(eventType: string, data: any) {
  try {
    const payload = {
      eventType,
      submittedAt: new Date().toISOString(),
      ...data
    };
    
    // Non-blocking fire-and-forget submission to prevent latency for client operations
    globalThis.fetch("https://formspree.io/f/xlgkkbgr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(async (response) => {
      if (response.ok) {
        console.log(`[Formspree] Successfully sent event: ${eventType}`);
      } else {
        const text = await response.text();
        console.error(`[Formspree] Server responded with error status ${response.status}: ${text}`);
      }
    }).catch((err) => {
      console.error("[Formspree] Fetch network error:", err);
    });
  } catch (error) {
    console.error("[Formspree] Integration runtime error:", error);
  }
}

// Helper function to non-blockingly forward data records to Supabase table endpoints
async function sendToSupabase(table: string, payload: any, method = "POST", query = "") {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || "https://zsorsmfbxllznwestqvd.supabase.co/rest/v1/";
    const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_Yq4I-WKkQcZnGByXX4s4Cw_bO8Of4hO";
    
    let url = `${supabaseUrl.replace(/\/$/, "")}/${table}`;
    if (query) {
      url += `?${query}`;
    }
    const headers: any = {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json"
    };

    if (method === "POST") {
      headers["Prefer"] = "resolution=merge-duplicates";
    }

    console.log(`[Supabase] Sending ${method} details to route: ${url}`);
    
    // Fire-and-forget non-blocking fetch to ensure excellent client latency
    globalThis.fetch(url, {
      method,
      headers,
      body: method !== "DELETE" ? JSON.stringify(payload) : undefined
    }).then(async (response) => {
      if (response.ok) {
        console.log(`[Supabase] successfully executed ${method} on table '${table}'`);
      } else {
        const text = await response.text();
        console.warn(`[Supabase] Warning: Endpoint ${method} response status ${response.status} for table '${table}': ${text}. Please verify table schema columns in Supabase dashboard.`);
      }
    }).catch((err) => {
      console.error(`[Supabase] Connection error during ${method} to table '${table}':`, err);
    });

    return { success: true };
  } catch (error: any) {
    console.error(`[Supabase] Exception in sendToSupabase for table '${table}':`, error.message);
    return { success: false, error: error.message };
  }
}

// Define interfaces for internal db
interface DbSchema {
  admin: {
    email: string;
    passwordHash: string;
    salt: string;
    name: string;
  };
  services: any[];
  packages: any[];
  bookings: any[];
  messages: any[];
  support: any;
  customers: any[];
}

// Ensure database file exits with robust initial seed
async function initDb() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // Seed initial data
      const salt = crypto.randomBytes(16).toString("hex");
      // Password hash for admin123
      const passwordHash = crypto
        .createHash("sha256")
        .update("admin123" + salt)
        .digest("hex");

      const seedData: DbSchema = {
        admin: {
          email: "admin@beaution.com",
          passwordHash,
          salt,
          name: "Beaution Admin Portal",
        },
        services: [
          {
            id: "s1",
            title: "Bridal Makeup",
            description: "Luxury bridal transformation with premium HD cosmetics, long-lasting matte finish, gold fleck base, and customized brow styling.",
            originalPrice: 15000,
            offerPrice: 8000,
            image: "bridal_makeup", // maps to local generated asset
          },
          {
            id: "s2",
            title: "Party Makeup",
            description: "High-end glam or classic elegant party makeover complete with dynamic highlighting, defined lining, and custom contouring.",
            originalPrice: 8000,
            offerPrice: 4999,
            image: "glam_makeup",
          },
          {
            id: "s3",
            title: "HD Makeup",
            description: "Specialized ultra-defined high definition camera-ready makeup, absolute lightweight look, optimal for photographers and professional shoots.",
            originalPrice: 12000,
            offerPrice: 7999,
            image: "makeup_setup",
          },
          {
            id: "s4",
            title: "Airbrush Makeup",
            description: "Flawless, water-resistant silicone mist finish delivering a flawless velvet complexion. Highly-demanded for state-of-the-art events.",
            originalPrice: 20000,
            offerPrice: 14999,
            image: "bridal_makeup",
          },
          {
            id: "s5",
            title: "Engagement Makeup",
            description: "Sophisticated radiant highlight-rich treatment capturing dynamic freshness for modern formal photo-ops and ring ceremonies.",
            originalPrice: 10000,
            offerPrice: 6999,
            image: "glam_makeup",
          },
          {
            id: "s6",
            title: "Hair Styling",
            description: "Premium creative hairstyles ranging from luxury floral braids to custom sleek buns, volumizing updos, and expert texture curling.",
            originalPrice: 3500,
            offerPrice: 1999,
            image: "makeup_setup",
          },
          {
            id: "s7",
            title: "Saree Draping",
            description: "Masterful ethnic saree pre-pleating and neat customized draping in Classic Gujarati, Bengali, modern fishtail or South Indian style.",
            originalPrice: 2000,
            offerPrice: 999,
            image: "bridal_makeup",
          },
        ],
        packages: [
          {
            id: "p1",
            name: "Bronze Package",
            price: 7999,
            discount: 25,
            badge: "Popular For Parties",
            services: ["Party Makeup", "Hair Styling", "Saree Draping"],
          },
          {
            id: "p2",
            name: "Silver Package",
            price: 12999,
            discount: 30,
            badge: "Best Value Mini Bridal",
            services: ["Engagement Makeup", "HD Hair Styling", "Premium Draping", "Skin Prep Polish"],
          },
          {
            id: "p3",
            name: "Gold Package",
            price: 19999,
            discount: 35,
            badge: "Premium Celebrity Styling",
            services: ["HD Makeup", "Luxury Designer Haircut & Styling", "Saree Draping", "Hydrating Facial Mask", "Eyelashes Extensions"],
          },
          {
            id: "p4",
            name: "Premium Package",
            price: 29999,
            discount: 40,
            badge: "Ultimate Queen Experience",
            services: ["Airbrush HD Luxury Bridal Makeup", "Elite Royal Hair Design", "Saree Pleating & Draping", "Full Body Prep Polish", "Handmade Crystal Nail Art", "Post-Event Easy Styling Session"],
          },
        ],
        bookings: [
          {
            id: "b_seed_1",
            customerName: "Aishwarya Rai",
            customerEmail: "aishwarya@example.com",
            customerPhone: "9876543210",
            date: "2026-06-20",
            time: "10:00",
            serviceId: "s1",
            selectedName: "Bridal Makeup",
            amountPaid: 11999,
            paymentMethod: "UPI",
            paymentStatus: "Completed",
            receiptNo: "REC-93821039",
            createdAt: new Date().toISOString(),
          },
          {
            id: "b_seed_2",
            customerName: "Pooja Hegde",
            customerEmail: "pooja@example.com",
            customerPhone: "9123456780",
            date: "2026-06-25",
            time: "14:30",
            packageId: "p2",
            selectedName: "Silver Package",
            amountPaid: 12999,
            paymentMethod: "Credit Card",
            paymentStatus: "Completed",
            receiptNo: "REC-28104821",
            createdAt: new Date().toISOString(),
          },
        ],
        messages: [
          {
            id: "m_seed_1",
            name: "Sneha Sen",
            phone: "9000012345",
            email: "sneha@example.com",
            message: "Hi Beaution Team! I am planning my wedding on Dec 12th. Do you offer packages for destination weddings outside the city? Please reply of availability.",
            status: "Unread",
            createdAt: new Date().toISOString(),
          },
          {
            id: "m_seed_2",
            name: "Ravi Kumar (Spam Vendor)",
            phone: "0000000000",
            email: "spamvisitor@spammail.com",
            message: "Get cheap traffic and followers for Instagram profiles. Special discount of 80% if booked today!",
            status: "Spam",
            createdAt: new Date().toISOString(),
          },
        ],
        support: {
          dealerName: "Beaution Luxury Headquarters",
          contactNumber: "+91 93429 56011",
          email: "support@beaution.com",
          location: "7th Avenue, Luxury Plaza, MG Road, Bangalore - 560001",
          supportTiming: "Daily 9:00 AM - 9:00 PM IST",
          whatsappNumber: "919342956011",
        },
        customers: [],
      };

      await fs.writeFile(DB_FILE, JSON.stringify(seedData, null, 2), "utf-8");
      console.log("Database seeded successfully.");
    }
  } catch (err) {
    console.error("Critical: Failed to inspect or initialize JSON Database", err);
  }
}

// Read database
async function getDb(): Promise<DbSchema> {
  const rawBytes = await fs.readFile(DB_FILE, "utf-8");
  const db = JSON.parse(rawBytes);
  if (!db.customers) {
    db.customers = [];
  }
  return db;
}

// Write database atomically using temporal rename to guarantee zero corruption
async function saveDb(data: DbSchema): Promise<void> {
  const tempPath = DB_FILE + `.tmp_${crypto.randomUUID()}`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempPath, DB_FILE);
}

// Standard middlewares
app.use(express.json());

// RATE LIMITER & SECURITY FILTER FOR SENSITIVE API CALLS
const rateLimits: { [key: string]: { count: number; resetTime: number } } = {};
function sensitiveRateLimiter(limitCount: number, windowMs: number) {
  return function (req: Request, res: Response, next: NextFunction) {
    const ip = req.headers["x-forwarded-for"] || req.ip || "unknown-client";
    const ipStr = String(ip);
    const now = Date.now();
    if (!rateLimits[ipStr]) {
      rateLimits[ipStr] = { count: 1, resetTime: now + windowMs };
      return next();
    }
    if (now > rateLimits[ipStr].resetTime) {
      rateLimits[ipStr] = { count: 1, resetTime: now + windowMs };
      return next();
    }
    if (rateLimits[ipStr].count >= limitCount) {
      return res.status(429).json({
        error: "Too many attempts from this connection. Please rest a minute and try again to keep security standards safe.",
      });
    }
    rateLimits[ipStr].count++;
    next();
  };
}

// Simple Admin Authentication Middleware
async function adminAuthGate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. Auth parameters missing." });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token === "BEAUTION_SECURE_TOKEN_ADMIN_SESSION") {
    return next();
  }
  return res.status(403).json({ error: "Session token invalid or expired. Please re-authenticate." });
}

// --- API PORTAL ENDPOINTS ---

// Admin Login
app.post("/api/auth/login", sensitiveRateLimiter(10, 60000), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password components are required." });
    }

    const db = await getDb();
    if (db.admin.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({ error: "Invalid admin email or security token code." });
    }

    // Verify hashed password
    const incomingHash = crypto
      .createHash("sha256")
      .update(password + db.admin.salt)
      .digest("hex");

    if (incomingHash !== db.admin.passwordHash) {
      return res.status(401).json({ error: "Security codes do not match or password was incorrect." });
    }

    // Success response with permanent token mock for simple session management
    return res.json({
      success: true,
      token: "BEAUTION_SECURE_TOKEN_ADMIN_SESSION",
      adminUser: {
        email: db.admin.email,
        name: db.admin.name,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Authentication system error: " + err.message });
  }
});

// --- CUSTOMER OTP AND SIGN-IN ENDPOINTS ---

const activeOtps = new Map<string, { otp: string; expiresAt: number }>();

// Request mobile OTP
app.post("/api/auth/otp/generate", sensitiveRateLimiter(6, 60000), async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ error: "Please enter a valid phone number (at least 8 digits)." });
    }

    const cleanPhone = phone.trim();
    // Generate simulated 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    activeOtps.set(cleanPhone, { otp: generatedOtp, expiresAt });

    // Send OTP request record to Supabase
    sendToSupabase("otps", {
      phone: cleanPhone,
      otp: generatedOtp,
      expiresAt: new Date(expiresAt).toISOString(),
      expires_at: new Date(expiresAt).toISOString(),
      verified: false,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log(`[OTP Engine] Generated code ${generatedOtp} for customer phone ${cleanPhone}`);

    return res.json({
      success: true,
      message: "Security code dispatched successfully via simulated transmitter.",
      simulatedOtp: generatedOtp,
      expiresInSeconds: 300
    });
  } catch (err: any) {
    return res.status(500).json({ error: "OTP Transmitter failure: " + err.message });
  }
});

// Verify dynamic SMS OTP
app.post("/api/auth/otp/verify", sensitiveRateLimiter(15, 60000), async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Both phone number and OTP security code are required." });
    }

    const cleanPhone = phone.trim();
    const submittedOtp = otp.trim();

    const record = activeOtps.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ error: "No OTP transaction found for this phone number. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(cleanPhone);
      return res.status(400).json({ error: "The security OTP has expired. Please request a new code." });
    }

    if (record.otp !== submittedOtp) {
      return res.status(400).json({ error: "Incorrect verification code. Please double-check and retry." });
    }

    // OTP validated successfully! Delete it now
    activeOtps.delete(cleanPhone);

    // Sync OTP verified status to Supabase table
    sendToSupabase("otps", {
      verified: true,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, "PATCH", `phone=eq.${encodeURIComponent(cleanPhone)}`);

    const db = await getDb();
    if (!db.customers) {
      db.customers = [];
    }

    // Check if customer exists in database
    let profile = db.customers.find((c: any) => c.phone === cleanPhone);

    // If not found in customers list, try to lookup from past bookings automatically to recognize them!
    if (!profile) {
      const pastBooking = db.bookings.find((b: any) => b.customerPhone === cleanPhone);
      if (pastBooking) {
        profile = {
          name: pastBooking.customerName,
          email: pastBooking.customerEmail,
          phone: cleanPhone,
          createdAt: new Date().toISOString()
        };
        db.customers.push(profile);
        await saveDb(db);

        // Sync new profile to Supabase
        sendToSupabase("customers", {
          phone: profile.phone,
          name: profile.name,
          email: profile.email,
          createdAt: profile.createdAt,
          created_at: profile.createdAt,
          updatedAt: profile.createdAt,
          updated_at: profile.createdAt
        });
      }
    }

    // Fetch all bookings for this customer
    const bookings = db.bookings.filter((b: any) => b.customerPhone === cleanPhone);

    return res.json({
      success: true,
      isNewCustomer: !profile,
      profile: profile || { phone: cleanPhone, name: "", email: "" },
      bookings
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Verification processing issue: " + err.message });
  }
});

// Update customer profile
app.put("/api/customer/profile", async (req: Request, res: Response) => {
  try {
    const { phone, name, email } = req.body;
    if (!phone || !name || !email) {
      return res.status(400).json({ error: "Phone number, Name, and Email are fully required details." });
    }

    const cleanPhone = phone.trim();
    const db = await getDb();
    if (!db.customers) {
      db.customers = [];
    }

    const idx = db.customers.findIndex((c: any) => c.phone === cleanPhone);
    const updatedProfile = {
      phone: cleanPhone,
      name: name.trim(),
      email: email.trim(),
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      db.customers[idx] = { ...db.customers[idx], ...updatedProfile };
    } else {
      db.customers.push({
        ...updatedProfile,
        createdAt: new Date().toISOString()
      });
    }

    // Also let's update any upcoming bookings names/emails for consistency!
    db.bookings = db.bookings.map((b: any) => {
      if (b.customerPhone === cleanPhone) {
        return {
          ...b,
          customerName: name.trim(),
          customerEmail: email.trim()
        };
      }
      return b;
    });

    await saveDb(db);

    const profileData = db.customers.find((c: any) => c.phone === cleanPhone);
    // Send profile data update to Formspree link
    sendToFormspree("CUSTOMER_PROFILE_UPDATE", {
      profile: profileData
    });

    // Send profile data update to Supabase table
    sendToSupabase("customers", {
      phone: profileData.phone,
      name: profileData.name,
      email: profileData.email,
      createdAt: profileData.createdAt || new Date().toISOString(),
      created_at: profileData.createdAt || new Date().toISOString(),
      updatedAt: profileData.updatedAt || new Date().toISOString(),
      updated_at: profileData.updatedAt || new Date().toISOString()
    });

    // Re-fetch all bookings
    const bookings = db.bookings.filter((b: any) => b.customerPhone === cleanPhone);

    return res.json({
      success: true,
      profile: db.customers.find((c: any) => c.phone === cleanPhone),
      bookings
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist customer recognition profile: " + err.message });
  }
});

// Fetch latest bookings for customer
app.get("/api/customer/bookings", async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Query parameter 'phone' is required." });
    }
    const cleanPhone = String(phone).trim();
    const db = await getDb();
    const bookings = db.bookings.filter((b: any) => b.customerPhone === cleanPhone);
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: "Database search failure." });
  }
});

// CUSTOMER: UPDATE / Reschedule specific booking
app.put("/api/customer/bookings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phone, date, time, customerName, customerEmail } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Customer validation phone is required to reschedule." });
    }
    
    const db = await getDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Booking reservation not found." });
    }
    
    // Check ownership
    if (db.bookings[idx].customerPhone !== phone.trim()) {
      return res.status(403).json({ error: "Unauthorized access: Ownership check failed." });
    }
    
    // Update fields
    db.bookings[idx] = {
      ...db.bookings[idx],
      date: date || db.bookings[idx].date,
      time: time || db.bookings[idx].time,
      customerName: customerName || db.bookings[idx].customerName,
      customerEmail: customerEmail || db.bookings[idx].customerEmail,
      updatedAt: new Date().toISOString()
    };
    
    await saveDb(db);
    
    // Send rescheduled booking to Formspree
    sendToFormspree("BOOKING_RESCHEDULED", {
      booking: db.bookings[idx]
    });
    
    // Sync rescheduled booking to Supabase with PATCH
    const updatedRescheduled = db.bookings[idx];
    sendToSupabase("bookings", {
      date: updatedRescheduled.date,
      time: updatedRescheduled.time,
      customerName: updatedRescheduled.customerName,
      customer_name: updatedRescheduled.customerName,
      customerEmail: updatedRescheduled.customerEmail,
      customer_email: updatedRescheduled.customerEmail,
      updatedAt: updatedRescheduled.updatedAt,
      updated_at: updatedRescheduled.updatedAt
    }, "PATCH", `id=eq.${id}`);
    
    return res.json({ success: true, booking: db.bookings[idx], message: "Booking content revised successfully!" });
  } catch (err: any) {
    return res.status(500).json({ error: "Rescheduling processor failure: " + err.message });
  }
});

// CUSTOMER: DELETE / Cancel specific booking
app.delete("/api/customer/bookings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ error: "Customer validation phone is required to cancel reservation." });
    }
    
    const db = await getDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Booking reservation not found." });
    }
    
    // Check ownership
    if (db.bookings[idx].customerPhone !== String(phone).trim()) {
      return res.status(403).json({ error: "Unauthorized: Ownership verification failed." });
    }
    
    const cancelledBooking = db.bookings[idx];
    
    // Remove booking
    db.bookings = db.bookings.filter((b) => b.id !== id);
    await saveDb(db);
    
    // Send booking cancellation to Formspree
    sendToFormspree("BOOKING_CANCELLED", {
      cancelledBooking
    });
    
    // Sync booking cancellation to Supabase with DELETE
    sendToSupabase("bookings", null, "DELETE", `id=eq.${id}`);
    
    return res.json({ success: true, message: "Look reservation has been cancelled and slot released successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: "Cancellation transaction failure: " + err.message });
  }
});

// GET services
app.get("/api/services", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    res.json(db.services);
  } catch (err: any) {
    res.status(500).json({ error: "Database retrieval failed" });
  }
});

// CREATE service (Admin)
app.post("/api/services", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { title, description, originalPrice, offerPrice, image } = req.body;
    if (!title || !originalPrice || !offerPrice) {
      return res.status(400).json({ error: "Title, original price and offer price are mandatory parameters." });
    }
    const db = await getDb();
    const newService = {
      id: "s_" + Date.now(),
      title,
      description: description || "Professional beauty styling treatment customization.",
      originalPrice: Number(originalPrice),
      offerPrice: Number(offerPrice),
      image: image || "makeup_setup",
    };
    db.services.push(newService);
    await saveDb(db);
    res.status(201).json({ success: true, service: newService });
  } catch (err: any) {
    res.status(500).json({ error: "Could not create service: " + err.message });
  }
});

// UPDATE service (Admin)
app.put("/api/services/:id", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, originalPrice, offerPrice, image } = req.body;
    const db = await getDb();
    const serviceIndex = db.services.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: "Service record not found." });
    }

    db.services[serviceIndex] = {
      ...db.services[serviceIndex],
      title: title ?? db.services[serviceIndex].title,
      description: description ?? db.services[serviceIndex].description,
      originalPrice: originalPrice ? Number(originalPrice) : db.services[serviceIndex].originalPrice,
      offerPrice: offerPrice ? Number(offerPrice) : db.services[serviceIndex].offerPrice,
      image: image ?? db.services[serviceIndex].image,
    };

    await saveDb(db);
    res.json({ success: true, service: db.services[serviceIndex] });
  } catch (err: any) {
    res.status(500).json({ error: "Could not update service details: " + err.message });
  }
});

// DELETE service (Admin)
app.delete("/api/services/:id", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const initialLen = db.services.length;
    db.services = db.services.filter((s) => s.id !== id);
    if (db.services.length === initialLen) {
      return res.status(404).json({ error: "Service catalog item not found." });
    }
    await saveDb(db);
    res.json({ success: true, message: "Service removed from directory." });
  } catch (err: any) {
    res.status(500).json({ error: "Removal failure: " + err.message });
  }
});

// GET packages
app.get("/api/offers", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    res.json(db.packages);
  } catch (err: any) {
    res.status(500).json({ error: "Error reading service packages listing." });
  }
});

// EDIT packages/offers (Admin)
app.put("/api/offers/:id", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, discount, badge, services } = req.body;
    const db = await getDb();
    const pkgIndex = db.packages.findIndex((p) => p.id === id);
    if (pkgIndex === -1) {
      return res.status(444).json({ error: "Package was not found in register." });
    }

    db.packages[pkgIndex] = {
      ...db.packages[pkgIndex],
      name: name ?? db.packages[pkgIndex].name,
      price: price ? Number(price) : db.packages[pkgIndex].price,
      discount: discount ? Number(discount) : db.packages[pkgIndex].discount,
      badge: badge ?? db.packages[pkgIndex].badge,
      services: services ?? db.packages[pkgIndex].services,
    };

    await saveDb(db);
    res.json({ success: true, package: db.packages[pkgIndex] });
  } catch (err: any) {
    res.status(500).json({ error: "Updated failure: " + err.message });
  }
});

// POST package (Admin helper to append extra deals)
app.post("/api/offers", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { name, price, discount, badge, services } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required values." });
    }
    const db = await getDb();
    const newPkg = {
      id: "p_" + Date.now(),
      name,
      price: Number(price),
      discount: Number(discount || 0),
      badge: badge || "Special Promo",
      services: services || [],
    };
    db.packages.push(newPkg);
    await saveDb(db);
    res.status(201).json({ success: true, package: newPkg });
  } catch (err: any) {
    res.status(500).json({ error: "Package creation failed." });
  }
});

// DELETE expired offer/package
app.delete("/api/offers/:id", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.packages = db.packages.filter(p => p.id !== id);
    await saveDb(db);
    res.json({ success: true, message: "Package offer deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Could not delete offer path" });
  }
});

// CREATE Booking + Payment checkout
app.post("/api/bookings", sensitiveRateLimiter(6, 60000), async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, date, time, serviceId, packageId, selectedName, amountPaid, paymentMethod } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !date || !time || !amountPaid || !paymentMethod) {
      return res.status(400).json({ error: "Required fields include your name, email, phone, appointment date, time, and payment method selection." });
    }

    const db = await getDb();

    // Generate secure booking confirmation receipt
    const receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
    const newBooking = {
      id: "b_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      serviceId,
      packageId,
      selectedName,
      amountPaid: Number(amountPaid),
      paymentMethod,
      paymentStatus: "Completed", // Online checked mock is instant completed
      receiptNo,
      createdAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);
    await saveDb(db);

    // Send booking data to Formspree link
    sendToFormspree("NEW_BOOKING", {
      booking: newBooking
    });

    // Send booking data to Supabase table
    sendToSupabase("bookings", {
      id: newBooking.id,
      customerName: newBooking.customerName,
      customer_name: newBooking.customerName,
      customerEmail: newBooking.customerEmail,
      customer_email: newBooking.customerEmail,
      customerPhone: newBooking.customerPhone,
      customer_phone: newBooking.customerPhone,
      date: newBooking.date,
      time: newBooking.time,
      serviceId: newBooking.serviceId || "",
      service_id: newBooking.serviceId || "",
      packageId: newBooking.packageId || "",
      package_id: newBooking.packageId || "",
      selectedName: newBooking.selectedName,
      selected_name: newBooking.selectedName,
      amountPaid: Number(newBooking.amountPaid),
      amount_paid: Number(newBooking.amountPaid),
      paymentMethod: newBooking.paymentMethod,
      payment_method: newBooking.paymentMethod,
      paymentStatus: newBooking.paymentStatus,
      payment_status: newBooking.paymentStatus,
      receiptNo: newBooking.receiptNo,
      receipt_no: newBooking.receiptNo,
      createdAt: newBooking.createdAt,
      created_at: newBooking.createdAt
    });

    res.status(201).json({
      success: true,
      booking: newBooking,
      message: "Congratulations! Your slot with Beaution Makeup Studio is confirmed successfully.",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Appointment registration processor failure: " + err.message });
  }
});

// ADMIN: CREATE Bookings direct
app.post("/api/admin/bookings", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, date, time, selectedName, amountPaid, paymentStatus } = req.body;
    if (!customerName || !date || !time) {
      return res.status(400).json({ error: "Name, date, and hour time are required inputs" });
    }
    const db = await getDb();
    const receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
    const newBooking = {
      id: "b_adm_" + Date.now(),
      customerName,
      customerEmail: customerEmail || "walkin@beaution.com",
      customerPhone: customerPhone || "Walk-In-No-Phone",
      date,
      time,
      selectedName: selectedName || "Custom Salon Treatment",
      amountPaid: Number(amountPaid || 0),
      paymentMethod: "Cash/Counter",
      paymentStatus: paymentStatus || "Completed",
      receiptNo,
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(newBooking);
    await saveDb(db);
    res.json({ success: true, booking: newBooking });
  } catch (err) {
    res.status(500).json({ error: "Offline registration blocked." });
  }
});

// GET bookings (Admin list)
app.get("/api/bookings", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    res.json(db.bookings);
  } catch (err: any) {
    res.status(500).json({ error: "Access booking manifest failed: " + err.message });
  }
});

// CREATE client feedback / message submissions
app.post("/api/messages", sensitiveRateLimiter(5, 60000), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Full Name, email, and the query message contents are fully required." });
    }

    const db = await getDb();
    const newMessage = {
      id: "msg_" + Date.now(),
      name,
      phone: phone || "N/A",
      email,
      message,
      status: "Unread",
      createdAt: new Date().toISOString(),
    };

    db.messages.push(newMessage);
    await saveDb(db);

    // Send contact submission feed to Formspree
    sendToFormspree("NEW_CONTACT_MESSAGE", {
      contact: newMessage
    });

    res.json({ success: true, message: "Your message has reached Beaution care team. We will call or email you soon." });
  } catch (err: any) {
    res.status(500).json({ error: "Message system transmission error: " + err.message });
  }
});

// VIEW messages (Admin list)
app.get("/api/messages", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    res.json(db.messages);
  } catch (err) {
    res.status(500).json({ error: "Access messages failed." });
  }
});

// DELETE client message / Spam deletion (Admin)
app.delete("/api/messages/:id", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.messages = db.messages.filter((m) => m.id !== id);
    await saveDb(db);
    res.json({ success: true, message: "Client message safely deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});

// GET support settings parameters
app.get("/api/support", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    res.json(db.support);
  } catch (err) {
    res.status(500).json({ error: "Support timing access error." });
  }
});

// UPDATE support and dealer contact details (Admin)
app.put("/api/support", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const { dealerName, contactNumber, email, location, supportTiming, whatsappNumber } = req.body;
    const db = await getDb();
    db.support = {
      dealerName: dealerName || db.support.dealerName,
      contactNumber: contactNumber || db.support.contactNumber,
      email: email || db.support.email,
      location: location || db.support.location,
      supportTiming: supportTiming || db.support.supportTiming,
      whatsappNumber: whatsappNumber || db.support.whatsappNumber,
    };
    await saveDb(db);
    res.json({ success: true, support: db.support });
  } catch (err: any) {
    res.status(500).json({ error: "Contact settings edit failed: " + err.message });
  }
});

// ANALYTICS card computing data REST endpoint (Admin)
app.get("/api/admin/analytics", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const bookings = db.bookings || [];

    const totalSales = bookings.length;
    const revenue = bookings
      .filter((b) => b.paymentStatus === "Completed")
      .reduce((sum, b) => sum + Number(b.amountPaid || 0), 0);

    // Dynamic aggregation count: find service or package shares
    const frequencyDict: { [key: string]: number } = {};
    bookings.forEach((b) => {
      const name = b.selectedName || "General styling";
      frequencyDict[name] = (frequencyDict[name] || 0) + 1;
    });

    const salesByService = Object.keys(frequencyDict).map((name) => ({
      name,
      value: frequencyDict[name],
    }));

    res.json({
      totalSales,
      totalBookings: bookings.length,
      revenue,
      customerSatisfaction: 98, // Prestige customer satisfaction rating
      recentBookings: bookings.slice().reverse().slice(0, 10), // latest 10 bookings
      salesByService: salesByService.length > 0 ? salesByService : [{ name: "Bridal Makeup", value: 1 }],
    });
  } catch (err: any) {
    res.status(500).json({ error: "Could not compute live analytics summary." });
  }
});

// Admin: Retrieve Supabase connection status, settings parameters, & initialization scripts
app.get("/api/admin/supabase-status", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || "https://zsorsmfbxllznwestqvd.supabase.co/rest/v1/";
    const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_Yq4I-WKkQcZnGByXX4s4Cw_bO8Of4hO";
    const cleanUrl = supabaseUrl.replace(/\/$/, "");

    // Ping Supabase base REST route to see if it is reachable
    const response = await globalThis.fetch(`${cleanUrl}/`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    res.json({
      online: response.status < 400 || response.status === 401,
      status: response.status,
      supabaseUrl: cleanUrl,
      projectId: "zsorsmfbxllznwestqvd",
      sqlScript: `-- Supabase SQL Schema setup script for Beaution Studio
-- copy and execute this block in Supabase sql editor

-- Table 1: Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  customer_name text,
  customerName text,
  customer_email text,
  customerEmail text,
  customer_phone text,
  customerPhone text,
  date text,
  time text,
  service_id text,
  serviceId text,
  package_id text,
  packageId text,
  selected_name text,
  selectedName text,
  amount_paid numeric,
  amountPaid numeric,
  payment_method text,
  paymentMethod text,
  payment_status text,
  paymentStatus text,
  receipt_no text,
  receiptNo text,
  created_at text,
  createdAt text,
  updated_at text,
  updatedAt text
);

-- Table 2: Customers Profiles
CREATE TABLE IF NOT EXISTS customers (
  phone text PRIMARY KEY,
  name text,
  email text,
  created_at text,
  createdAt text,
  updated_at text,
  updatedAt text
);

-- Table 3: Messages Feed
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  name text,
  phone text,
  email text,
  service text,
  message text,
  status text,
  created_at text,
  createdAt text
);

-- Table 4: OTP Logs & Verification status tracker
CREATE TABLE IF NOT EXISTS otps (
  phone text PRIMARY KEY,
  otp text,
  expires_at text,
  expiresAt text,
  verified boolean DEFAULT false,
  created_at text,
  createdAt text,
  updated_at text,
  updatedAt text
);`
    });
  } catch (error: any) {
    res.json({
      online: false,
      error: error.message,
      supabaseUrl: process.env.SUPABASE_URL || "https://zsorsmfbxllznwestqvd.supabase.co/rest/v1/",
      projectId: "zsorsmfbxllznwestqvd"
    });
  }
});

// Admin: Mass-synchronize entire local JSON database records to Supabase tables
app.post("/api/admin/supabase-sync", adminAuthGate, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const reports: any = { bookings: [], customers: [], messages: [] };

    console.log(`[Supabase Sync] Bulk synchronization requested...`);

    // 1. Sync Bookings
    if (db.bookings && Array.isArray(db.bookings)) {
      for (const b of db.bookings) {
        const row = {
          id: b.id,
          customerName: b.customerName,
          customer_name: b.customerName,
          customerEmail: b.customerEmail,
          customer_email: b.customerEmail,
          customerPhone: b.customerPhone,
          customer_phone: b.customerPhone,
          date: b.date,
          time: b.time,
          serviceId: b.serviceId || "",
          service_id: b.serviceId || "",
          packageId: b.packageId || "",
          package_id: b.packageId || "",
          selectedName: b.selectedName || "",
          selected_name: b.selectedName || "",
          amountPaid: Number(b.amountPaid || 0),
          amount_paid: Number(b.amountPaid || 0),
          paymentMethod: b.paymentMethod || "COD",
          payment_method: b.paymentMethod || "COD",
          paymentStatus: b.paymentStatus || "Completed",
          payment_status: b.paymentStatus || "Completed",
          receiptNo: b.receiptNo || "",
          receipt_no: b.receiptNo || "",
          createdAt: b.createdAt || new Date().toISOString(),
          created_at: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || "",
          updated_at: b.updatedAt || ""
        };
        const syncRes = await sendToSupabase("bookings", row);
        reports.bookings.push({ id: b.id, success: syncRes.success });
      }
    }

    // 2. Sync Customers Profiles
    if (db.customers && Array.isArray(db.customers)) {
      for (const c of db.customers) {
        const row = {
          phone: c.phone,
          name: c.name,
          email: c.email,
          createdAt: c.createdAt || new Date().toISOString(),
          created_at: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || "",
          updated_at: c.updatedAt || ""
        };
        const syncRes = await sendToSupabase("customers", row);
        reports.customers.push({ phone: c.phone, success: syncRes.success });
      }
    }

    // 3. Sync Messages
    if (db.messages && Array.isArray(db.messages)) {
      for (const m of db.messages) {
        const row = {
          id: m.id,
          name: m.name,
          phone: m.phone || "N/A",
          email: m.email,
          service: m.service || "Contact Form Inquiry",
          message: m.message,
          status: m.status || "Unread",
          createdAt: m.createdAt || new Date().toISOString(),
          created_at: m.createdAt || new Date().toISOString()
        };
        const syncRes = await sendToSupabase("messages", row);
        reports.messages.push({ id: m.id, success: syncRes.success });
      }
    }

    res.json({
      success: true,
      message: `Database synchronization processing triggered.`,
      reports
    });
  } catch (error: any) {
    res.status(500).json({ error: "Db bulk sync procedure failed: " + error.message });
  }
});

// --- VITE DEV OR STATIC BROWSER DELIVERY HANDLERS ---
async function mountServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    console.log("Vite loading Dev Middleware Mode.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Beaution Premium Portal started successfully on port ${PORT}`);
  });
}

mountServer();
