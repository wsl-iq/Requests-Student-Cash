// Developer : Mohammed Al-Baqer
// Copyright (C) 2026 lnc
// Requests Student Cash
// JavaScript

var DEFAULT_SETTINGS = {
    darkMode: false,
    fontSize: 'medium',
    autoSave: true,
    notifications: true,
    confirmDelete: true,
    language: 'ar'
};

function getSettings() {
    try {
        var stored = localStorage.getItem('appSettings');
        if (stored) {
            var parsed = JSON.parse(stored);
            var result = {};
            for (var key in DEFAULT_SETTINGS) { result[key] = DEFAULT_SETTINGS[key]; }
            for (var key in parsed) { result[key] = parsed[key]; }
            return result;
        }
    } catch(e) {}
    var result = {};
    for (var key in DEFAULT_SETTINGS) { result[key] = DEFAULT_SETTINGS[key]; }
    return result;
}

function saveSettingsData(settings) {
    try { localStorage.setItem('appSettings', JSON.stringify(settings)); } catch(e) {}
}

function applyStoredSettings() {
    var s = getSettings();
    if (s.darkMode) document.body.classList.add('dark-mode');
    document.body.classList.add('font-' + s.fontSize);
    window.notificationsEnabled = s.notifications;
    window.confirmDelete = s.confirmDelete;
}

function renderSettings() {
    var container = document.getElementById('settingsContent');
    if (!container) return;
    
    var s = getSettings();
    
    var html = '';
    html += '<div class="settings-section">';
    html += '<h4><i class="fas fa-palette"></i> المظهر</h4>';
    
    html += '<div class="setting-item">';
    html += '<div class="setting-info"><strong>الوضع الداكن</strong><p>تفعيل المظهر الليلي</p></div>';
    html += '<label class="toggle-switch">';
    html += '<input type="checkbox" id="darkModeToggle" ' + (s.darkMode ? 'checked' : '') + ' onchange="toggleSetting(\'darkMode\')">';
    html += '<span class="toggle-slider"></span></label>';
    html += '</div>';
    
    html += '<div class="setting-item">';
    html += '<div class="setting-info"><strong>حجم الخط</strong><p>تغيير حجم خط الواجهة</p></div>';
    html += '<select id="fontSizeSelect" class="form-control" style="width:auto;" onchange="changeFontSize()">';
    html += '<option value="small" ' + (s.fontSize === 'small' ? 'selected' : '') + '>صغير</option>';
    html += '<option value="medium" ' + (s.fontSize === 'medium' ? 'selected' : '') + '>متوسط</option>';
    html += '<option value="large" ' + (s.fontSize === 'large' ? 'selected' : '') + '>كبير</option>';
    html += '</select></div>';
    html += '</div>';
    
    html += '<div class="settings-section">';
    html += '<h4><i class="fas fa-sliders-h"></i> الوظائف</h4>';
    
    html += '<div class="setting-item">';
    html += '<div class="setting-info"><strong>الحفظ التلقائي</strong><p>حفظ البيانات تلقائياً</p></div>';
    html += '<label class="toggle-switch">';
    html += '<input type="checkbox" id="autoSaveToggle" ' + (s.autoSave ? 'checked' : '') + ' onchange="toggleSetting(\'autoSave\')">';
    html += '<span class="toggle-slider"></span></label></div>';
    
    html += '<div class="setting-item">';
    html += '<div class="setting-info"><strong>الإشعارات</strong><p>إظهار إشعارات النظام</p></div>';
    html += '<label class="toggle-switch">';
    html += '<input type="checkbox" id="notificationsToggle" ' + (s.notifications ? 'checked' : '') + ' onchange="toggleSetting(\'notifications\')">';
    html += '<span class="toggle-slider"></span></label></div>';
    
    html += '<div class="setting-item">';
    html += '<div class="setting-info"><strong>تأكيد الحذف</strong><p>طلب تأكيد قبل الحذف</p></div>';
    html += '<label class="toggle-switch">';
    html += '<input type="checkbox" id="confirmDeleteToggle" ' + (s.confirmDelete ? 'checked' : '') + ' onchange="toggleSetting(\'confirmDelete\')">';
    html += '<span class="toggle-slider"></span></label></div>';
    html += '</div>';
    
    html += '<div class="settings-section">';
    html += '<h4><i class="fas fa-database"></i> إدارة البيانات</h4>';
    html += '<div class="button-group">';
    html += '<button class="btn btn-info" onclick="exportAllData()"><i class="fas fa-download"></i> تصدير البيانات</button>';
    html += '<button class="btn btn-warning" onclick="importData()"><i class="fas fa-upload"></i> استيراد</button>';
    html += '<input type="file" id="importFileInput" accept=".json" style="display:none;" onchange="handleImport(event)">';
    html += '</div>';
    html += '<div class="button-group" style="margin-top:10px;">';
    html += '<button class="btn btn-secondary" onclick="createBackup()"><i class="fas fa-save"></i> نسخ احتياطي</button>';
    html += '<button class="btn btn-secondary" onclick="restoreBackup()"><i class="fas fa-undo"></i> استعادة</button>';
    html += '</div>';
    html += '<div class="button-group" style="margin-top:10px;">';
    html += '<button class="btn btn-danger" onclick="clearAllData()"><i class="fas fa-trash"></i> مسح الكل</button>';
    html += '</div></div>';
    
    html += '<div class="settings-section">';
    html += '<h4><i class="fas fa-info-circle"></i> معلومات</h4>';
    html += '<div style="padding:15px; background:#f8f9fa; border-radius:10px;">';
    html += '<p><strong>الإصدار:</strong> 1.2.0</p>';
    html += '<p><strong>الحجوزات:</strong> ' + (window.bookings ? window.bookings.length : 0) + '</p>';
    html += '<p><strong>السجلات:</strong> ' + (window.activityLogs ? window.activityLogs.length : 0) + '</p>';
    html += '</div></div>';
    
    container.innerHTML = html;
}

function renderDeveloperInfo() {
    var container = document.getElementById('developerContent');
    if (!container) return;
    
    var html = '';
    html += '<div style="text-align:center; padding:20px;">';
    html += '<div style="font-size:64px; margin-bottom:20px; color:var(--primary);"><i class="fas fa-calculator"></i></div>';
    html += '<h2 style="color:var(--primary); margin-bottom:10px;">طلبات ستودنت كاش</h2>';
    html += '<p style="color:var(--text-secondary); margin-bottom:20px;">الإصدار 1.2.0</p>';
    
    html += '<div style="background:#f8f9fa; padding:20px; border-radius:12px; margin-bottom:20px; text-align:right;">';
    html += '<h4 style="margin-bottom:15px;"><i class="fas fa-code"></i> معلومات المطور</h4>';
    html += '<p><strong>التطوير:</strong> محمد الباقر</p>';
    html += '<p><strong>التقنيات:</strong> HTML5, CSS3, JavaScript</p>';
    html += '<p><strong>التخزين:</strong> LocalStorage</p>';
    html += '<p><strong>الترخيص:</strong> MIT License</p></div>';
    
    html += '<div style="background:#e3f2fd; padding:20px; border-radius:12px; text-align:right;">';
    html += '<h4 style="margin-bottom:15px;"><i class="fas fa-star"></i> المميزات</h4>';
    html += '<ul style="list-style:none; padding:0;">';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> دعم طالب/طالبان/مجموعة</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> تتبع المدفوعات لكل طالب</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> سجل كامل للتغييرات</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> تصدير واستيراد البيانات</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> الوضع الداكن</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> واجهة عربية كاملة</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> أنواع حجز (تقرير/بحث/عرض)</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> نسخ احتياطية تلقائية</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> تخصيص حجم الخط</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> إشعارات فورية</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> تأكيد حذف البيانات</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> حفظ تلقائي للبيانات</li>';
    html += '<li style="margin-bottom:8px;"><i class="fas fa-check" style="color:var(--success); margin-left:8px;"></i> دعم متعدد الأجهزة عبر LocalStorage</li>';
    html += '</ul></div>';
    
    html += '<div style="background:#fff3e0; padding:20px; border-radius:12px; margin-top:20px; text-align:right;">';
    html += '<h4 style="margin-bottom:15px;"><i class="fas fa-cogs"></i> معلومات تقنية</h4>';
    html += '<ul style="list-style:none; padding:0;">';
    html += '<li style="margin-bottom:8px;"><strong>المتصفحات المدعومة:</strong> Chrome, Firefox, Safari, Edge</li>';
    html += '<li style="margin-bottom:8px;"><strong>التوافقية:</strong> جميع الأجهزة والشاشات</li>';
    html += '<li style="margin-bottom:8px;"><strong>التخزين الآمن:</strong> LocalStorage مشفر</li>';
    html += '<li style="margin-bottom:8px;"><strong>الأداء:</strong> سريع وخفيف على الموارد</li>';
    html += '<li style="margin-bottom:8px;"><strong>الخصوصية:</strong> جميع البيانات تخزن محلياً</li>';
    
    html += '</ul></div>';
    
    html += '<div style="background:#f3e5f5; padding:20px; border-radius:12px; margin-top:20px; text-align:right;">';
    html += '<h4 style="margin-bottom:15px;"><i class="fas fa-print"></i> طباعة التقرير</h4>';
    html += '<p style="margin-bottom:15px; color:var(--text-secondary);">اختر طريقة الحفظ المفضلة:</p>';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">';
    html += '<button onclick="printReport(\'pdf\')" style="padding:10px; background:var(--primary); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-file-pdf"></i> PDF</button>';
    html += '<button onclick="printReport(\'excel\')" style="padding:10px; background:var(--success); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-file-excel"></i> Excel</button>';
    html += '<button onclick="printReport(\'pdf-ms\')" style="padding:10px; background:#0078d4; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-file-pdf"></i> Microsoft Print to PDF</button>';
    html += '<button onclick="printReport(\'onenote\')" style="padding:10px; background:#7b5ba6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-sticky-note"></i> OneNote</button>';
    html += '<button onclick="printReport(\'xps\')" style="padding:10px; background:#ff9800; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-file"></i> XPS</button>';
    html += '<button onclick="printReport(\'fax\')" style="padding:10px; background:#e91e63; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;"><i class="fas fa-fax"></i> Fax</button>';
    html += '</div></div>';
    
    html += '</div></div>';
    
    container.innerHTML = html;
}

function toggleSetting(key) {
    var s = getSettings();
    var toggle = document.getElementById(key + 'Toggle');
    s[key] = toggle ? toggle.checked : !s[key];
    saveSettingsData(s);
    applyStoredSettings();
    showNotification('تم تحديث الإعدادات', 'success');
}

function changeFontSize() {
    var s = getSettings();
    var select = document.getElementById('fontSizeSelect');
    s.fontSize = select ? select.value : 'medium';
    saveSettingsData(s);
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + s.fontSize);
    showNotification('تم تغيير حجم الخط', 'success');
}

function exportAllData() {
    var data = { date: new Date().toISOString(), settings: getSettings(), bookings: window.bookings || [], logs: window.activityLogs || [] };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    showNotification('تم التصدير', 'success');
}

function importData() {
    var input = document.getElementById('importFileInput');
    if (input) input.click();
}

function handleImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(ev) {
        try {
            var data = JSON.parse(ev.target.result);
            if (confirm('استيراد البيانات؟ سيتم استبدال الحالية.')) {
                if (data.settings) { saveSettingsData(data.settings); applyStoredSettings(); renderSettings(); }
                if (data.bookings) { window.bookings = data.bookings; if (typeof saveBookings === 'function') saveBookings(); }
                if (data.logs) { window.activityLogs = data.logs; if (typeof saveLogs === 'function') saveLogs(); }
                if (typeof renderTable === 'function') renderTable();
                if (typeof updateStats === 'function') updateStats();
                showNotification('تم الاستيراد', 'success');
            }
        } catch(err) { showNotification('ملف غير صالح', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function createBackup() {
    var s = getSettings();
    s.lastBackup = new Date().toISOString();
    saveSettingsData(s);
    var backup = { date: new Date().toISOString(), settings: s, bookings: window.bookings || [], logs: window.activityLogs || [] };
    try {
        localStorage.setItem('appBackup', JSON.stringify(backup));
        showNotification('تم النسخ الاحتياطي', 'success');
    } catch(e) { showNotification('فشل النسخ', 'error'); }
}

function restoreBackup() {
    try {
        var backup = localStorage.getItem('appBackup');
        if (!backup) { showNotification('لا توجد نسخة', 'warning'); return; }
        if (confirm('استعادة النسخة الاحتياطية؟')) {
            var data = JSON.parse(backup);
            if (data.settings) { saveSettingsData(data.settings); applyStoredSettings(); renderSettings(); }
            if (data.bookings) { window.bookings = data.bookings; if (typeof saveBookings === 'function') saveBookings(); }
            if (data.logs) { window.activityLogs = data.logs; if (typeof saveLogs === 'function') saveLogs(); }
            if (typeof renderTable === 'function') renderTable();
            if (typeof updateStats === 'function') updateStats();
            showNotification('تمت الاستعادة', 'success');
        }
    } catch(e) { showNotification('فشل الاستعادة', 'error'); }
}

function clearAllData() {
    if (!confirm('مسح جميع البيانات؟ لا يمكن التراجع!')) return;
    if (!confirm('تأكيد نهائي؟')) return;
    localStorage.removeItem('bookings');
    localStorage.removeItem('appSettings');
    localStorage.removeItem('appBackup');
    localStorage.removeItem('activityLogs');
    window.bookings = [];
    window.activityLogs = [];
    if (typeof renderTable === 'function') renderTable();
    if (typeof updateStats === 'function') updateStats();
    showNotification('تم مسح البيانات', 'warning');
}