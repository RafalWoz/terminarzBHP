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
    import: document.getElementById('view-import'),
    docs: document.getElementById('view-docs'),
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

// Import Elements
const importBtn = document.getElementById('importBtn');
const selectFileBtn = document.getElementById('selectFileBtn');
const importFileInput = document.getElementById('importFileInput');
const importStep1 = document.getElementById('import-step-1');
const importStep2 = document.getElementById('import-step-2');
const mappingFields = document.getElementById('mappingFields');
const executeImportBtn = document.getElementById('executeImportBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');

let importData = []; // Temporary storage for parsed rows
let importHeaders = []; // Temporary storage for file headers

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
    document.getElementById('nav-docs').addEventListener('click', () => showView('docs'));
    document.getElementById('nav-backup').addEventListener('click', () => exportData());

    // Import Flow
    importBtn.addEventListener('click', () => showView('import'));
    document.getElementById('importBtn2').addEventListener('click', () => showView('import'));
    selectFileBtn.addEventListener('click', () => importFileInput.click());
    
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });

    cancelImportBtn.addEventListener('click', () => {
        showView('employees');
        importStep1.classList.remove('hidden');
        importStep2.classList.add('hidden');
        importFileInput.value = '';
    });

    executeImportBtn.addEventListener('click', () => executeImport());

    // Documents Flow
    document.getElementById('generatePackageBtn').addEventListener('click', () => generateInspectionPackage());
}

async function generateInspectionPackage() {
    const spinner = document.getElementById('packageSpinner');
    spinner.classList.remove('hidden');

    try {
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const { name, nip, address } = state.company;
        const today = new Date().toLocaleDateString();

        // --- PAGE 1: TITLE ---
        let page = pdfDoc.addPage([595.28, 841.89]);
        page.drawText('PAKIET KONTROLNY BHP', { x: 50, y: 700, size: 30, font: fontBold, color: rgb(0.15, 0.39, 0.92) });
        page.drawText('Dokumentacja zbiorcza wygenerowana automatycznie', { x: 50, y: 670, size: 12, font: font });
        
        page.drawText('DANE FIRMY:', { x: 50, y: 580, size: 14, font: fontBold });
        page.drawText(`Nazwa: ${name}`, { x: 50, y: 555, size: 12, font: font });
        page.drawText(`NIP: ${nip}`, { x: 50, y: 540, size: 12, font: font });
        page.drawText(`Adres: ${address}`, { x: 50, y: 525, size: 12, font: font });
        
        page.drawText(`Data wygenerowania: ${today}`, { x: 50, y: 100, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });

        // --- PAGE 2: SUMMARY STATUSES ---
        page = pdfDoc.addPage([595.28, 841.89]);
        page.drawText('1. ZBIORCZE ZESTAWIENIE STATUSÓW', { x: 50, y: 800, size: 16, font: fontBold });
        
        let y = 760;
        // Table Headers
        page.drawText('Pracownik', { x: 50, y, size: 10, font: fontBold });
        page.drawText('Badania', { x: 250, y, size: 10, font: fontBold });
        page.drawText('Szkolenie', { x: 400, y, size: 10, font: fontBold });
        y -= 20;

        state.employees.forEach(emp => {
            const examStatus = getEmployeeStatus({ nextExam: emp.nextExam, nextTraining: '2099-01-01' });
            const trainStatus = getEmployeeStatus({ nextExam: '2099-01-01', nextTraining: emp.nextTraining });
            
            page.drawText(`${emp.name}`, { x: 50, y, size: 10, font: font });
            page.drawText(`${examStatus.label}`, { x: 250, y, size: 10, font: font });
            page.drawText(`${trainStatus.label}`, { x: 400, y, size: 10, font: font });
            y -= 15;
            
            if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
        });

        // --- PAGE 3: MEDICAL EXAMS REGISTER ---
        page = pdfDoc.addPage([595.28, 841.89]);
        page.drawText('2. REJESTR BADAŃ LEKARSKICH', { x: 50, y: 800, size: 16, font: fontBold });
        y = 760;
        page.drawText('Pracownik', { x: 50, y, size: 10, font: fontBold });
        page.drawText('Ważne do', { x: 250, y, size: 10, font: fontBold });
        page.drawText('PODPIS PRACOWNIKA', { x: 400, y, size: 10, font: fontBold });
        y -= 25;

        state.employees.forEach(emp => {
            page.drawText(`${emp.name}`, { x: 50, y, size: 10, font: font });
            page.drawText(`${new Date(emp.nextExam).toLocaleDateString()}`, { x: 250, y, size: 10, font: font });
            page.drawText('..........................................', { x: 400, y, size: 10 });
            y -= 30;
            if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
        });

        // --- PAGE 4: TRAINING REGISTER ---
        page = pdfDoc.addPage([595.28, 841.89]);
        page.drawText('3. REJESTR SZKOLEŃ BHP', { x: 50, y: 800, size: 16, font: fontBold });
        y = 760;
        page.drawText('Pracownik', { x: 50, y, size: 10, font: fontBold });
        page.drawText('Ważne do', { x: 250, y, size: 10, font: fontBold });
        page.drawText('PODPIS PRACOWNIKA', { x: 400, y, size: 10, font: fontBold });
        y -= 25;

        state.employees.forEach(emp => {
            page.drawText(`${emp.name}`, { x: 50, y, size: 10, font: font });
            page.drawText(`${new Date(emp.nextTraining).toLocaleDateString()}`, { x: 250, y, size: 10, font: font });
            page.drawText('..........................................', { x: 400, y, size: 10 });
            y -= 30;
            if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pakiet_bhp_${name.replace(/\s+/g, '_')}_${today.replace(/\./g, '-')}.pdf`;
        link.click();
        
    } catch (error) {
        console.error(error);
        alert('Błąd podczas generowania pakietu.');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function handleFileSelect(file) {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                importHeaders = results.meta.fields;
                importData = results.data;
                showMappingUI();
            }
        });
    } else if (['xlsx', 'xls'].includes(extension)) {
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length > 0) {
                importHeaders = Object.keys(jsonData[0]);
                importData = jsonData;
                showMappingUI();
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function showMappingUI() {
    importStep1.classList.add('hidden');
    importStep2.classList.remove('hidden');
    
    const fields = [
        { key: 'name', label: 'Imię i Nazwisko' },
        { key: 'position', label: 'Stanowisko' },
        { key: 'lastExam', label: 'Ostatnie Badania' },
        { key: 'nextExam', label: 'Następne Badania' },
        { key: 'lastTraining', label: 'Ostatnie Szkolenie' },
        { key: 'nextTraining', label: 'Następne Szkolenie' }
    ];

    mappingFields.innerHTML = fields.map(f => `
        <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold text-gray-400 capitalize">${f.label}</label>
            <select data-field="${f.key}" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-600 transition-all">
                <option value="">-- Pomiń / Brak --</option>
                ${importHeaders.map(h => `<option value="${h}">${h}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

async function executeImport() {
    const mappings = {};
    document.querySelectorAll('#mappingFields select').forEach(select => {
        if (select.value) mappings[select.dataset.field] = select.value;
    });

    if (!mappings.name) {
        alert('Musisz wybrać kolumnę dla pola "Imię i Nazwisko"!');
        return;
    }

    executeImportBtn.disabled = true;
    executeImportBtn.textContent = 'Importowanie...';

    const newEmployees = importData.map(row => {
        const emp = {
            name: row[mappings.name] || 'Brak danych',
            position: row[mappings.position] || 'Brak danych',
            lastExam: row[mappings.lastExam] ? parseAnyDate(row[mappings.lastExam]) : '',
            nextExam: row[mappings.nextExam] ? parseAnyDate(row[mappings.nextExam]) : '',
            lastTraining: row[mappings.lastTraining] ? parseAnyDate(row[mappings.lastTraining]) : '',
            nextTraining: row[mappings.nextTraining] ? parseAnyDate(row[mappings.nextTraining]) : ''
        };
        return emp;
    });

    for (const emp of newEmployees) {
        await db.employees.add(emp);
    }

    state.employees = await db.employees.toArray();
    alert(`Pomyślnie zaimportowano ${newEmployees.length} pracowników.`);
    
    // Reset and Go back
    executeImportBtn.disabled = false;
    executeImportBtn.textContent = 'Importuj Dane';
    importStep1.classList.remove('hidden');
    importStep2.classList.add('hidden');
    showView('employees');
    updateDashboard();
}

function parseAnyDate(val) {
    if (!val) return '';
    // If it's a number (Excel serial date)
    if (typeof val === 'number') {
        const d = new Date((val - 25569) * 86400 * 1000);
        return d.toISOString().split('T')[0];
    }
    // Try to parse string
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    // Try manual conversion for DD.MM.RRRR
    const parts = val.toString().split(/[\.-]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`; // YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD.MM.YYYY -> YYYY-MM-DD
    }
    return val; // Fallback
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
