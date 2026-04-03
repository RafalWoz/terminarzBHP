// Database setup using Dexie.js
const db = new Dexie("BHPDatabase");
db.version(1).stores({
    company: "nip, name, address",
    employees: "++id, name, position, lastExam, nextExam, lastTraining, nextTraining",
    settings: "key, value"
});

// State management
const state = {
    view: 'loading',
    company: null,
    employees: [],
};

// Elements
const views = {
    loading: document.getElementById('view-loading'),
    onboarding: document.getElementById('view-onboarding'),
    dashboard: document.getElementById('view-dashboard'),
    employees: document.getElementById('view-employees'),
};

const nipInput = document.getElementById('nipInput');
const startBtn = document.getElementById('startBtn');
const companyNameEl = document.getElementById('companyName');
const companyNipEl = document.getElementById('companyNip');

// Modals
const modalAddEmployee = document.getElementById('modal-add-employee');
const employeeForm = document.getElementById('employeeForm');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const modalOverlay = document.getElementById('modal-overlay');

// Lists and Stats
const employeeList = document.getElementById('employeeList');
const fullEmployeeList = document.getElementById('fullEmployeeList');
const emptyState = document.getElementById('emptyState');
const statsEls = {
    total: document.querySelector('.grid-cols-3 > div:nth-child(1) span'),
    expired: document.querySelector('.grid-cols-3 > div:nth-child(2) span'),
    urgent: document.querySelector('.grid-cols-3 > div:nth-child(3) span'),
};

// Initialize app
async function init() {
    console.log('Initializing app...');
    
    const company = await db.company.toCollection().first();
    const employees = await db.employees.toArray();
    
    state.employees = employees;
    
    if (company) {
        state.company = company;
        showView('dashboard');
        updateDashboard();
    } else {
        showView('onboarding');
    }
    
    setupEventListeners();
}

// View switching
function showView(viewId) {
    Object.keys(views).forEach(v => {
        if (v === viewId) {
            views[v].classList.remove('hidden');
        } else {
            views[v].classList.add('hidden');
        }
    });
    
    // Update nav icons color
    document.querySelectorAll('nav:last-child button').forEach(btn => {
        btn.classList.add('text-gray-400');
        btn.classList.remove('text-brand-600');
    });
    
    const navMapping = {
        dashboard: 'nav-start',
        employees: 'nav-employees',
    };
    
    if (navMapping[viewId]) {
        const activeNav = document.getElementById(navMapping[viewId]);
        activeNav.classList.remove('text-gray-400');
        activeNav.classList.add('text-brand-600');
    }
    
    state.view = viewId;
}

// GUS Mock API
async function lookupCompany(nip) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockCompanies = {
        "1234567890": { name: "BHP POLSKA SP. Z O.O.", address: "ul. Przykładowa 1, Warszawa" },
        "0987654321": { name: "BUDOWA-MAX KRZYSZTOF NOWAK", address: "ul. Budowlana 15, Poznań" }
    };
    return mockCompanies[nip] || { name: `Firma o NIP ${nip}`, address: "Dane nieznane" };
}

// Stats Calculation
function calculateStats() {
    const now = new Date();
    const urgentThreshold = new Date();
    urgentThreshold.setDate(now.getDate() + 30);
    
    let expired = 0;
    let urgent = 0;
    
    state.employees.forEach(emp => {
        const nextExam = new Date(emp.nextExam);
        const nextTraining = new Date(emp.nextTraining);
        
        const earliest = nextExam < nextTraining ? nextExam : nextTraining;
        
        if (earliest < now) {
            expired++;
        } else if (earliest < urgentThreshold) {
            urgent++;
        }
    });
    
    return { total: state.employees.length, expired, urgent };
}

// Dashboard Update
function updateDashboard() {
    if (state.company) {
        companyNameEl.textContent = state.company.name;
        companyNipEl.textContent = `NIP: ${state.company.nip}`;
    }
    
    const stats = calculateStats();
    statsEls.total.textContent = stats.total;
    statsEls.expired.textContent = stats.expired;
    statsEls.urgent.textContent = stats.urgent;
    
    renderEmployeeLists();
}

function renderEmployeeLists() {
    const render = (container, list) => {
        container.innerHTML = '';
        list.forEach(emp => {
            const status = getEmployeeStatus(emp);
            const card = document.createElement('div');
            card.className = "bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between";
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 ${status.bg} ${status.text} rounded-full flex items-center justify-center font-bold">
                        ${emp.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-name">${emp.name}</h4>
                        <p class="text-[10px] text-gray-400 uppercase tracking-wider">${emp.position}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="pdfBtn p-2 bg-gray-50 text-gray-400 hover:text-brand-600 rounded-lg transition-colors" data-id="${emp.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    <div class="text-right">
                        <span class="text-[10px] font-bold ${status.text} uppercase block">${status.label}</span>
                        <p class="text-[10px] text-gray-500 italic">Do: ${status.date}</p>
                    </div>
                </div>
            `;
            
            card.querySelector('.pdfBtn').onclick = () => generateReferral(emp);
            container.appendChild(card);
        });
    };

    if (state.employees.length === 0) {
        emptyState.classList.remove('hidden');
        employeeList.innerHTML = '';
    } else {
        emptyState.classList.add('hidden');
        render(employeeList, state.employees.slice(0, 3));
        render(fullEmployeeList, state.employees);
    }
}

async function generateReferral(emp) {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { name, nip, address } = state.company;
    
    // Header
    page.drawText('SKIEROWANIE NA BADANIA LEKARSKIE', { x: 150, y: 780, size: 16, font: fontBold });
    page.drawText('(wstępne / okresowe / kontrolne)', { x: 220, y: 760, size: 10, font: font });
    
    // Company Info
    page.drawText(`Pracodawca: ${name}`, { x: 50, y: 720, size: 12, font: font });
    page.drawText(`NIP: ${nip}`, { x: 50, y: 705, size: 12, font: font });
    page.drawText(`Adres: ${address}`, { x: 50, y: 690, size: 12, font: font });
    
    // Employee Info
    page.drawText('DANE PRACOWNIKA:', { x: 50, y: 640, size: 12, font: fontBold });
    page.drawText(`Imię i Nazwisko: ${emp.name}`, { x: 50, y: 620, size: 12, font: font });
    page.drawText(`Stanowisko: ${emp.position}`, { x: 50, y: 605, size: 12, font: font });
    
    // Placeholder text
    page.drawText('Niniejszym kierujemy na badania lekarskie w celu stwierdzenia braku', { x: 50, y: 550, size: 11, font: font });
    page.drawText('przeciwwskazań do pracy na wymienionym stanowisku w warunkach', { x: 50, y: 535, size: 11, font: font });
    page.drawText('szczególnie uciążliwych lub szkodliwych dla zdrowia.', { x: 50, y: 520, size: 11, font: font });
    
    // Signature lines
    page.drawText('................................................', { x: 350, y: 450, size: 10 });
    page.drawText('Data i podpis pracodawcy', { x: 375, y: 435, size: 10, font: font });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skierowanie_${emp.name.replace(/\s+/g, '_')}.pdf`;
    link.click();
}

function getEmployeeStatus(emp) {
    const now = new Date();
    const urgentThreshold = new Date();
    urgentThreshold.setDate(now.getDate() + 30);
    
    const nextExam = new Date(emp.nextExam);
    const nextTraining = new Date(emp.nextTraining);
    
    const earliest = nextExam < nextTraining ? nextExam : nextTraining;
    const dateStr = earliest.toLocaleDateString();
    
    if (earliest < now) {
        return { label: 'Po terminie', date: dateStr, bg: 'bg-red-50', text: 'text-red-600' };
    } else if (earliest < urgentThreshold) {
        return { label: 'Pilne', date: dateStr, bg: 'bg-amber-50', text: 'text-amber-600' };
    } else {
        return { label: 'W porządku', date: dateStr, bg: 'bg-green-50', text: 'text-green-600' };
    }
}

// Setup Event Listeners
function setupEventListeners() {
    startBtn.addEventListener('click', async () => {
        const nip = nipInput.value.trim();
        if (nip.length !== 10) {
            alert('Podaj poprawny 10-cyfrowy NIP.');
            return;
        }
        
        startBtn.disabled = true;
        startBtn.innerHTML = `Pobieranie danych...`;
        
        try {
            const companyData = await lookupCompany(nip);
            const company = { ...companyData, nip };
            await db.company.put(company);
            state.company = company;
            showView('dashboard');
            updateDashboard();
        } catch (error) {
            console.error(error);
            alert('Błąd pobierania danych.');
        } finally {
            startBtn.disabled = false;
            startBtn.innerHTML = `Sprawdź i Zacznij`;
        }
    });

    document.querySelectorAll('.addEmployeeBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalAddEmployee.classList.remove('hidden');
        });
    });

    cancelAddBtn.addEventListener('click', () => modalAddEmployee.classList.add('hidden'));
    modalOverlay.addEventListener('click', () => modalAddEmployee.classList.add('hidden'));

    employeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(employeeForm);
        const employee = Object.fromEntries(formData.entries());
        
        await db.employees.add(employee);
        state.employees.push(employee);
        
        modalAddEmployee.classList.add('hidden');
        employeeForm.reset();
        updateDashboard();
    });

    // Nav
    document.getElementById('nav-start').addEventListener('click', () => showView('dashboard'));
    document.getElementById('nav-employees').addEventListener('click', () => showView('employees'));
    document.getElementById('nav-backup').addEventListener('click', () => exportData());
}

async function exportData() {
    const company = await db.company.toArray();
    const employees = await db.employees.toArray();
    
    const data = {
        version: 1,
        date: new Date().toISOString(),
        company: company[0] || null,
        employees: employees
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_bhp_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Kopia zapasowa została wygenerowana i pobrana.');
}

// Register SW
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

// Run
init();

// Handle PWA Install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
    }
});

// Run Init
init();
