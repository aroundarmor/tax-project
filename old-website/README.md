# 💰 TaxSaver - Legacy Client-Side Version

Welcome to the **original, purely client-side** version of TaxSaver. This directory contains the standalone calculator which runs 100% in the browser with no backend dependencies, no database, and no external services required.

## ⚠️ Important Note

This is the **`old-website/`** archive. It has been preserved for reference and for users who want to run a strictly offline, simple tax calculator without the premium, login, or AI features.
For the actively developed, production-ready version with premium capabilities, please see the `new-website/` directory.

---

## ✨ Features (Legacy Version)

- **Budget 2025-26 Compliant**: Features the latest tax slabs and standard deductions.
- **Dual Regime Support**: Compare Old vs New tax regimes interactively.
- **Comprehensive Deductions (Old Regime)**: 19 Supported Sections including 80C, 80D, 80E, NPS Vatsalya, and more.
- **Intelligent Tax Optimizer**: One-click optimal strategy application.
- **100% Offline and Private**: All computations happen locally on your device via JavaScript.

## 🚀 Quick Start

Because this version has no backend, no build tools, and no external integrations, you can run it immediately!

### Option 1: Direct File Open

Simply double-click `index.html` file to open it in your default web browser.

### Option 2: Local Server

If your browser restricts local file scripts:

```bash
# Python
python -m http.server 8000
# Node
npx serve .
```

## 📁 Project Structure

```
old-website/
├── index.html      # Main HTML structure with all UI controls
├── styles.css      # The complete design system
└── app.js          # The standalone tax calculation engine
```

## Technical Details

- **Tech Stack**: Pure HTML, CSS, JavaScript (Vanilla ES6)
- **No Dependencies**: No React, Vue, npm packages, or libraries required.
- **Client-Side Only**: Does not make any HTTP requests.
- **Framework-less CSS**: Fully custom, responsive CSS.
