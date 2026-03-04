// ============================================
// TAXSAVER - Tax Calculation Engine
// Indian Income Tax Calculator & ITR Assistant
// Updated for Budget 2025-26 (FY 2025-26, AY 2026-27)
// ============================================

// Current selected tax regime
let currentRegime = 'old';

// Tax Slabs for FY 2025-26 (AY 2026-27) - Budget 2025
const TAX_SLABS = {
    old: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 5 },
        { min: 500000, max: 1000000, rate: 20 },
        { min: 1000000, max: Infinity, rate: 30 }
    ],
    new: [
        { min: 0, max: 400000, rate: 0 },          // Increased from 3L to 4L
        { min: 400000, max: 800000, rate: 5 },     // 4L-8L
        { min: 800000, max: 1200000, rate: 10 },   // 8L-12L
        { min: 1200000, max: 1600000, rate: 15 },  // 12L-16L (New slab)
        { min: 1600000, max: 2000000, rate: 20 },  // 16L-20L
        { min: 2000000, max: 2400000, rate: 25 },  // 20L-24L (New slab)
        { min: 2400000, max: Infinity, rate: 30 }  // Above 24L
    ]
};

// Constants - Budget 2025
const STANDARD_DEDUCTION_OLD = 50000;      // Old regime - unchanged
const STANDARD_DEDUCTION_NEW = 75000;      // New regime - increased from 50k to 75k
const HEALTH_EDUCATION_CESS = 0.04;        // 4%
const REBATE_87A_OLD = 12500;              // Old regime rebate
const REBATE_87A_NEW = 60000;              // New regime rebate - increased from 25k to 60k
const REBATE_LIMIT_OLD = 500000;           // Old regime rebate income limit
const REBATE_LIMIT_NEW = 1200000;          // New regime rebate income limit - increased from 7L to 12L

// ============================================
// Tax Regime Selection
// ============================================
function selectRegime(regime) {
    currentRegime = regime;

    // Update UI
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-regime="${regime}"]`).classList.add('active');

    // Update info text
    const infoText = regime === 'old'
        ? 'Old Tax Regime - Allows all deductions under sections 80C, 80D, etc.'
        : 'New Tax Regime (FY 25-26) - Zero tax up to ₹12.75 lakh for salaried employees! Standard deduction ₹75,000';
    document.getElementById('regime-info').textContent = infoText;

    // Show/hide deductions section
    const deductionsSection = document.getElementById('deductions-section');
    if (regime === 'new') {
        deductionsSection.style.opacity = '0.5';
        deductionsSection.style.pointerEvents = 'none';
    } else {
        deductionsSection.style.opacity = '1';
        deductionsSection.style.pointerEvents = 'auto';
    }

    // Recalculate
    calculateTax();
}

// ============================================
// Get Input Values
// ============================================
function getInputValue(id) {
    const value = parseFloat(document.getElementById(id).value) || 0;
    return Math.max(0, value);
}

function formatCurrency(amount) {
    return '₹ ' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ============================================
// Calculate Tax for a Given Regime
// ============================================
function calculateTaxForRegime(taxableIncome, regime) {
    const slabs = TAX_SLABS[regime];
    let tax = 0;
    let breakdown = [];

    for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];

        if (taxableIncome > slab.min) {
            const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
            const taxInSlab = (taxableInSlab * slab.rate) / 100;

            if (taxInSlab > 0) {
                tax += taxInSlab;
                breakdown.push({
                    slab: `₹${slab.min.toLocaleString()} - ${slab.max === Infinity ? 'Above' : '₹' + slab.max.toLocaleString()}`,
                    rate: slab.rate + '%',
                    amount: taxInSlab
                });
            }
        }
    }

    return { tax, breakdown };
}

// ============================================
// Main Tax Calculation
// ============================================
function calculateTax() {
    // Get all income inputs
    const salary = getInputValue('salary');
    const houseProperty = getInputValue('houseProperty');
    const capitalGains = getInputValue('capitalGains');
    const otherIncome = getInputValue('otherIncome');

    const grossIncome = salary + houseProperty + capitalGains + otherIncome;

    // Display total income
    document.getElementById('totalIncome').textContent = formatCurrency(grossIncome);

    // Get deductions (only applicable for old regime)
    let totalDeductions = 0;

    if (currentRegime === 'old') {
        const section80c = Math.min(getInputValue('section80c'), 150000);
        const section80d = Math.min(getInputValue('section80d'), 100000);
        const section80ccd1b = Math.min(getInputValue('section80ccd1b'), 50000);
        const npsVatsalya = Math.min(getInputValue('npsVatsalya'), 50000);  // Budget 2025 - New!
        const homeLoanInterest = Math.min(getInputValue('homeLoanInterest'), 200000);
        const hra = getInputValue('hra');
        const lta = getInputValue('lta');

        // NEW deductions - Comprehensive list
        const section80e = getInputValue('section80e');  // No limit
        const professionalTax = Math.min(getInputValue('professionalTax'), 2500);
        const section80tta = Math.min(getInputValue('section80tta'), 50000);
        const section80gg = Math.min(getInputValue('section80gg'), 60000);
        const section80dd = Math.min(getInputValue('section80dd'), 125000);
        const section80ddb = Math.min(getInputValue('section80ddb'), 100000);
        const section80u = Math.min(getInputValue('section80u'), 125000);
        const section80eea = Math.min(getInputValue('section80eea'), 150000);
        const section80g = getInputValue('section80g') * 0.5;  // 50% deduction
        const section80gga = getInputValue('section80gga');
        const section80ggc = getInputValue('section80ggc');

        totalDeductions = section80c + section80d + section80ccd1b + npsVatsalya +
            homeLoanInterest + hra + lta + section80e + professionalTax +
            section80tta + section80gg + section80dd + section80ddb + section80u +
            section80eea + section80g + section80gga + section80ggc +
            STANDARD_DEDUCTION_OLD;
    } else {
        // New regime only gets standard deduction (Budget 2025: increased to 75k)
        totalDeductions = STANDARD_DEDUCTION_NEW;
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // Calculate tax
    const { tax: baseTax, breakdown } = calculateTaxForRegime(taxableIncome, currentRegime);

    // Apply rebate u/s 87A if applicable - Budget 2025 updates
    let finalBaseTax = baseTax;
    let rebateApplied = 0;

    if (currentRegime === 'new' && taxableIncome <= REBATE_LIMIT_NEW) {
        // New regime: ₹60,000 rebate for income up to ₹12 lakh
        rebateApplied = Math.min(baseTax, REBATE_87A_NEW);
        finalBaseTax = Math.max(0, baseTax - rebateApplied);
    } else if (currentRegime === 'old' && taxableIncome <= REBATE_LIMIT_OLD) {
        // Old regime: ₹12,500 rebate for income up to ₹5 lakh
        rebateApplied = Math.min(baseTax, REBATE_87A_OLD);
        finalBaseTax = Math.max(0, baseTax - rebateApplied);
    }

    // Add cess
    const cess = finalBaseTax * HEALTH_EDUCATION_CESS;
    const totalTax = finalBaseTax + cess;

    // Calculate monthly take home
    const annualTakeHome = grossIncome - totalTax;
    const monthlyTakeHome = annualTakeHome / 12;

    // Update UI
    document.getElementById('taxableIncome').textContent = formatCurrency(taxableIncome);
    document.getElementById('baseTax').textContent = formatCurrency(finalBaseTax);
    document.getElementById('cess').textContent = formatCurrency(cess);
    document.getElementById('totalTax').textContent = formatCurrency(totalTax);
    document.getElementById('takeHome').textContent = formatCurrency(monthlyTakeHome);

    // Update tax breakdown table
    updateTaxBreakdown(breakdown, finalBaseTax, cess);

    // Calculate both regimes for comparison
    calculateRegimeComparison(grossIncome);

    // Generate suggestions
    generateSuggestions(grossIncome, totalDeductions);

    // Update ITR form suggestion
    updateITRFormSuggestion(grossIncome, houseProperty, capitalGains);
}

// ============================================
// Update Tax Breakdown Table
// ============================================
function updateTaxBreakdown(breakdown, finalTax, cess) {
    const tbody = document.getElementById('taxBreakdown');

    if (breakdown.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color: var(--gray-500);">No tax applicable</td></tr>';
        return;
    }

    let html = '';
    breakdown.forEach(item => {
        html += `
            <tr>
                <td>${item.slab}</td>
                <td>${item.rate}</td>
                <td><strong>${formatCurrency(item.amount)}</strong></td>
            </tr>
        `;
    });

    html += `
        <tr style="background: var(--card-gradient); font-weight: 600;">
            <td colspan="2">Subtotal (Before Rebate/Cess)</td>
            <td><strong>${formatCurrency(breakdown.reduce((sum, item) => sum + item.amount, 0))}</strong></td>
        </tr>
        <tr>
            <td colspan="2">After Rebate (if applicable)</td>
            <td><strong>${formatCurrency(finalTax)}</strong></td>
        </tr>
        <tr>
            <td colspan="2">Health & Education Cess (4%)</td>
            <td><strong>${formatCurrency(cess)}</strong></td>
        </tr>
        <tr style="background: var(--accent-500); color: white; font-size: 1.125rem;">
            <td colspan="2"><strong>Total Tax Payable</strong></td>
            <td><strong>${formatCurrency(finalTax + cess)}</strong></td>
        </tr>
    `;

    tbody.innerHTML = html;
}

// ============================================
// Regime Comparison
// ============================================
function calculateRegimeComparison(grossIncome) {
    // Calculate for old regime with deductions
    const section80c = Math.min(getInputValue('section80c'), 150000);
    const section80d = Math.min(getInputValue('section80d'), 100000);
    const section80ccd1b = Math.min(getInputValue('section80ccd1b'), 50000);
    const npsVatsalya = Math.min(getInputValue('npsVatsalya'), 50000);  // Budget 2025
    const homeLoanInterest = Math.min(getInputValue('homeLoanInterest'), 200000);
    const hra = getInputValue('hra');
    const lta = getInputValue('lta');

    // NEW deductions
    const section80e = getInputValue('section80e');
    const professionalTax = Math.min(getInputValue('professionalTax'), 2500);
    const section80tta = Math.min(getInputValue('section80tta'), 50000);
    const section80gg = Math.min(getInputValue('section80gg'), 60000);
    const section80dd = Math.min(getInputValue('section80dd'), 125000);
    const section80ddb = Math.min(getInputValue('section80ddb'), 100000);
    const section80u = Math.min(getInputValue('section80u'), 125000);
    const section80eea = Math.min(getInputValue('section80eea'), 150000);
    const section80g = getInputValue('section80g') * 0.5;
    const section80gga = getInputValue('section80gga');
    const section80ggc = getInputValue('section80ggc');

    const oldDeductions = section80c + section80d + section80ccd1b + npsVatsalya +
        homeLoanInterest + hra + lta + section80e + professionalTax +
        section80tta + section80gg + section80dd + section80ddb + section80u +
        section80eea + section80g + section80gga + section80ggc +
        STANDARD_DEDUCTION_OLD;
    const oldTaxableIncome = Math.max(0, grossIncome - oldDeductions);

    let oldBaseTax = calculateTaxForRegime(oldTaxableIncome, 'old').tax;
    if (oldTaxableIncome <= REBATE_LIMIT_OLD) {
        oldBaseTax = Math.max(0, oldBaseTax - REBATE_87A_OLD);
    }
    const oldTotalTax = oldBaseTax + (oldBaseTax * HEALTH_EDUCATION_CESS);

    // Calculate for new regime (Budget 2025: increased standard deduction to 75k)
    const newDeductions = STANDARD_DEDUCTION_NEW;
    const newTaxableIncome = Math.max(0, grossIncome - newDeductions);

    let newBaseTax = calculateTaxForRegime(newTaxableIncome, 'new').tax;
    if (newTaxableIncome <= REBATE_LIMIT_NEW) {  // Budget 2025: up to 12L
        newBaseTax = Math.max(0, newBaseTax - REBATE_87A_NEW);  // Budget 2025: 60k rebate
    }
    const newTotalTax = newBaseTax + (newBaseTax * HEALTH_EDUCATION_CESS);

    // Update comparison table
    document.getElementById('oldTaxableIncome').textContent = formatCurrency(oldTaxableIncome);
    document.getElementById('newTaxableIncome').textContent = formatCurrency(newTaxableIncome);
    document.getElementById('oldTotalTax').textContent = formatCurrency(oldTotalTax);
    document.getElementById('newTotalTax').textContent = formatCurrency(newTotalTax);
    document.getElementById('oldTakeHome').textContent = formatCurrency(grossIncome - oldTotalTax);
    document.getElementById('newTakeHome').textContent = formatCurrency(grossIncome - newTotalTax);

    // Recommendation
    const savings = Math.abs(oldTotalTax - newTotalTax);
    let recommendation;

    if (oldTotalTax < newTotalTax) {
        recommendation = `💡 Old Regime is better! Save ${formatCurrency(savings)} in taxes`;
    } else if (newTotalTax < oldTotalTax) {
        recommendation = `💡 New Regime is better! Save ${formatCurrency(savings)} in taxes`;
    } else {
        recommendation = `💡 Both regimes result in same tax. Choose based on your preference!`;
    }

    document.getElementById('recommendation').textContent = recommendation;
}

// ============================================
// Generate Investment Suggestions
// ============================================
function generateSuggestions(grossIncome, currentDeductions) {
    const container = document.getElementById('suggestions-container');

    if (grossIncome === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <strong>ℹ️ Note:</strong> Enter your income and deductions to get personalized investment suggestions for maximum tax savings.
            </div>
        `;
        return;
    }

    const current80c = Math.min(getInputValue('section80c'), 150000);
    const current80d = Math.min(getInputValue('section80d'), 100000);
    const current80ccd1b = Math.min(getInputValue('section80ccd1b'), 50000);
    const currentNpsVatsalya = Math.min(getInputValue('npsVatsalya'), 50000);  // Budget 2025

    const remaining80c = 150000 - current80c;
    const remaining80d = 100000 - current80d;
    const remaining80ccd1b = 50000 - current80ccd1b;
    const remainingNpsVatsalya = 50000 - currentNpsVatsalya;  // Budget 2025

    let suggestions = [];

    if (remaining80c > 0) {
        const taxSaving = remaining80c * 0.312; // Assuming 30% tax bracket + cess
        suggestions.push({
            title: '📊 Maximize Section 80C',
            desc: `You can still invest ₹${remaining80c.toLocaleString()} in 80C instruments (PPF, ELSS, LIC, etc.)`,
            amount: `Potential tax saving: ${formatCurrency(taxSaving)}`
        });
    }

    if (remaining80d > 0) {
        const taxSaving = remaining80d * 0.312;
        suggestions.push({
            title: '🏥 Increase Health Insurance Coverage',
            desc: `Add ₹${remaining80d.toLocaleString()} more in health insurance (self/family/parents)`,
            amount: `Potential tax saving: ${formatCurrency(taxSaving)}`
        });
    }

    if (remaining80ccd1b > 0) {
        const taxSaving = remaining80ccd1b * 0.312;
        suggestions.push({
            title: '👴 Invest in NPS (Self)',
            desc: `Invest ₹${remaining80ccd1b.toLocaleString()} in NPS for additional deduction under 80CCD(1B)`,
            amount: `Potential tax saving: ${formatCurrency(taxSaving)}`
        });
    }

    if (remainingNpsVatsalya > 0) {
        const taxSaving = remainingNpsVatsalya * 0.312;
        suggestions.push({
            title: '🆕 NPS Vatsalya (Budget 2025!)',
            desc: `Contribute ₹${remainingNpsVatsalya.toLocaleString()} to NPS for your children - New in Budget 2025!`,
            amount: `Potential tax saving: ${formatCurrency(taxSaving)}`
        });
    }

    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="alert alert-success">
                <strong>🎉 Excellent!</strong> You're maximizing all major tax deductions. Consider additional savings options below!
            </div>
        `;
    } else {
        let html = '<div class="alert alert-warning"><strong>💰 Opportunity to Save More!</strong> Here are personalized suggestions based on your current investments:</div>';

        suggestions.forEach(s => {
            html += `
                <div class="suggestion-item" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%); border-color: var(--warning-500);">
                    <div class="suggestion-title">${s.title}</div>
                    <div class="suggestion-desc">${s.desc}</div>
                    <div class="suggestion-amount">${s.amount}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
}

// ============================================
// Update ITR Form Suggestion
// ============================================
function updateITRFormSuggestion(grossIncome, houseProperty, capitalGains) {
    let form = 'ITR-1 (Sahaj)';
    let desc = 'For individuals with salary income, one house property, and other income up to ₹50 lakh.';

    if (grossIncome > 5000000 || capitalGains > 0 || houseProperty > 0) {
        form = 'ITR-2';
        desc = 'Recommended because you have capital gains or multiple income sources. ITR-2 covers salary, house property, and capital gains.';
    }

    if (grossIncome <= 5000000 && capitalGains === 0 && houseProperty === 0) {
        form = 'ITR-1 (Sahaj)';
        desc = 'Simple form for salary income. Quick and easy to file online.';
    }

    document.getElementById('itrForm').textContent = form;
    document.getElementById('itrFormDesc').textContent = desc;
}

// ============================================
// TAX OPTIMIZATION ENGINE
// ============================================

// Pre-calculated optimal strategies for common salary ranges
const OPTIMIZATION_STRATEGIES = {
    1275000: {
        title: "₹12.75 Lakh Salary - Zero Tax Achievable!",
        newRegime: {
            taxableIncome: 1200000,
            tax: 0,
            strategy: "Automatic zero tax with ₹75k standard deduction",
            note: "✨ No investments needed - Zero tax automatically!"
        },
        oldRegime: {
            optimal: {
                std: 50000,
                "80c": 150000,
                "80d": 50000,
                nps: 50000,
                total: 300000
            },
            taxableIncome: 975000,
            tax: 117000,
            strategy: "Even with full deductions, old regime costs more",
            note: "⚠️ Choose New Regime - Save ₹117k in taxes!"
        },
        recommendation: "new",
        savings: 117000
    },
    1500000: {
        title: "₹15 Lakh Salary - Massive Savings Possible!",
        newRegime: {
            taxableIncome: 1425000,
            tax: 196000,
            strategy: "Only ₹75k standard deduction available"
        },
        oldRegime: {
            optimal: {
                std: 50000,
                "80c": 150000,
                "80d": 100000,
                nps: 50000,
                npsVatsalya: 50000,
                "80e": 50000,
                "80tta": 10000,
                "80gg": 60000,
                professionalTax: 2500,
                homeLoan: 200000,
                hra: 200000,
                total: 922500
            },
            taxableIncome: 577500,
            tax: 16000,
            strategy: "Comprehensive deductions with education loan & rent",
            note: "💰 Save ₹1.80 Lakh with ALL deductions!"
        },
        recommendation: "old",
        savings: 180000
    },
    1750000: {
        title: "₹17.5 Lakh Salary - Optimize for Minimal Tax",
        newRegime: {
            taxableIncome: 1675000,
            tax: 268000,
            strategy: "Limited deductions"
        },
        oldRegime: {
            optimal: {
                std: 50000,
                "80c": 150000,
                "80d": 100000,
                nps: 50000,
                npsVatsalya: 50000,
                "80e": 75000,
                "80tta": 10000,
                "80gg": 60000,
                "80eea": 150000,
                professionalTax: 2500,
                homeLoan: 200000,
                hra: 250000,
                total: 1147500
            },
            taxableIncome: 602500,
            tax: 21000,
            strategy: "Comprehensive deductions + affordable housing benefit",
            note: "💰 Save ₹2.47 Lakh with ALL deductions!"
        },
        recommendation: "old",
        savings: 247000
    },
    2000000: {
        title: "₹20 Lakh Salary - Strategic Planning Needed",
        newRegime: {
            taxableIncome: 1925000,
            tax: 343000,
            strategy: "High tax without deductions"
        },
        oldRegime: {
            optimal: {
                std: 50000,
                "80c": 150000,
                "80d": 100000,
                nps: 50000,
                npsVatsalya: 50000,
                "80e": 100000,
                "80tta": 10000,
                "80gg": 60000,
                "80eea": 150000,
                professionalTax: 2500,
                homeLoan: 200000,
                hra: 300000,
                total: 1222500
            },
            taxableIncome: 777500,
            tax: 39000,
            strategy: "Maximum utilization of ALL available deductions",
            note: "💰 Save ₹3.04 Lakh with comprehensive planning!"
        },
        recommendation: "old",
        savings: 304000
    }
};

// Calculate optimal deductions for any salary
function calculateOptimalDeductions(grossSalary) {
    const recommendations = {
        section80c: 150000,  // Always max out
        section80d: 0,
        section80ccd1b: 50000,  // Always beneficial
        npsVatsalya: 50000,  // New benefit
        homeLoanInterest: 0,
        hra: 0
    };

    // Calculate remaining taxable after basic deductions
    let remaining = grossSalary - STANDARD_DEDUCTION_OLD - 150000 - 50000 - 50000;

    // Add 80D based on income level
    if (grossSalary >= 1500000) {
        recommendations.section80d = 100000; // Self + parents
        remaining -= 100000;
    } else if (grossSalary >= 1200000) {
        recommendations.section80d = 50000;
        remaining -= 50000;
    }

    // Suggest HRA if still taxable > 5L (to avoid high slabs)
    if (remaining > 500000) {
        const suggestedHRA = Math.min(Math.floor(grossSalary * 0.20), 300000);
        recommendations.hra = suggestedHRA;
        remaining -= suggestedHRA;
    }

    // Suggest home loan if still taxable > 5L
    if (remaining > 500000) {
        recommendations.homeLoanInterest = 200000;
        remaining -= 200000;
    }

    return recommendations;
}

// Generate investment roadmap
function generateInvestmentRoadmap(salary, targetTax = 0) {
    const steps = [];

    // Step 1: Section 80C (Mandatory savings)
    steps.push({
        priority: 1,
        section: "Section 80C",
        amount: 150000,
        options: ["PPF (Safe, 7% return)", "ELSS Mutual Funds (High returns)", "EPF (Automatic)"],
        taxSaving: 150000 * 0.312,
        required: true,
        note: "Essential first step - Build long-term wealth"
    });

    // Step 2: NPS for retirement
    steps.push({
        priority: 2,
        section: "80CCD(1B) - NPS",
        amount: 50000,
        options: ["NPS Tier 1 Account"],
        taxSaving: 50000 * 0.312,
        required: false,
        note: "Additional ₹50k deduction over 80C"
    });

    // Step 3: Health Insurance
    if (salary > 1200000) {
        const amount = salary > 1500000 ? 100000 : 50000;
        steps.push({
            priority: 3,
            section: "Section 80D",
            amount: amount,
            options: salary > 1500000 ? ["₹50k self + ₹50k parents"] : ["₹50k family health insurance"],
            taxSaving: amount * 0.312,
            required: false,
            note: "Essential protection + tax benefit"
        });
    }

    // Step 4: NPS Vatsalya
    steps.push({
        priority: 4,
        section: "NPS Vatsalya (NEW!)",
        amount: 50000,
        options: ["NPS account for children - Budget 2025"],
        taxSaving: 50000 * 0.312,
        required: false,
        note: "⚡ New in Budget 2025 - Additional deduction!"
    });

    // Step 5: Home Loan (conditional)
    if (salary > 1500000) {
        steps.push({
            priority: 5,
            section: "Home Loan Interest",
            amount: 200000,
            options: ["Housing loan interest deduction"],
            taxSaving: 200000 * 0.312,
            required: false,
            conditional: true,
            note: "If you have a home loan"
        });
    }

    // Step 6: HRA (conditional)
    const hraAmount = Math.min(Math.floor(salary * 0.20), 300000);
    if (hraAmount > 0) {
        steps.push({
            priority: 6,
            section: "HRA Exemption",
            amount: hraAmount,
            options: ["Claim if paying rent in metro cities"],
            taxSaving: hraAmount * 0.312,
            required: false,
            conditional: true,
            note: "If living in rented accommodation"
        });
    }

    return steps;
}

// Main optimize function
function optimizeForSalary(targetSalary) {
    const strategy = OPTIMIZATION_STRATEGIES[targetSalary];

    if (!strategy) {
        // Calculate dynamic optimization for non-standard salaries
        const optimal = calculateOptimalDeductions(targetSalary);
        showDynamicOptimization(targetSalary, optimal);
        return;
    }

    // Show pre-calculated optimization
    showOptimizationResults(strategy);

    // Optionally apply optimal values
    if (confirm(`Apply optimal investment strategy for ${formatCurrency(targetSalary)} salary?`)) {
        applyOptimalStrategy(strategy.oldRegime.optimal, targetSalary);
    }
}

// Apply optimal strategy to form
function applyOptimalStrategy(optimal, salary) {
    // Set salary if provided
    if (salary) {
        document.getElementById('salary').value = salary;
    }

    document.getElementById('section80c').value = optimal['80c'] || 0;
    document.getElementById('section80d').value = optimal['80d'] || 0;
    document.getElementById('section80ccd1b').value = optimal.nps || 0;
    document.getElementById('npsVatsalya').value = optimal.npsVatsalya || 0;
    document.getElementById('homeLoanInterest').value = optimal.homeLoan || 0;
    document.getElementById('hra').value = optimal.hra || 0;

    // NEW comprehensive deductions
    document.getElementById('section80e').value = optimal['80e'] || 0;
    document.getElementById('section80tta').value = optimal['80tta'] || 0;
    document.getElementById('section80gg').value = optimal['80gg'] || 0;
    document.getElementById('section80eea').value = optimal['80eea'] || 0;
    document.getElementById('professionalTax').value = optimal.professionalTax || 0;

    // Trigger calculation
    calculateTax();

    // Show success message
    const totalDeductions = Object.entries(optimal)
        .filter(([key]) => key !== 'total' && key !== 'std')
        .reduce((sum, [, val]) => sum + (val || 0), 0);
    alert(`✅ Applied optimal strategy!\n\nSalary: ${salary ? formatCurrency(salary) : 'Set manually'}\nTotal Deductions: ${formatCurrency(totalDeductions)}\n\nCheck the results below to see your tax savings!`);
}

// Show optimization results in UI
function showOptimizationResults(strategy) {
    const container = document.getElementById('optimizer-results');
    if (!container) return;

    const oldTax = strategy.oldRegime.tax;
    const newTax = strategy.newRegime.tax;
    const savings = Math.abs(oldTax - newTax);

    let html = `
        <div class="alert alert-success" style="margin-top: 1rem;">
            <h3 style="margin-bottom: 0.5rem;">${strategy.title}</h3>
        </div>
        
        <div class="grid grid-2" style="margin-top: 1rem;">
            <div class="result-box" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);">
                <div class="result-label">New Regime</div>
                <div class="result-value">${formatCurrency(newTax)}</div>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${strategy.newRegime.strategy}</p>
                ${strategy.newRegime.note ? `<p style="font-size: 0.875rem; color: var(--success-600);">${strategy.newRegime.note}</p>` : ''}
            </div>
            
            <div class="result-box" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);">
                <div class="result-label">Old Regime (Optimized)</div>
                <div class="result-value">${formatCurrency(oldTax)}</div>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${strategy.oldRegime.strategy}</p>
                ${strategy.oldRegime.note ? `<p style="font-size: 0.875rem; color: var(--warning-600); font-weight: 600;">${strategy.oldRegime.note}</p>` : ''}
            </div>
        </div>
        
        <div class="alert ${strategy.recommendation === 'new' ? 'alert-info' : 'alert-warning'}" style="margin-top: 1rem;">
            <strong>🎯 Best Choice:</strong> 
            ${strategy.recommendation === 'new' ? 'New Regime' : 'Old Regime'} 
            - Save ${formatCurrency(savings)} in taxes!
        </div>
        
        <div style="margin-top: 1.5rem;">
            <h3>Investment Breakdown (Old Regime):</h3>
            <div class="grid grid-2" style="margin-top: 1rem; gap: 0.5rem;">
                ${Object.entries(strategy.oldRegime.optimal).map(([key, value]) => {
        if (key === 'total') return '';
        const labels = {
            'std': 'Standard Deduction',
            '80c': 'Section 80C',
            '80d': 'Section 80D',
            'nps': 'NPS (80CCD1B)',
            'npsVatsalya': 'NPS Vatsalya',
            'homeLoan': 'Home Loan Interest',
            'hra': 'HRA Exemption'
        };
        return `<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: var(--gray-50); border-radius: var(--radius-md);">
                        <span>${labels[key] || key}:</span>
                        <strong>${formatCurrency(value)}</strong>
                    </div>`;
    }).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.classList.remove('hidden');

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// Download PDF Summary
// ============================================
function downloadPDF() {
    // Create a print-friendly version
    const printContent = `
        <html>
        <head>
            <title>Tax Summary - TaxSaver</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #6d28d9; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f3f4f6; }
                .highlight { background-color: #fef3c7; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>📊 Income Tax Summary - FY 2024-25</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            
            <h2>Income Details</h2>
            <table>
                <tr><td>Gross Salary</td><td>${document.getElementById('salary').value ? formatCurrency(getInputValue('salary')) : '₹ 0'}</td></tr>
                <tr><td>House Property</td><td>${formatCurrency(getInputValue('houseProperty'))}</td></tr>
                <tr><td>Capital Gains</td><td>${formatCurrency(getInputValue('capitalGains'))}</td></tr>
                <tr><td>Other Income</td><td>${formatCurrency(getInputValue('otherIncome'))}</td></tr>
                <tr class="highlight"><td>Total Gross Income</td><td>${document.getElementById('totalIncome').textContent}</td></tr>
            </table>
            
            <h2>Tax Calculation (${currentRegime === 'old' ? 'Old Regime' : 'New Regime'})</h2>
            <table>
                <tr><td>Taxable Income</td><td>${document.getElementById('taxableIncome').textContent}</td></tr>
                <tr><td>Income Tax</td><td>${document.getElementById('baseTax').textContent}</td></tr>
                <tr><td>Health & Education Cess</td><td>${document.getElementById('cess').textContent}</td></tr>
                <tr class="highlight"><td>Total Tax Payable</td><td>${document.getElementById('totalTax').textContent}</td></tr>
                <tr><td>Monthly Take Home</td><td>${document.getElementById('takeHome').textContent}</td></tr>
            </table>
            
            <h2>Recommendation</h2>
            <p>${document.getElementById('recommendation').textContent}</p>
            
            <h2>ITR Form</h2>
            <p><strong>${document.getElementById('itrForm').textContent}</strong> - ${document.getElementById('itrFormDesc').textContent}</p>
            
            <hr>
            <p style="font-size: 12px; color: #666;">
                <strong>Disclaimer:</strong> This is an indicative calculation. Please consult a tax advisor for accurate tax planning.
                Generated by TaxSaver - Income Tax Calculator
            </p>
        </body>
        </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// Reset Calculator
// ============================================
function resetCalculator() {
    if (confirm('Are you sure you want to reset all values?')) {
        // Reset all input fields
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = '';
        });

        // Reset to old regime
        selectRegime('old');

        // Recalculate
        calculateTax();

        alert('✅ Calculator has been reset!');
    }
}

// ============================================
// Initialize on page load
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Set initial regime
    selectRegime('old');

    // Add smooth scroll for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('🎉 TaxSaver Calculator Loaded Successfully!');
    console.log('✨ Updated for Budget 2025-26: Tax slabs for FY 2025-26 (AY 2026-27) are active.');
    console.log('📊 New features: Zero tax up to ₹12.75L, NPS Vatsalya deduction, higher standard deduction!');
});

// ============================================
// Auto-save to localStorage (optional feature)
// ============================================
function saveToLocalStorage() {
    const data = {
        salary: getInputValue('salary'),
        houseProperty: getInputValue('houseProperty'),
        capitalGains: getInputValue('capitalGains'),
        otherIncome: getInputValue('otherIncome'),
        section80c: getInputValue('section80c'),
        section80d: getInputValue('section80d'),
        section80ccd1b: getInputValue('section80ccd1b'),
        npsVatsalya: getInputValue('npsVatsalya'),  // Budget 2025
        homeLoanInterest: getInputValue('homeLoanInterest'),
        hra: getInputValue('hra'),
        lta: getInputValue('lta'),
        regime: currentRegime
    };
    localStorage.setItem('taxCalculatorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('taxCalculatorData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
            if (key === 'regime') {
                selectRegime(data[key]);
            } else {
                const element = document.getElementById(key);
                if (element) {
                    element.value = data[key];
                }
            }
        });
        calculateTax();
    }
}

// Optional: Auto-load saved data on page load
// Uncomment the line below to enable auto-load
// window.addEventListener('load', loadFromLocalStorage);
