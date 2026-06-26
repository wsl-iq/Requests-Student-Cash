// Developer : Mohammed Al-Baqer
// Copyright (C) 2026 lnc
// Requests Student Cash
// JavaScript

window.bookings = window.bookings || [];
let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    setupListeners();
    renderTable();
    updateStats();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    if (typeof applyStoredSettings === 'function') applyStoredSettings();
});

function loadBookings() {
    try {
        var data = localStorage.getItem('bookings');
        if (data) {
            var parsed = JSON.parse(data);
            window.bookings = Array.isArray(parsed) ? parsed : [];
        }
    } catch(e) { 
        window.bookings = []; 
    }
}

function saveBookings() {
    try { 
        localStorage.setItem('bookings', JSON.stringify(window.bookings)); 
    } catch(e) {
        showNotification('فشل في حفظ البيانات', 'error');
    }
}

function handleTypeChange() {
    var typeElement = document.querySelector('input[name="registrationType"]:checked');
    if (!typeElement) return;
    
    var type = typeElement.value;
    
    document.getElementById('studentCard1').style.display = 'block';
    document.getElementById('studentCard2').style.display = (type === 'double') ? 'block' : 'none';
    document.getElementById('groupSection').style.display = (type === 'group') ? 'block' : 'none';
    
    var header1 = document.getElementById('studentCard1')?.querySelector('h4');
    if (header1) {
        if (type === 'single') {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب';
        } else if (type === 'double') {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الأول';
        } else {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الأول (قائد المجموعة)';
        }
    }
    
    var header2 = document.getElementById('studentCard2')?.querySelector('h4');
    if (header2) {
        header2.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الثاني';
    }
    
    if (type === 'group') {
        var currentSize = document.querySelectorAll('.group-member-item').length;
        if (currentSize === 0) {
            document.getElementById('groupSize').value = 2;
            updateGroupMembers();
        }
    }
}

function changeGroupSize(delta) {
    var input = document.getElementById('groupSize');
    if (!input) return;
    
    var size = parseInt(input.value) || 2;
    size = Math.max(2, Math.min(14, size + delta));
    input.value = size;
    updateGroupMembers();
}

function updateGroupMembers() {
    var container = document.getElementById('groupMembersContainer');
    var sizeInput = document.getElementById('groupSize');
    
    if (!container || !sizeInput) return;
    
    var size = parseInt(sizeInput.value) || 2;
    var validSize = Math.max(2, Math.min(14, size));
    sizeInput.value = validSize;
    
    var html = '';
    for (var i = 2; i <= validSize + 1; i++) {
        html += `
            <div class="group-member-item" data-member-index="${i}">
                <span class="member-number">${i}</span>
                <div class="member-info">
                    <div class="input-wrapper">
                        <span class="input-icon"><i class="fas fa-user"></i></span>
                        <input type="text" class="member-name form-control" 
                               id="memberName${i}" 
                               placeholder="اسم الطالب ${i}">
                    </div>
                </div>
                <div class="member-phone">
                    <div class="input-wrapper">
                        <span class="input-icon"><i class="fas fa-phone"></i></span>
                        <input type="tel" class="member-phone-input form-control" 
                               id="memberPhone${i}" 
                               placeholder="رقم الهاتف">
                    </div>
                </div>
                <label class="paid-checkbox">
                    <input type="checkbox" class="member-paid" id="memberPaid${i}" checked>
                    <span>مدفوع</span>
                </label>
            </div>
        `;
    }
    container.innerHTML = html;
}

function collectStudentsData(type) {
    var students = [];
    
    if (type === 'single') {
        var nameInput = document.querySelector('#studentCard1 .student-name');
        var phoneInput = document.querySelector('#studentCard1 .student-phone');
        var paidCheck = document.querySelector('#studentCard1 .student-paid');
        
        var name = nameInput ? nameInput.value.trim() : '';
        
        if (!name) {
            showNotification('الرجاء إدخال اسم الطالب', 'error');
            return null;
        }
        
        students.push({
            name: name,
            phone: phoneInput ? phoneInput.value.trim() : '',
            paid: paidCheck ? paidCheck.checked : true,
            isGroupLeader: false
        });
        
    } else if (type === 'double') {
        var card1Name = document.querySelector('#studentCard1 .student-name');
        var card1Phone = document.querySelector('#studentCard1 .student-phone');
        var card1Paid = document.querySelector('#studentCard1 .student-paid');
        
        var card2Name = document.querySelector('#studentCard2 .student-name');
        var card2Phone = document.querySelector('#studentCard2 .student-phone');
        var card2Paid = document.querySelector('#studentCard2 .student-paid');
        
        var name1 = card1Name ? card1Name.value.trim() : '';
        var name2 = card2Name ? card2Name.value.trim() : '';
        
        if (!name1) {
            showNotification('الرجاء إدخال اسم الطالب الأول', 'error');
            return null;
        }
        
        students.push({
            name: name1,
            phone: card1Phone ? card1Phone.value.trim() : '',
            paid: card1Paid ? card1Paid.checked : true,
            isGroupLeader: false
        });
        
        if (name2) {
            students.push({
                name: name2,
                phone: card2Phone ? card2Phone.value.trim() : '',
                paid: card2Paid ? card2Paid.checked : false,
                isGroupLeader: false
            });
        }
        
    } else if (type === 'group') {
        var leaderName = document.querySelector('#studentCard1 .student-name');
        var leaderPhone = document.querySelector('#studentCard1 .student-phone');
        var leaderPaid = document.querySelector('#studentCard1 .student-paid');
        
        var name1 = leaderName ? leaderName.value.trim() : '';
        
        if (!name1) {
            showNotification('الرجاء إدخال اسم قائد المجموعة (الطالب الأول)', 'error');
            return null;
        }
        
        students.push({
            name: name1,
            phone: leaderPhone ? leaderPhone.value.trim() : '',
            paid: leaderPaid ? leaderPaid.checked : true,
            isGroupLeader: true
        });
        
        var memberItems = document.querySelectorAll('.group-member-item');
        var hasAnyMember = false;
        
        memberItems.forEach(function(item) {
            var nameInput = item.querySelector('.member-name');
            var phoneInput = item.querySelector('.member-phone-input');
            var paidCheck = item.querySelector('.member-paid');
            
            var name = nameInput ? nameInput.value.trim() : '';
            
            if (name) {
                students.push({
                    name: name,
                    phone: phoneInput ? phoneInput.value.trim() : '',
                    paid: paidCheck ? paidCheck.checked : true,
                    isGroupLeader: false
                });
                hasAnyMember = true;
            }
        });
        
        if (!hasAnyMember) {
            showNotification('الرجاء إدخال اسم عضو واحد على الأقل في المجموعة', 'error');
            return null;
        }
    }
    
    return students;
}

function highlightField(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    
    if (field.tagName === 'SELECT') {
        field.style.borderColor = 'var(--danger)';
        field.style.boxShadow = '0 0 0 4px rgba(213, 0, 0, 0.1)';
    } else {
        field.style.borderColor = 'var(--danger)';
    }
    
    field.focus();
    
    setTimeout(function() {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }, 2000);
}

function handleSubmit(e) {
    e.preventDefault();
    
    var college = document.getElementById('college')?.value.trim() || '';
    var department = document.getElementById('department')?.value.trim() || '';
    var stage = document.getElementById('stage')?.value || '';
    var classroom = document.getElementById('classroom')?.value.trim() || '';
    var bookingCategory = document.getElementById('bookingCategory')?.value || '';
    var notes = document.getElementById('notes')?.value.trim() || '';
    var totalPrice = parseFloat(document.getElementById('totalPrice')?.value) || 0;
    var paidAmount = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    
    var studySession = document.querySelector('input[name="studySession"]:checked')?.value || 'morning';
    
    var typeElement = document.querySelector('input[name="registrationType"]:checked');
    if (!typeElement) {
        showNotification('الرجاء اختيار نوع التسجيل', 'error');
        return;
    }
    var type = typeElement.value;
    
    if (!college || !department || !stage) {
        showNotification('الرجاء إدخال جميع معلومات الحجز', 'error');
        return;
    }
    
    if (!bookingCategory) {
        showNotification('الرجاء اختيار نوع الحجز', 'error');
        highlightField('bookingCategory');
        return;
    }
    
    if (!totalPrice || totalPrice <= 0) {
        showNotification('الرجاء إدخال السعر الكلي', 'error');
        return;
    }
    
    var students = collectStudentsData(type);
    if (!students || students.length === 0) {
        return;
    }
    
    var paidCount = students.filter(function(s) { return s.paid; }).length;
    var totalStudents = students.length;
    
    var paymentStatus;
    if (paidAmount >= totalPrice) {
        paymentStatus = 'paid';
        paidAmount = totalPrice;
    } else if (paidAmount > 0) {
        paymentStatus = 'partial';
    } else {
        paymentStatus = 'unpaid';
        paidAmount = 0;
    }
    
    var remainingAmount = totalPrice - paidAmount;
    
    var booking = {
        id: 'BK' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        type: type,
        students: students,
        totalStudents: totalStudents,
        paidStudents: paidCount,
        college: college,
        department: department,
        stage: stage,
        classroom: classroom,
        bookingCategory: bookingCategory,
        notes: notes,
        studySession: studySession,
        totalPrice: totalPrice,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        paymentStatus: paymentStatus,
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('ar-IQ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        timeFormatted: new Date().toLocaleTimeString('ar-IQ', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    window.bookings.unshift(booking);
    saveBookings();
    
    if (typeof addLog === 'function') {
        var typeText = type === 'single' ? 'طالب' : type === 'double' ? 'طالبان' : 'مجموعة';
        addLog('add', 'إضافة حجز', 
            'تم إضافة ' + typeText + ': ' + students.map(function(s) { return s.name; }).join('، ') + ' | ' + college + ' | ' + bookingCategory + ' | ' + formatCurrency(totalPrice), 
            booking
        );
    }
    
    renderTable();
    updateStats();
    resetForm();
    
    var typeText = type === 'single' ? 'طالب' : type === 'double' ? 'طالبان' : 'مجموعة';
    showNotification('تم تسجيل ' + typeText + ': ' + students.map(function(s) { return s.name; }).join('، ') + ' بنجاح', 'success');
}

function renderTable() {
    var tbody = document.getElementById('tableBody');
    var tfoot = document.getElementById('tableFooter');
    
    if (!tbody || !tfoot) return;
    
    var filtered = window.bookings.slice();
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(function(b) { return b.paymentStatus === currentFilter; });
    }
    
    if (searchQuery) {
        var query = searchQuery.toLowerCase();
        filtered = filtered.filter(function(b) {
            return b.students && b.students.some(function(s) { return s.name && s.name.toLowerCase().includes(query); });
        });
    }
    
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    if (!filtered.length) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="18">
                    <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                    <p>${searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد حجوزات مسجلة حتى الآن'}</p>
                </td>
            </tr>
        `;
        tfoot.innerHTML = '';
        return;
    }
    
    var typeIcons = { single: 'fa-user', double: 'fa-user-friends', group: 'fa-users' };
    var typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    var categoryIcons = {
        'تقرير': 'fa-file-alt',
        'بحث': 'fa-search',
        'عرض تقديمي': 'fa-presentation',
        'كتاب': 'fa-book',
        'ملزمة': 'fa-copy',
        'بوستر': 'fa-image'
    };
    var statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' };
    
    var studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    var studyIcons = {
        'morning': 'fa-sun',
        'evening': 'fa-moon',
        'hosting': 'fa-home'
    };
    var studyColors = {
        'morning': '#e65100',
        'evening': '#0d47a1',
        'hosting': '#1b5e20'
    };
    var studyBgColors = {
        'morning': '#fff3e0',
        'evening': '#e3f2fd',
        'hosting': '#e8f5e9'
    };
    
    var rowsHtml = '';
    for (var i = 0; i < filtered.length; i++) {
        var b = filtered[i];
        
        var studentsHtml = '';
        var phonesHtml = '';
        for (var j = 0; j < b.students.length; j++) {
            var s = b.students[j];
            studentsHtml += `
                <div style="margin: 2px 0; font-size: 12px; white-space: nowrap;">
                    <i class="fas ${s.paid ? 'fa-check-circle' : 'fa-times-circle'}" 
                       style="color: ${s.paid ? 'var(--success)' : 'var(--danger)'}; margin-left: 5px; font-size: 11px;">
                    </i>
                    <span>${escapeHtml(s.name)}</span>
                    ${s.isGroupLeader ? ' <small style="color: var(--primary);">(قائد)</small>' : ''}
                </div>
            `;
            if (s.phone) {
                phonesHtml += '<div style="font-size: 11px; direction: ltr; text-align: left;">' + escapeHtml(s.phone) + '</div>';
            }
        }
        
        if (!phonesHtml) {
            phonesHtml = '<span style="color: #999; font-size: 11px;">-</span>';
        }
        
        var studyText = studyTexts[b.studySession] || 'صباحي';
        var studyIcon = studyIcons[b.studySession] || 'fa-sun';
        var studyColor = studyColors[b.studySession] || '#e65100';
        var studyBg = studyBgColors[b.studySession] || '#fff3e0';
        
        var classroom = b.classroom || '-';
        var notes = b.notes || '-';
        
        rowsHtml += `
            <tr class="booking-row" data-id="${b.id}">
                <td style="font-weight: 700;">${i + 1}</td>
                <td>
                    <i class="fas ${typeIcons[b.type] || 'fa-user'}" title="${typeTexts[b.type] || 'طالب'}"></i>
                    <span style="margin-right: 3px;">${typeTexts[b.type] || 'طالب'}</span>
                    <br><small>(${b.totalStudents || 0} طالب)</small>
                </td>
                <td style="text-align: right; min-width: 120px;">${studentsHtml}</td>
                <td style="text-align: left; direction: ltr; min-width: 80px; font-size: 11px;">${phonesHtml}</td>
                <td>
                    <span class="study-badge ${b.studySession || 'morning'}" style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 16px; font-weight: 600; font-size: 11px; background: ${studyBg}; color: ${studyColor}; border: 1px solid ${studyColor}40; white-space: nowrap;">
                        <i class="fas ${studyIcon}" style="font-size: 11px;"></i>
                        <span>${studyText}</span>
                    </span>
                </td>
                <td>
                    <span class="booking-category">
                        <i class="fas ${categoryIcons[b.bookingCategory] || 'fa-tag'}" style="color: var(--primary); margin-left: 4px;"></i>
                        <span>${escapeHtml(b.bookingCategory || '-')}</span>
                    </span>
                </td>
                <td style="font-size: 11px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(b.college)}</td>
                <td style="font-size: 11px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(b.department)}</td>
                <td>${b.stage}</td>
                <td style="font-size: 11px;">${classroom}</td>
                <td style="font-size: 11px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(b.notes)}">${notes}</td>
                <td class="amount-cell" style="font-weight: 600; white-space: nowrap;">${formatCurrency(b.totalPrice)}</td>
                <td class="amount-cell" style="font-weight: 600; white-space: nowrap;">${formatCurrency(b.paidAmount)}</td>
                <td style="color: ${b.remainingAmount > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 700; white-space: nowrap;">
                    ${formatCurrency(b.remainingAmount)}
                </td>
                <td>
                    <span class="status-badge ${b.paymentStatus}">
                        ${statusTexts[b.paymentStatus] || 'غير معروف'}
                    </span>
                </td>
                <td style="font-size: 10px;">
                    <div>${b.dateFormatted}</div>
                    <small style="color: #999;">${b.timeFormatted}</small>
                </td>
                <td>
                    <div class="row-actions" style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn-icon btn-edit" onclick="editBooking('${b.id}')" title="تعديل" style="width: 30px; height: 30px; font-size: 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteBooking('${b.id}')" title="حذف" style="width: 30px; height: 30px; font-size: 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon btn-print" onclick="printSingleBooking('${b.id}')" title="طباعة هذا الحجز" style="width: 30px; height: 30px; font-size: 12px; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = rowsHtml;
    
    var totalAll = 0;
    var totalPaid = 0;
    var totalStudents = 0;
    for (var i = 0; i < filtered.length; i++) {
        var b = filtered[i];
        totalAll += b.totalPrice || 0;
        totalPaid += b.paidAmount || 0;
        totalStudents += b.totalStudents || 0;
    }
    var totalRemaining = totalAll - totalPaid;
    
    tfoot.innerHTML = `
        <tr class="table-footer">
            <td colspan="9"><strong>المجاميع (${filtered.length} حجز - ${totalStudents} طالب)</strong></td>
            <td></td>
            <td></td>
            <td><strong>${formatCurrency(totalAll)}</strong></td>
            <td><strong>${formatCurrency(totalPaid)}</strong></td>
            <td style="color: ${totalRemaining > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 700;">
                ${formatCurrency(totalRemaining)}
            </td>
            <td colspan="3"></td>
        </tr>
    `;
}

function updateStats() {
    var filtered = currentFilter === 'all' ? 
        window.bookings : 
        window.bookings.filter(function(b) { return b.paymentStatus === currentFilter; });
    
    var totalAmount = 0;
    var totalPaid = 0;
    var totalUnpaid = 0;
    for (var i = 0; i < filtered.length; i++) {
        var b = filtered[i];
        totalAmount += b.totalPrice || 0;
        totalPaid += b.paidAmount || 0;
        totalUnpaid += (b.totalPrice || 0) - (b.paidAmount || 0);
    }
    
    document.getElementById('statTotalBookings').textContent = filtered.length;
    document.getElementById('statTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('statPaidAmount').textContent = formatCurrency(totalPaid);
    document.getElementById('statUnpaidAmount').textContent = formatCurrency(totalUnpaid);
}

function deleteBooking(id) {
    var booking = window.bookings.find(function(b) { return b.id === id; });
    if (!booking) return;
    
    var names = booking.students.map(function(s) { return s.name; }).join('، ');
    
    if (confirm('حذف حجز: ' + names + '؟')) {
        window.bookings = window.bookings.filter(function(b) { return b.id !== id; });
        saveBookings();
        
        if (typeof addLog === 'function') {
            addLog('delete', 'حذف', 'تم حذف: ' + names, booking);
        }
        
        renderTable();
        updateStats();
        showNotification('تم الحذف', 'error');
    }
}

function editBooking(id) {
    var b = window.bookings.find(function(booking) { return booking.id === id; });
    if (!b) return;
    
    var typeRadio = document.querySelector('input[name="registrationType"][value="' + b.type + '"]');
    if (typeRadio) typeRadio.checked = true;
    handleTypeChange();
    
    document.getElementById('college').value = b.college || '';
    document.getElementById('department').value = b.department || '';
    document.getElementById('stage').value = b.stage || '';
    document.getElementById('classroom').value = b.classroom || '';
    document.getElementById('bookingCategory').value = b.bookingCategory || '';
    document.getElementById('notes').value = b.notes || '';
    document.getElementById('totalPrice').value = b.totalPrice || 0;
    document.getElementById('paidAmount').value = b.paidAmount || 0;
    
    var studyRadio = document.querySelector('input[name="studySession"][value="' + (b.studySession || 'morning') + '"]');
    if (studyRadio) studyRadio.checked = true;
    
    var paymentRadio = document.querySelector('input[name="paymentStatus"][value="' + b.paymentStatus + '"]');
    if (paymentRadio) paymentRadio.checked = true;
    
    if (b.type === 'single') {
        fillStudentCard(1, b.students[0]);
    } else if (b.type === 'double') {
        fillStudentCard(1, b.students[0]);
        if (b.students[1]) fillStudentCard(2, b.students[1]);
    } else if (b.type === 'group') {
        fillStudentCard(1, b.students[0]);
        
        var memberCount = b.students.length - 1;
        document.getElementById('groupSize').value = Math.max(2, memberCount);
        updateGroupMembers();
        
        setTimeout(function() {
            for (var i = 1; i < b.students.length; i++) {
                var memberItem = document.querySelector('.group-member-item[data-member-index="' + (i + 1) + '"]');
                if (memberItem) {
                    var nameInput = memberItem.querySelector('.member-name');
                    var phoneInput = memberItem.querySelector('.member-phone-input');
                    var paidCheck = memberItem.querySelector('.member-paid');
                    
                    if (nameInput) nameInput.value = b.students[i].name || '';
                    if (phoneInput) phoneInput.value = b.students[i].phone || '';
                    if (paidCheck) paidCheck.checked = b.students[i].paid !== false;
                }
            }
        }, 150);
    }
    
    window.bookings = window.bookings.filter(function(booking) { return booking.id !== id; });
    saveBookings();
    renderTable();
    updateStats();
    
    showNotification('تم تحميل الحجز للتعديل', 'warning');
}

function fillStudentCard(cardNumber, studentData) {
    if (!studentData) return;
    
    var card = document.getElementById('studentCard' + cardNumber);
    if (!card) return;
    
    var nameInput = card.querySelector('.student-name');
    var phoneInput = card.querySelector('.student-phone');
    var paidCheck = card.querySelector('.student-paid');
    
    if (nameInput) nameInput.value = studentData.name || '';
    if (phoneInput) phoneInput.value = studentData.phone || '';
    if (paidCheck) paidCheck.checked = studentData.paid !== false;
}

function resetForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;
    
    form.reset();
    document.querySelector('input[name="registrationType"][value="single"]').checked = true;
    document.querySelector('input[name="paymentStatus"][value="paid"]').checked = true;
    
    var groupContainer = document.getElementById('groupMembersContainer');
    if (groupContainer) groupContainer.innerHTML = '';
    
    var groupSize = document.getElementById('groupSize');
    if (groupSize) groupSize.value = '2';
    
    handleTypeChange();
    
    setTimeout(function() {
        document.getElementById('college')?.focus();
    }, 100);
}

function exportToExcel() {
    if (!window.bookings.length) {
        showNotification('لا توجد بيانات', 'warning');
        return;
    }
    
    var typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    var statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' };
    var studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    
    var csv = '\uFEFFالرقم,النوع,الطلاب,عدد الطلاب,الدراسة,نوع الحجز,الكلية,القسم,المرحلة,الشعبة,ملاحظات,السعر,المدفوع,المتبقي,الحالة,التاريخ\n';
    
    for (var i = 0; i < window.bookings.length; i++) {
        var b = window.bookings[i];
        var studyText = studyTexts[b.studySession] || 'صباحي';
        
        csv += [
            i + 1,
            typeTexts[b.type] || '',
            '"' + b.students.map(function(s) { return s.name + (s.paid ? ' (مدفوع)' : ' (غير مدفوع)'); }).join(' | ') + '"',
            b.totalStudents,
            studyText,
            b.bookingCategory || '-',
            b.college,
            b.department,
            b.stage,
            b.classroom || '-',
            b.notes || '-',
            b.totalPrice,
            b.paidAmount,
            b.remainingAmount,
            statusTexts[b.paymentStatus] || '',
            b.dateFormatted
        ].join(',') + '\n';
    }
    
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'الحجوزات_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    showNotification('تم التصدير', 'success');
}

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '0 د.ع';
    try {
        return new Intl.NumberFormat('ar-IQ', { maximumFractionDigits: 0 }).format(amount) + ' د.ع';
    } catch(e) {
        return amount + ' د.ع';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateDateTime() {
    var now = new Date();
    var timeEl = document.getElementById('currentTime');
    var dateEl = document.getElementById('currentDate');
    
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('ar-IQ', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });
    }
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('ar-IQ', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
}

function showNotification(message, type) {
    if (type === undefined) type = 'success';
    if (window.notificationsEnabled === false) return;
    
    var container = document.getElementById('notificationContainer');
    if (!container) return;
    
    var icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    
    var div = document.createElement('div');
    div.className = 'notification ' + type;
    div.innerHTML = '<i class="fas ' + (icons[type] || 'fa-info-circle') + '"></i> ' + escapeHtml(message);
    
    container.appendChild(div);
    setTimeout(function() {
        if (div.parentNode) div.remove();
    }, 4000);
}

function setupListeners() {
    document.getElementById('bookingForm')?.addEventListener('submit', handleSubmit);
    
    var filterBtns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].addEventListener('click', function() {
            var allBtns = document.querySelectorAll('.filter-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            currentFilter = this.dataset.filter || 'all';
            renderTable();
            updateStats();
        });
    }
    
    document.getElementById('searchInput')?.addEventListener('input', function() {
        searchQuery = this.value.trim();
        renderTable();
    });
    
    document.getElementById('totalPrice')?.addEventListener('input', autoUpdatePayment);
    document.getElementById('paidAmount')?.addEventListener('input', autoUpdatePayment);
}

function autoUpdatePayment() {
    var total = parseFloat(document.getElementById('totalPrice')?.value) || 0;
    var paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    
    if (total === 0) {
        var radio = document.querySelector('input[name="paymentStatus"][value="unpaid"]');
        if (radio) radio.checked = true;
    } else if (paid >= total) {
        var radio = document.querySelector('input[name="paymentStatus"][value="paid"]');
        if (radio) radio.checked = true;
        if (paid > total) document.getElementById('paidAmount').value = total;
    } else if (paid > 0) {
        var radio = document.querySelector('input[name="paymentStatus"][value="partial"]');
        if (radio) radio.checked = true;
    } else {
        var radio = document.querySelector('input[name="paymentStatus"][value="unpaid"]');
        if (radio) radio.checked = true;
    }
}

function openLogModal() { 
    var modal = document.getElementById('logModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderLogs === 'function') renderLogs(); 
}
function closeLogModal() { 
    var modal = document.getElementById('logModal');
    if (modal) modal.classList.remove('active'); 
}
function openSettingsModal() { 
    var modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderSettings === 'function') renderSettings(); 
}
function closeSettingsModal() { 
    var modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active'); 
}
function showDeveloperInfo() { 
    var modal = document.getElementById('developerModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderDeveloperInfo === 'function') renderDeveloperInfo(); 
}
function closeDeveloperInfo() { 
    var modal = document.getElementById('developerModal');
    if (modal) modal.classList.remove('active'); 
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var modals = document.querySelectorAll('.modal-overlay.active');
        for (var i = 0; i < modals.length; i++) {
            modals[i].classList.remove('active');
        }
    }
});

// ==========================================
// دوال خيارات الطباعة
// ==========================================

function openPrintOptions() {
    var modal = document.getElementById('printOptionsModal');
    if (modal) modal.classList.add('active');
}

function closePrintOptions() {
    var modal = document.getElementById('printOptionsModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================
// طباعة حجز واحد محدد
// ==========================================

function printSingleBooking(bookingId) {
    var booking = window.bookings.find(function(b) { return b.id === bookingId; });
    if (!booking) {
        showNotification('الحجز غير موجود', 'error');
        return;
    }
    
    var studentsNames = booking.students.map(function(s) { return s.name; }).join('، ');
    var reportTitle = 'تقرير حجز: ' + studentsNames;
    var printContent = generatePrintContent([booking], reportTitle);
    
    var printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
        showNotification('الرجاء السماح بالنوافذ المنبثقة', 'error');
        return;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        setTimeout(function() {
            printWindow.print();
        }, 500);
    };
}

// ==========================================
// طباعة التقرير العام
// ==========================================

function printReport(filterType) {
    closePrintOptions();
    
    var dataToPrint = [];
    var reportTitle = 'تقرير جميع الحجوزات';
    
    switch(filterType) {
        case 'all':
            dataToPrint = window.bookings.slice();
            reportTitle = 'تقرير جميع الحجوزات';
            break;
        case 'paid':
            dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'paid'; });
            reportTitle = 'تقرير الحجوزات المدفوعة بالكامل';
            break;
        case 'unpaid':
            dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'unpaid'; });
            reportTitle = 'تقرير الحجوزات غير المدفوعة';
            break;
        case 'partial':
            dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'partial'; });
            reportTitle = 'تقرير الحجوزات المدفوعة جزئياً';
            break;
        case 'filtered':
            var filterValue = currentFilter;
            if (filterValue === 'all') {
                dataToPrint = window.bookings.slice();
                reportTitle = 'تقرير جميع الحجوزات (حسب الفلتر)';
            } else {
                dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === filterValue; });
                var statusNames = { paid: 'المدفوعة بالكامل', unpaid: 'غير المدفوعة', partial: 'المدفوعة جزئياً' };
                reportTitle = 'تقرير الحجوزات ' + (statusNames[filterValue] || '');
            }
            break;
        default:
            dataToPrint = window.bookings.slice();
            reportTitle = 'تقرير جميع الحجوزات';
    }
    
    dataToPrint.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    if (dataToPrint.length === 0) {
        showNotification('لا توجد بيانات للطباعة', 'warning');
        return;
    }
    
    var printContent = generatePrintContent(dataToPrint, reportTitle);
    
    var printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
        showNotification('الرجاء السماح بالنوافذ المنبثقة', 'error');
        return;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        setTimeout(function() {
            printWindow.print();
        }, 500);
    };
}

// ==========================================
// إنشاء محتوى الطباعة
// ==========================================

function generatePrintContent(data, title) {
    var now = new Date();
    var dateStr = now.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    var timeStr = now.toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    var typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    var statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'مدفوع جزئياً' };
    var studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    
    var rowsHtml = '';
    var totalAll = 0;
    var totalPaid = 0;
    var totalStudents = 0;
    
    for (var i = 0; i < data.length; i++) {
        var b = data[i];
        var studentsList = [];
        var phonesList = [];
        
        for (var j = 0; j < b.students.length; j++) {
            var s = b.students[j];
            var name = s.name || '';
            if (s.isGroupLeader) {
                name = name + ' (مسؤول)';
            }
            var mark = s.paid ? '✓' : '✗';
            name = mark + ' ' + name;
            studentsList.push(name);
            if (s.phone) {
                phonesList.push(s.phone);
            }
        }
        
        var studentsNames = studentsList.join('<br>');
        var phones = phonesList.length > 0 ? phonesList.join('، ') : '-';
        var studyText = studyTexts[b.studySession] || 'صباحي';
        var classroom = b.classroom || '-';
        var notes = b.notes || '-';
        
        rowsHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${typeTexts[b.type] || ''}</td>
                <td class="students-cell">${studentsNames}</td>
                <td class="phone-cell">${phones}</td>
                <td>${studyText}</td>
                <td>${b.bookingCategory || '-'}</td>
                <td class="college-cell">${b.college || ''}</td>
                <td class="dept-cell">${b.department || ''}</td>
                <td>${b.stage || ''}</td>
                <td class="classroom-cell">${classroom}</td>
                <td class="notes-cell">${notes}</td>
                <td class="amount-cell">${b.totalPrice.toLocaleString('ar-IQ')}</td>
                <td class="amount-cell">${b.paidAmount.toLocaleString('ar-IQ')}</td>
                <td class="amount-cell remaining">${b.remainingAmount.toLocaleString('ar-IQ')}</td>
                <td><span class="status-badge ${b.paymentStatus}">${statusTexts[b.paymentStatus] || ''}</span></td>
                <td class="date-cell">${b.dateFormatted || ''}</td>
            </tr>
        `;
        
        totalAll += b.totalPrice || 0;
        totalPaid += b.paidAmount || 0;
        totalStudents += b.totalStudents || 0;
    }
    
    var totalRemaining = totalAll - totalPaid;
    
    return `<!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Cairo', 'Arial', sans-serif;
                padding: 5px 3px;
                color: #1a1a2e;
                background: white;
                font-size: 7.5px;
                direction: rtl;
            }
            
            .print-header {
                text-align: center;
                padding: 4px 0;
                border-bottom: 2px solid #1a237e;
                margin-bottom: 5px;
            }
            .print-header h1 {
                color: #1a237e;
                font-size: 13px;
                margin-bottom: 1px;
            }
            .print-header h1 i {
                color: #c6a700;
                margin-left: 4px;
            }
            .print-header .subtitle {
                color: #555;
                font-size: 7.5px;
            }
            .print-header .datetime {
                color: #777;
                font-size: 7px;
                margin-top: 2px;
            }
            .print-header .datetime i {
                margin-left: 3px;
            }
            
            .print-title {
                text-align: center;
                font-size: 10px;
                font-weight: 700;
                color: #1a237e;
                margin: 4px 0 5px;
                padding: 3px;
                background: #f0f4ff;
                border-radius: 4px;
            }
            .print-title i {
                margin-left: 4px;
                color: #c6a700;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 7px;
                direction: rtl;
                table-layout: auto;
            }
            
            th {
                background: #1a237e;
                color: white;
                padding: 2px 2px;
                font-weight: 700;
                text-align: center;
                border: 1px solid #1a237e;
                font-size: 6.5px;
                white-space: nowrap;
            }
            
            td {
                padding: 2px 2px;
                border: 1px solid #ddd;
                text-align: center;
                vertical-align: middle;
                word-wrap: break-word;
                overflow-wrap: break-word;
                font-size: 7px;
            }
            
            th:nth-child(1), td:nth-child(1) { width: 18px; min-width: 15px; max-width: 22px; }
            th:nth-child(2), td:nth-child(2) { width: 28px; min-width: 25px; max-width: 35px; }
            th:nth-child(3), td:nth-child(3) { width: 18%; min-width: 80px; max-width: 160px; }
            th:nth-child(4), td:nth-child(4) { width: 8%; min-width: 35px; max-width: 60px; }
            th:nth-child(5), td:nth-child(5) { width: 28px; min-width: 25px; max-width: 35px; }
            th:nth-child(6), td:nth-child(6) { width: 7%; min-width: 30px; max-width: 50px; }
            th:nth-child(7), td:nth-child(7) { width: 8%; min-width: 35px; max-width: 65px; }
            th:nth-child(8), td:nth-child(8) { width: 8%; min-width: 35px; max-width: 65px; }
            th:nth-child(9), td:nth-child(9) { width: 5%; min-width: 25px; max-width: 38px; }
            th:nth-child(10), td:nth-child(10) { width: 5%; min-width: 25px; max-width: 38px; }
            th:nth-child(11), td:nth-child(11) { width: 7%; min-width: 30px; max-width: 55px; }
            th:nth-child(12), td:nth-child(12) { width: 34px; min-width: 30px; max-width: 40px; }
            th:nth-child(13), td:nth-child(13) { width: 34px; min-width: 30px; max-width: 40px; }
            th:nth-child(14), td:nth-child(14) { width: 34px; min-width: 30px; max-width: 40px; }
            th:nth-child(15), td:nth-child(15) { width: 34px; min-width: 30px; max-width: 42px; }
            th:nth-child(16), td:nth-child(16) { width: 9%; min-width: 45px; max-width: 70px; }
            
            td.students-cell {
                text-align: right !important;
                direction: ltr !important;
                font-size: 7.5px !important;
                line-height: 1.6 !important;
                padding: 2px 4px !important;
                font-weight: 600;
                color: #1a1a2e;
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal;
            }
            
            td.students-cell br {
                display: block;
                content: "";
                margin: 0px 0;
            }
            
            td.phone-cell {
                font-size: 7px !important;
                direction: ltr !important;
                text-align: left !important;
                white-space: nowrap;
            }
            
            td.classroom-cell, td.notes-cell {
                font-size: 6.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 55px;
            }
            
            td.amount-cell {
                font-weight: 600;
                font-size: 7px;
                text-align: left !important;
                direction: ltr !important;
                white-space: nowrap;
                padding-left: 2px !important;
            }
            
            td.remaining {
                color: #c62828;
                font-weight: 700;
            }
            
            td.date-cell {
                font-size: 6.5px !important;
                line-height: 1.2 !important;
                white-space: normal !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                padding: 2px 2px !important;
            }
            
            td.college-cell, td.dept-cell {
                font-size: 6.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
                        
            tr:nth-child(even) {
                background: #f8f9fa;
            }
            
            .status-badge {
                display: inline-block;
                padding: 1px 4px;
                border-radius: 8px;
                font-size: 5.5px;
                font-weight: 700;
                white-space: nowrap;
            }
            .status-badge.paid {
                background: #e8f5e9;
                color: #2e7d32;
                border: 1px solid #a5d6a7;
            }
            .status-badge.unpaid {
                background: #fce4ec;
                color: #c62828;
                border: 1px solid #ef9a9a;
            }
            .status-badge.partial {
                background: #fff3e0;
                color: #e65100;
                border: 1px solid #ffcc80;
            }
            
            .total-row {
                background: #f0f4ff !important;
                font-weight: 700;
            }
            .total-row td {
                border-color: #1a237e;
                border-top: 2px solid #1a237e;
                padding: 2px 2px;
                font-size: 7px;
            }
            
            .print-footer {
                margin-top: 5px;
                padding-top: 4px;
                border-top: 2px solid #ddd;
                display: flex;
                justify-content: space-between;
                font-size: 6.5px;
                color: #555;
            }
            .print-footer i {
                margin-left: 3px;
            }

            @media print {
                body {
                    padding: 2px 1.5px;
                    font-size: 6.5px;
                }
                .no-print {
                    display: none;
                }
                th {
                    background: #1a237e !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                tr:nth-child(even) {
                    background: #f5f5f5 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .total-row {
                    background: #f0f4ff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .status-badge {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                td.students-cell {
                    font-size: 6.5px !important;
                    line-height: 1.4 !important;
                }
                .print-header h1 {
                    font-size: 11px;
                }
                .print-title {
                    font-size: 8px;
                    padding: 2px;
                }
                th {
                    font-size: 5.5px !important;
                    padding: 1.5px 1.5px !important;
                }
                td {
                    font-size: 6px !important;
                    padding: 1px 1.5px !important;
                }
                td.amount-cell {
                    font-size: 6px !important;
                }
                td.date-cell {
                    font-size: 5.5px !important;
                }
                td.phone-cell {
                    font-size: 6px !important;
                }
                td.classroom-cell, td.notes-cell {
                    font-size: 5.5px !important;
                }
                .status-badge {
                    font-size: 5px !important;
                    padding: 1px 2px !important;
                }
                .print-footer {
                    font-size: 5.5px !important;
                }
                .total-row td {
                    font-size: 6px !important;
                }
                tr {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                th:nth-child(3), td:nth-child(3) { max-width: 130px; }
                th:nth-child(4), td:nth-child(4) { max-width: 50px; }
                th:nth-child(7), td:nth-child(7) { max-width: 50px; }
                th:nth-child(8), td:nth-child(8) { max-width: 50px; }
                th:nth-child(11), td:nth-child(11) { max-width: 45px; }
                th:nth-child(16), td:nth-child(16) { max-width: 55px; }
            }
            
            @page {
                size: A4 landscape;
                margin: 3mm 2mm;
            }
            
            @media screen and (max-width: 900px) {
                body {
                    padding: 2px 1.5px;
                    font-size: 6px;
                }
                th, td {
                    font-size: 5.5px;
                    padding: 1px 1px;
                }
                td.students-cell {
                    font-size: 6px !important;
                    line-height: 1.3 !important;
                }
                td.amount-cell {
                    font-size: 5.5px !important;
                }
                td.date-cell {
                    font-size: 5px !important;
                }
                .status-badge {
                    font-size: 4.5px;
                    padding: 1px 2px;
                }
                .print-header h1 {
                    font-size: 10px;
                }
                .print-title {
                    font-size: 7px;
                }
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1><i class="fas fa-calculator"></i> طلبات ستودنت كاش</h1>
            <div class="subtitle"><i class="fas fa-clipboard-list"></i> نظام إدارة الحجوزات والمدفوعات</div>
            <div class="datetime"><i class="fas fa-calendar-alt"></i> ${dateStr} — <i class="fas fa-clock"></i> ${timeStr}</div>
        </div>
        
        <div class="print-title"><i class="fas fa-print"></i> ${title}</div>
        
        <table>
            <thead>
                <tr>
                    <th>ت</th>
                    <th>النوع</th>
                    <th>الطلاب</th>
                    <th>الهاتف</th>
                    <th>الدراسة</th>
                    <th>نوع الحجز</th>
                    <th>الكلية</th>
                    <th>القسم</th>
                    <th>المرحلة</th>
                    <th>القاعة</th>
                    <th>ملاحظات</th>
                    <th>السعر</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
                <tr class="total-row">
                    <td colspan="9" style="text-align: right; font-size: 7px; padding-right: 4px;">
                        <strong><i class="fas fa-calculator"></i> المجموع (${data.length} حجز — ${totalStudents} طالب)</strong>
                    </td>
                    <td></td>
                    <td></td>
                    <td style="text-align: left; font-weight: 700; direction: ltr; font-size: 6.5px;">${totalAll.toLocaleString('ar-IQ')}</td>
                    <td style="text-align: left; font-weight: 700; direction: ltr; font-size: 6.5px;">${totalPaid.toLocaleString('ar-IQ')}</td>
                    <td style="text-align: left; font-weight: 700; color: ${totalRemaining > 0 ? '#c62828' : '#2e7d32'}; direction: ltr; font-size: 6.5px;">
                        ${totalRemaining.toLocaleString('ar-IQ')}
                    </td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
        
        <div class="print-footer">
            <span><i class="fas fa-code"></i> Mohammed Al-Baqer Copyright (C) 2026, lnc</span>
            <span><i class="fas fa-file-alt"></i> عدد الحجوزات: ${data.length} | <i class="fas fa-users"></i> إجمالي الطلاب: ${totalStudents}</span>
        </div>
    </body>
    </html>`;
}

(function() {
    'use strict';
    
    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
    
    function printMobile(printContent) {
        var printDiv = document.createElement('div');
        printDiv.style.position = 'fixed';
        printDiv.style.top = '0';
        printDiv.style.left = '0';
        printDiv.style.width = '100%';
        printDiv.style.height = '100%';
        printDiv.style.zIndex = '99999';
        printDiv.style.background = 'white';
        printDiv.style.overflow = 'auto';
        printDiv.style.padding = '10px';
        printDiv.style.direction = 'rtl';
        printDiv.innerHTML = printContent;
        document.body.appendChild(printDiv);
        
        setTimeout(function() {
            window.print();
            setTimeout(function() {
                if (printDiv.parentNode) {
                    printDiv.parentNode.removeChild(printDiv);
                }
            }, 1000);
        }, 300);
    }
    
    function printMobileReport(filterType) {
        closePrintOptions();
        
        var dataToPrint = [];
        var reportTitle = 'تقرير جميع الحجوزات';
        
        switch(filterType) {
            case 'all':
                dataToPrint = window.bookings.slice();
                reportTitle = 'تقرير جميع الحجوزات';
                break;
            case 'paid':
                dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'paid'; });
                reportTitle = 'تقرير الحجوزات المدفوعة بالكامل';
                break;
            case 'unpaid':
                dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'unpaid'; });
                reportTitle = 'تقرير الحجوزات غير المدفوعة';
                break;
            case 'partial':
                dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === 'partial'; });
                reportTitle = 'تقرير الحجوزات المدفوعة جزئياً';
                break;
            case 'filtered':
                var filterValue = currentFilter;
                if (filterValue === 'all') {
                    dataToPrint = window.bookings.slice();
                    reportTitle = 'تقرير جميع الحجوزات (حسب الفلتر)';
                } else {
                    dataToPrint = window.bookings.filter(function(b) { return b.paymentStatus === filterValue; });
                    var statusNames = { paid: 'المدفوعة بالكامل', unpaid: 'غير المدفوعة', partial: 'المدفوعة جزئياً' };
                    reportTitle = 'تقرير الحجوزات ' + (statusNames[filterValue] || '');
                }
                break;
            default:
                dataToPrint = window.bookings.slice();
                reportTitle = 'تقرير جميع الحجوزات';
        }
        
        dataToPrint.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        
        if (dataToPrint.length === 0) {
            showNotification('لا توجد بيانات للطباعة', 'warning');
            return;
        }
        
        var printContent = generatePrintContent(dataToPrint, reportTitle);
        printMobile(printContent);
    }
    
    if (isMobileDevice()) {
        window.printReport = function(filterType) {
            closePrintOptions();
            printMobileReport(filterType);
        };
        
        window.printSingleBooking = function(bookingId) {
            var booking = window.bookings.find(function(b) { return b.id === bookingId; });
            if (!booking) {
                showNotification('الحجز غير موجود', 'error');
                return;
            }
            
            var studentsNames = booking.students.map(function(s) { return s.name; }).join('، ');
            var reportTitle = 'تقرير حجز: ' + studentsNames;
            var printContent = generatePrintContent([booking], reportTitle);
            printMobile(printContent);
        };
        
        console.log('أنت تستخدم الهاتف حالياً');
    }
})();