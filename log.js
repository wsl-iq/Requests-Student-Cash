// Developer : Mohammed Al-Baqer
// Copyright (C) 2026 lnc
// Requests Student Cash
// JavaScript

window.activityLogs = window.activityLogs || [];

function addLog(type, action, details, bookingData) {
    var log = {
        id: 'LOG' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        type: type,
        action: action,
        details: details,
        bookingData: bookingData ? {
            id: bookingData.id,
            type: bookingData.type,
            students: bookingData.students ? bookingData.students.map(function(s) { 
                return { name: s.name, paid: s.paid }; 
            }) : [],
            college: bookingData.college,
            totalPrice: bookingData.totalPrice,
            paidAmount: bookingData.paidAmount,
            paymentStatus: bookingData.paymentStatus
        } : null,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('ar-IQ'),
        time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    window.activityLogs.unshift(log);
    if (window.activityLogs.length > 1000) {
        window.activityLogs = window.activityLogs.slice(0, 1000);
    }
    
    saveLogs();
    updateLogBadge();
}

function saveLogs() {
    try {
        localStorage.setItem('activityLogs', JSON.stringify(window.activityLogs));
    } catch(e) {}
}

function loadLogs() {
    try {
        var data = localStorage.getItem('activityLogs');
        if (data) {
            var parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                window.activityLogs = parsed;
            }
        }
    } catch(e) { 
        window.activityLogs = []; 
    }
}

function updateLogBadge() {
    var badge = document.getElementById('logCount');
    if (badge) {
        var today = new Date().toLocaleDateString('ar-IQ');
        var count = 0;
        for (var i = 0; i < window.activityLogs.length; i++) {
            if (window.activityLogs[i].date === today) {
                count++;
            }
        }
        badge.textContent = count;
    }
}

function renderLogs() {
    var container = document.getElementById('logList');
    if (!container) return;
    
    if (!window.activityLogs || window.activityLogs.length === 0) {
        container.innerHTML = '<div class="empty-logs"><i class="fas fa-clipboard-list"></i><p>لا توجد سجلات</p></div>';
        return;
    }
    
    var typeTexts = { 'add': 'إضافة', 'delete': 'حذف', 'update': 'تحديث', 'system': 'نظام' };
    
    var html = '';
    for (var i = 0; i < window.activityLogs.length; i++) {
        var log = window.activityLogs[i];
        var typeText = typeTexts[log.type] || 'نظام';
        var typeClass = log.type || '';
        
        html += '<div class="log-item ' + typeClass + '">';
        html += '<div class="log-header">';
        html += '<span class="log-type ' + typeClass + '">' + typeText + '</span>';
        html += '<span class="log-date">' + log.date + ' - ' + log.time + '</span>';
        html += '</div>';
        html += '<div class="log-details">' + escapeHtml(log.details || '') + '</div>';
        
        if (log.bookingData) {
            html += '<div style="margin-top:8px; font-size:13px; color:#666;">';
            if (log.bookingData.college) html += 'الكلية: ' + escapeHtml(log.bookingData.college) + ' | ';
            if (log.bookingData.totalPrice) html += 'المبلغ: ' + formatCurrency(log.bookingData.totalPrice);
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function clearLogs() {
    if (confirm('مسح جميع السجلات؟')) {
        window.activityLogs = [];
        saveLogs();
        renderLogs();
        updateLogBadge();
        showNotification('تم مسح السجلات', 'warning');
    }
}

function exportLogsToJson() {
    if (!window.activityLogs || window.activityLogs.length === 0) {
        showNotification('لا توجد سجلات', 'warning');
        return;
    }
    
    var data = { date: new Date().toISOString(), totalLogs: window.activityLogs.length, logs: window.activityLogs };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logs_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    showNotification('تم التصدير', 'success');
}

document.addEventListener('DOMContentLoaded', function() {
    loadLogs();
    updateLogBadge();
});