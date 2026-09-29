# 🌊 Aquarium Studio

> **The 100% Local-First, Privacy-Focused Aquarium Management Suite.**  
> Visualise your aquarium in real time, engineer multi-chamber sumps and refugiums, calculate precise chemical dosing, and monitor livestock—all without sending a single byte of data to external cloud servers.

---

## 🛡️ 1. Privacy Guarantee & Data Sovereignty

Aquarium Studio was built with a strict **local-first, non-invasive philosophy**. Your aquarium setup, water parameters, photos, notes, and livestock records are personal, and we believe they should remain strictly on your own hardware.

- 🔒 **100% Offline & Local Execution:**  
  Aquarium Studio runs entirely on your local PC. All data is saved into a single local SQLite database file (`prisma/dev.db`).
- 🚫 **Zero Telemetry or Remote Tracking:**  
  There are no analytics trackers, no tracking pixels, no telemetry pings, and no cloud servers collecting statistics on how you use the app.
- 🚫 **No Accounts or Subscriptions:**  
  No email registration, password creation, or credit card subscriptions are required.
- 📶 **Private Home Network Phone Access:**  
  When using your phone to control the app via the QR code or local URL (`http://192.168.x.x:3000`), your traffic stays strictly inside your home Wi-Fi network between your phone and your PC. Nothing is relayed through external servers.
- 🤖 **Private AI Integrations (User-Triggered Only):**  
  If you choose to use the optional AI Vision Scanner, Trend Diagnostic, or Product Scanner features, your API keys (Google Gemini, OpenAI, Anthropic, or OpenRouter) are stored solely in your local database or browser `localStorage` on your PC. Calls are dispatched directly to official provider endpoints only when you explicitly press an AI action button.
- 🌐 **Transparent External Data Fetching:**  
  Aquarium Studio operates 100% locally by default. The internet is contacted strictly for:
  1. **Public Biodiversity Specimen Imagery:** Querying the Wikipedia MediaWiki API and iNaturalist Taxa API for Creative Commons specimen reference photos when generating Virtual Tank fish/coral sprites without custom cutouts. Images are processed locally on your PC via Python `rembg` and permanently cached to disk.
  2. **Direct AI Queries:** Explicit HTTPS requests directly to your chosen AI vendor.
  3. No analytics, tracking pixels, telemetry, or cloud database sync are ever executed.

---

## 🤖 2. All Features Powered by Artificial Intelligence

All AI capabilities in Aquarium Studio are entirely optional and require an explicit user click:

1. **🐠 Livestock Species Identification (Fish & Coral Vaults):**
   - Identifies marine fish, SPS/LPS/soft corals, invertebrates (shrimp, snails, crabs, clams), and freshwater plants from photos or video clips.
   - Extracts scientific taxonomy, common morph names, difficulty level, minimum tank volume, temperament, reef-safe rating, lighting (PAR), water flow, and feeding guidelines.
2. **🩺 Visual Health & Pest Diagnostics:**
   - Detects visual cues for marine and freshwater diseases: Marine Ich (*Cryptocaryon*), Marine Velvet, Fin Rot, or coral Rapid/Slow Tissue Necrosis (RTN/STN) and bleaching.
   - Flags invasive pests and hitchhikers like Aiptasia anemones, flatworms, bubble algae, and vermetid snails.
3. **📈 Water Chemistry Stability & Trend Diagnostics:**
   - Evaluates chemical test history across Alkalinity (dKH), Calcium, Magnesium, Nitrate, Phosphate, pH, and Salinity.
   - Computes stability curves, calculates daily element uptake, and provides preventative warnings before chemical swings trigger coral RTN or livestock stress.
4. **🧪 Dosing Product & Supplement Bottle Scanner:**
   - Scans chemical additive bottles (Red Sea Foundation, Seachem, Fritz, Brightwell, Tropic Marin, ESV).
   - Reads active compounds, concentration ratios, and instructions to automatically prefill dosing calculators.

---

## ⚡ 3. Features & Capabilities

Aquarium Studio provides a focused suite of tools designed for reef and freshwater aquarists:

### 1. 🧪 Water Parameter Logging, Chart Generation & AI Advisory
- Comprehensive water testing logs (Salinity, Alkalinity, Calcium, Magnesium, Nitrate, Phosphate, pH, GH, KH, TDS, Temperature).
- Chart generation with degradation curves, stability indicators, and safe operating bounds.
- Optional AI-assisted advisory analyzing historical trends and parameter stability.

### 2. 🐠 Livestock ID with Optional AI-Assisted Identification
- Livestock vaults for fish, corals, invertebrates, and freshwater plants.
- Optional AI-assisted species identification and care recommendations.
- Photo logs and growth timeline tracking.

### 3. 🌊 Interactive Virtual Tank Simulator
- Procedural marine and freshwater aquatic simulations.
- Animated swimming fish, drag-and-place sessile corals and inverts, and dynamic caustics.
- Local sprite caching and specimen photo retrieval.

### 4. ⚖️ Calculator for Reference Only (Salt Mixing & Dosing)
- Assistive calculations for reference only to assist in salt mixing and chemical dosing adjustments.
- Target level calculators for Alkalinity, Calcium, and Magnesium.
- Water change calculators (PPT vs. Specific Gravity).

### 5. 🛠️ Maintenance Tasks Tracking
- Set up maintenance tasks to let the user keep track of recurring upkeep duties.
- Manage filter media changes, RO/DI resin replacements, and equipment maintenance schedules.
- Visual alerts and overdue indicators to keep tanks healthy and stable.

---

## ⚠️ 4. Real-World Limits & Safety Disclaimers

To protect the health of your aquatic life and equipment, please understand the operational boundaries of Aquarium Studio:

1. **Not a Physical Automated Doser or Hardware Controller:**  
   Aquarium Studio is an assistive planning, logging, and calculation software suite. It does **NOT** communicate with physical dosing pumps, power relays, or smart controllers (such as Neptune Systems Apex, CoralVue Hydros, or GHL Profilux). It will not physically dose chemicals into your aquarium or toggle your equipment on/off.
2. **Always Verify Chemistry with Physical Test Kits:**  
   Chemical dosing formulas provided by the calculators are mathematically derived from standard aquarium chemistry equations and user-input water volume. Because rocks, sand, and equipment displace water differently in every system, **always start with a conservative dose** (e.g. 50% of the recommended amount) and measure your water with reliable, calibrated test kits (such as Hanna Checkers, Salifert, or Red Sea) before and after dosing.
3. **No Automatic Cloud Backup:**  
   Because Aquarium Studio does not transmit data to remote servers, backups are entirely in your hands. Please see Section 8 below for the 1-click single-file backup guide.
4. **Chemical Safety:**  
   Always exercise proper caution (gloves, eye protection) when handling concentrated dry aquarium chemicals (Soda Ash, Calcium Chloride, Kalkwasser/Calcium Hydroxide, or acid cleaning baths).
5. **Hitchhiker & Disease Diagnostics for Reference & Educational Use Only:**  
   The Hitchhiker and Disease Diagnostic Suite provides visual references, pest identification, symptom analysis, and educational management recommendations. Because aquatic pathogens, parasites, and pests often display overlapping physical symptoms, these tools must **never** replace professional veterinary advice or independent verification. Aquarists must conduct their own thorough research and verify species-specific chemical sensitivities (e.g., copper toxicity in corals/invertebrates, formalin risks, salinity tolerances) before administering any quarantine or tank treatments.

---

## 🚀 5. Quick Start (Running on Your Local PC)

### Windows 1-Click Launch:
Simply double-click the included batch script in the root directory:
```
Start-Aquarium-Studio.bat
```
This batch script will:
1. Verify Node.js and dependencies are installed.
2. Launch the local web server on port `3000`.
3. Automatically launch your default browser to `http://localhost:3000`.
4. Display your local network address for phone pairing.

### Manual Terminal Launch:
```bash
# Install dependencies
npm install

# Start the local server (accessible from both localhost and local network)
npm run dev
```
Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## 📱 6. Phone & Tablet Connection Guide

You can access and control Aquarium Studio from your smartphone or tablet anywhere within your home:

1. Ensure your phone is connected to your **home Wi-Fi network** (the same Wi-Fi router your PC is connected to).
2. On your PC, click the **"Connect Phone"** button in the top-left corner of the webapp.
3. Scan the generated QR code with your phone camera, or manually type the displayed URL (e.g. `http://192.168.1.xxx:3000`) into Safari or Chrome on your phone.
4. *(Optional)* Add Aquarium Studio to your phone's home screen:
   - **iPhone (Safari):** Tap the **Share** button $\rightarrow$ **"Add to Home Screen"**.
   - **Android (Chrome):** Tap the **three dots (⋮)** menu $\rightarrow$ **"Add to Home screen"**.

> **Note:** If your phone cannot connect, verify that Windows Defender Firewall permits incoming connections on port 3000 on Private Networks, or run the following command in an Administrator prompt:  
> `netsh advfirewall firewall add rule name="AquariumStudio" dir=in action=allow protocol=TCP localport=3000`

---

## 🛑 7. How to Shut Down Properly

When you are finished using Aquarium Studio:

1. Click on the command prompt / PowerShell window that opened when running `Start-Aquarium-Studio.bat`.
2. Press **`Ctrl + C`** on your keyboard (press `Y` if prompted to terminate batch job), **or simply close the terminal window**.
3. The server will shut down immediately and release port 3000. All data in SQLite is automatically saved on every action and will be preserved for your next session.

---

## 💾 8. Backup & Data Migration

Aquarium Studio uses a transparent single-file database architecture:

### Database Location:
```
prisma/dev.db
```

- **To Back Up Your Data:**  
  Copy the `dev.db` file from the `prisma/` folder and paste it into a safe location (such as a USB drive or cloud backup folder).
- **To Restore on a New PC:**  
  Copy your saved `dev.db` file and paste it into the `prisma/` folder of the new Aquarium Studio installation. When you start the app, all your tanks, livestock, and historical parameters will be restored.

---

## 🛠️ 9. Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Glassmorphic spatial design
- **Database & ORM:** SQLite with Prisma ORM
- **Graphics & Icons:** Three.js / Canvas caustics, Lucide React
- **Local Network Engine:** Node.js native network interface detection

---

*Aquarium Studio is free, open, and strictly dedicated to privacy-first aquarium keeping.*
