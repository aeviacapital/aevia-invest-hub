/**
 * verify-otp.js
 * Express server for external OTP verification using Supabase only.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {createClient} from "@supabase/supabase-js";

dotenv.config();


// ---- ENVIRONMENT ----
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.PORT || 3000;

// ---- INIT SUPABASE ADMIN CLIENT ----
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {persistSession: false},
});

// ---- INIT EXPRESS APP ----
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'https://aviacapital.capital',
      'http://www.aviacapital.capital',
      'http://aeviacapital.com',
      'http://www.aeviacapital.com',
      'http://localhost:8080',
      'http://localhost:3000'

    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey'],
  })
);
app.options(/.*/, cors());


// ---- VERIFY OTP ----
app.post("/verify-otp", async (req, res) => {
  try {
    const {email, otp} = req.body;
    console.log("checking email and otp from the frontend");
    console.log(email);
    console.log(otp);

    if (!email || !otp) {
      return res.status(400).json({error: "Missing email or OTP"});
    }

    // 1️⃣ Find latest unconsumed OTP by email
    const {data: otpRows, error: otpError} = await supabaseAdmin
      .from("email_otps")
      .select("*")
      .ilike("email", email.trim()) // case-insensitive match on email
      .or("consumed.is.null,consumed.eq.false") // only unused OTPs
      .order("created_at", {ascending: false}) // newest first
      .limit(1); // only return the most recent

    if (otpError) {
      console.error("❌ Supabase query error:", otpError);
      return res.status(500).json({error: "Database query failed"});
    }

    if (!otpRows || otpRows.length === 0) {
      return res.status(404).json({error: "No OTP found for this email"});
    }

    const otpRecord = otpRows[0];

    // 2️⃣ Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({error: "OTP expired"});
    }

    // 3️⃣ Compare hashes
    const valid = await bcrypt.compare(otp.toString(), otpRecord.otp_hash);
    if (!valid) {
      return res.status(401).json({error: "Invalid OTP"});
    }

    // 4️⃣ Mark OTP as consumed
    const {error: consumeError} = await supabaseAdmin
      .from("email_otps")
      .update({consumed: true})
      .eq("id", otpRecord.id);

    if (consumeError) {
      console.error("❌ Failed to mark OTP consumed:", consumeError);
      return res.status(500).json({error: "Failed to update OTP record"});
    }

    // 5️⃣ Confirm user in Supabase using email
    const {data: users, error: listError} =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Failed to list users:", listError);
      return res.status(500).json({error: "Failed to fetch users from Supabase"});
    }

    const user = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return res.status(404).json({error: "User not found in Supabase"});
    }

    const {error: updateError} = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {email_confirm: true}
    );

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return res.status(500).json({error: "Failed to confirm user in Supabase"});
    }

    console.log(`✅ OTP verified and user confirmed: ${email}`);
    return res.json({success: true, message: "Email verified successfully"});
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// ---- HEALTH CHECK ----
app.get("/", (req, res) => res.send("✅ OTP verification server running"));

app.listen(PORT, () =>
  console.log(`✅ External OTP server running on port ${PORT}`)
);

