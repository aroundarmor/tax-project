# 💰 TaxSaver - Income Tax Calculator & ITR Filing Assistant

A modern, premium web application for Indian taxpayers to calculate income tax, optimize deductions, and understand ITR filing requirements for **FY 2025-26 (AY 2026-27)**. **Updated with Budget 2025-26 changes!**

![TaxSaver Demo](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Budget 2025](https://img.shields.io/badge/Budget%202025--26-Updated-brightgreen?style=for-the-badge)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue?style=for-the-badge)

## ✨ Features

### 🎉 Budget 2025-26 Highlights

- **Zero Tax up to ₹12.75 Lakh**: Salaried employees in new regime pay no tax!
- **7-Tier Tax Structure**: More progressive slabs (₹4L, ₹8L, ₹12L, ₹16L, ₹20L, ₹24L, 24L+)
- **Enhanced Standard Deduction**: Increased to ₹75,000 for salaried (from ₹50,000)
- **Boosted Rebate**: Section 87A rebate increased to ₹60,000 (from ₹25,000)
- **NPS Vatsalya**: New ₹50,000 deduction for children's NPS contributions

### 🧮 Tax Calculation

- **Dual Regime Support**: Compare Old vs New tax regimes (Budget 2025 updated)
- **Accurate Tax Slabs**: FY 2025-26 compliant calculations
- **Real-time Updates**: Instant calculations as you type
- **Comprehensive Breakdown**: Detailed tax slab breakdown with tables

### 💼 Income & Deductions

- **Multiple Income Sources**: Salary, House Property, Capital Gains, Other Income
- **19 Comprehensive Deductions**: Most complete tax calculator available!
  - 80C, 80D, 80CCD(1B), **80E (Education Loan - NO LIMIT)**
  - **NPS Vatsalya (NEW!)**, 80TTA/TTB, 80GG, 80DD, 80DDB, 80U
  - 80EEA, 80G, 80GGA, 80GGC, Section 24, HRA, LTA, Professional Tax
- **Automatic Limits**: Built-in validation for deduction limits
- **Standard Deduction**: Auto-applied (₹75,000 new regime / ₹50,000 old regime)

### 💡 Smart Features

- **🎯 Intelligent Tax Optimizer**: One-click optimization for ₹12.75L - ₹20L salaries
  - Pre-calculated optimal strategies showing **massive savings**
  - Auto-fills ALL deductions for maximum tax benefits
  - ₹15L salary: Save up to **₹1.80 Lakh**
  - ₹20L salary: Save up to **₹3.04 Lakh**
- **Regime Comparison**: Side-by-side Old vs New regime analysis
- **Investment Suggestions**: Personalized tax-saving recommendations
- **Savings Calculator**: Shows potential tax savings
- **ITR Form Guide**: Recommends appropriate ITR form
- **PDF Export**: Download tax summary

### 🎨 Premium Design

- **Modern UI**: Glassmorphism effects with gradient backgrounds
- **Responsive**: Mobile-first design, works on all devices
- **Smooth Animations**: Micro-interactions and transitions
- **Accessibility**: Semantic HTML with proper ARIA attributes

## 🚀 Quick Start

### Option 1: Direct Use

Simply open `index.html` in any modern web browser. No installation required!

```bash
# Clone or download the project
cd new-project

# Open in browser (Windows)
start index.html

# Or just double-click index.html
```

### Option 2: Local Server

Using Python:

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

Using Node.js:

```bash
npx serve .
# Visit http://localhost:3000
```

## 📖 How to Use

1. **Choose Tax Regime**: Select Old or New tax regime
2. **Enter Income**: Fill in salary and other income sources
3. **Add Deductions**: Enter your investments and deductions (Old Regime)
4. **View Results**: See tax breakdown, take-home pay, and regime comparison
5. **Get Suggestions**: Review personalized investment recommendations
6. **ITR Guidance**: Check which ITR form to use and filing steps
7. **Export**: Download your tax summary as PDF

## 📁 Project Structure

```
new-project/
├── index.html      # Main HTML structure
├── styles.css      # Premium design system
├── app.js          # Tax calculation engine
└── README.md       # This file
```

**Example Calculation (Budget 2025-26):**

**Scenario 1: ₹12 Lakh Salary (Salaried Employee)**

**Input:**

- Annual Salary: ₹12,00,000
- No deductions claimed

**New Regime:**

- Gross Income: ₹12,00,000
- Standard Deduction: ₹75,000
- Taxable Income: ₹11,25,000
- Tax Before Rebate: ~₹52,500
- Less: Section 87A Rebate: ₹52,500 (up to ₹60,000)
- **Total Tax: ₹0** ✨

**Old Regime:**

- Taxable Income: ₹11,50,000 (₹12L - ₹50k std deduction)
- **Total Tax: ₹1,45,600**

**Recommendation:** New Regime saves **₹1,45,600**! 🎉

---

**Scenario 2: ₹15 Lakh with Deductions**

**Input:**

- Annual Salary: ₹15,00,000
- Section 80C: ₹1,50,000
- Section 80D: ₹25,000
- NPS (80CCD1B): ₹50,000
- NPS Vatsalya: ₹50,000 (NEW!)

**Old Regime:**

- Taxable Income: ₹12,25,000
- **Total Tax: ₹1,97,600**

**New Regime:**

- Taxable Income: ₹14,25,000
- **Total Tax: ₹2,08,000**

**Recommendation:** Old Regime saves **₹10,400** for high savers

## 🎯 Tax Slabs (FY 2025-26) - Budget 2025

### Old Regime (Unchanged)

| Income Range | Tax Rate |
| ------------ | -------- |
| ₹0 - ₹2.5L   | 0%       |
| ₹2.5L - ₹5L  | 5%       |
| ₹5L - ₹10L   | 20%      |
| Above ₹10L   | 30%      |

### New Regime (Budget 2025-26 - Revised!)

| Income Range | Tax Rate |
| ------------ | -------- |
| ₹0 - ₹4L     | 0%       |
| ₹4L - ₹8L    | 5%       |
| ₹8L - ₹12L   | 10%      |
| ₹12L - ₹16L  | 15%      |
| ₹16L - ₹20L  | 20%      |
| ₹20L - ₹24L  | 25%      |
| Above ₹24L   | 30%      |

**Key Changes:**

- Basic exemption increased from ₹3L → **₹4L**
- New 25% slab for ₹20L-24L incomes
- More progressive structure with 7 slabs (previously 6)

## 💻 Technical Details

- **Tech Stack**: Pure HTML, CSS, JavaScript (Vanilla)
- **No Dependencies**: No frameworks or libraries required
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Offline Ready**: Works without internet connection
- **Client-Side Only**: No data sent to servers, 100% private

## 🎨 Design System

- **Typography**: Google Fonts (Inter, Roboto)
- **Colors**: Blues and purples (trust/finance theme)
- **Effects**: Glassmorphism, gradients, smooth transitions
- **Responsive**: Breakpoints at 480px, 768px

## 📊 Features Breakdown

### Deductions Supported (Old Regime Only)

#### 🔥 Most Comprehensive - 19 Sections!

**Investment & Savings:**

- ✅ Section 80C (₹1.5L) - PPF, ELSS, LIC, EPF, Tax Saver FD
- ✅ Section 80CCD(1B) (₹50k) - NPS (Self)
- ✅ **Section 80CCD(2) (₹50k) - NPS Vatsalya (Children) - NEW!** 🎉

**Health & Insurance:**

- ✅ Section 80D (₹1L) - Health Insurance (Self + Parents)
- ✅ Section 80DD (₹75k-1.25L) - Disability (Dependent)
- ✅ Section 80DDB (₹40k-1L) - Critical Illness Treatment
- ✅ Section 80U (₹75k-1.25L) - Self Disability

**Loans & Interest:**

- ✅ Section 24 (₹2L) - Home Loan Interest
- ✅ **Section 80E (NO LIMIT)** - Education Loan Interest 🎓
- ✅ Section 80EEA (₹1.5L) - Affordable Housing (Additional)

**Housing & Rent:**

- ✅ HRA Exemption - House Rent Allowance
- ✅ **Section 80GG (₹60k)** - Rent without HRA

**Other Deductions:**

- ✅ **Section 80TTA/TTB (₹10k/₹50k)** - Savings Account Interest 💰
- ✅ Section 80G - Charitable Donations (50-100%)
- ✅ Section 80GGA - Scientific Research Donations (100%)
- ✅ Section 80GGC - Political Donations (100%)
- ✅ **Professional Tax (₹2.5k)** - Section 16(iii)
- ✅ LTA (Leave Travel Allowance)
- ✅ Standard Deduction (₹50k old / ₹75k new regime)

**💪 With ALL deductions, you can claim up to ₹15-20 Lakh in total deductions!**

### Tax Optimizer

**Intelligent one-click optimization for common salary ranges:**

- 🎉 **₹12.75 Lakh**: Zero tax in new regime automatically!
- 💰 **₹15 Lakh**: Save **₹1.80 Lakh** with comprehensive deductions
- 📊 **₹17.5 Lakh**: Save **₹2.47 Lakh** (includes affordable housing)
- 🚀 **₹20 Lakh**: Save **₹3.04 Lakh** with maximum optimization

**Features:**

- Pre-calculated optimal strategies
- Auto-fills ALL deduction fields
- Shows exact investment breakdown
- Instant regime comparison
- One-click apply

### Investment Suggestions

- 📈 ELSS Mutual Funds
- 🏦 Public Provident Fund (PPF)
- 🏥 Health Insurance
- 👴 National Pension Scheme (NPS - Self)
- 🆕 **NPS Vatsalya (Children) - Budget 2025**
- 🏠 Home Loan Benefits
- 📚 Education Loan Interest

### ITR Forms Guidance

- ITR-1 (Sahaj) - For salary income
- ITR-2 - For capital gains, multiple properties
- ITR-3 - For business/professional income
- ITR-4 (Sugam) - For presumptive income

## 🔐 Privacy & Security

- **100% Client-Side**: All calculations happen in your browser
- **No Data Collection**: Nothing is sent to any server
- **No Cookies**: No tracking or analytics
- **Offline Capable**: Works without internet connection
- **Open Source**: Transparent, auditable code

## 📱 Responsive Design

✅ Desktop (>768px): Full multi-column layout  
✅ Tablet (481-768px): Optimized grid with larger touch targets  
✅ Mobile (<480px): Single column, stacked layout

## 🎓 Educational Content

The app includes:

- Detailed explanation of each tax section
- Investment option descriptions
- Step-by-step ITR filing guide
- Important deadlines and reminders
- Links to official Income Tax portal

## ⚠️ Disclaimer

This calculator is for **educational and planning purposes only**. Tax calculations are based on **FY 2025-26 (Budget 2025-26)** rules and may not cover all scenarios. Please consult a chartered accountant or tax advisor for accurate tax planning and filing.

## 🤝 Contributing

This is a standalone educational project. If you'd like to enhance it:

1. ~~Add support for more tax sections~~ ✅ DONE - 19 sections supported!
2. ~~Implement intelligent tax optimizer~~ ✅ DONE - One-click optimization!
3. Implement chart visualizations
4. Add more detailed ITR form guidance
5. Improve accessibility features
6. Add multi-year comparison

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Tax slabs based on official Income Tax Department guidelines
- Built for Indian taxpayers with ❤️
- Designed to make tax planning simple and accessible

## 🔗 Resources

- [Income Tax Department](https://www.incometax.gov.in)
- [E-Filing Portal](https://eportal.incometax.gov.in)
- FY 2024-25 Tax Slabs Documentation

---

**Made with ❤️ for Indian Taxpayers**  
_Calculate Smart. Save More. File with Confidence._
