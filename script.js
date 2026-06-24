// Developer : Mohammed Al-Baqer
// Copyright (C) 2026 lnc
// Requests Student Cash
// JavaScript

window.bookings = window.bookings || [];
let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
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
        const data = localStorage.getItem('bookings');
        if (data) {
            const parsed = JSON.parse(data);
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
    const typeElement = document.querySelector('input[name="registrationType"]:checked');
    if (!typeElement) return;
    
    const type = typeElement.value;
    
    document.getElementById('studentCard1').style.display = 'block';
    document.getElementById('studentCard2').style.display = (type === 'double') ? 'block' : 'none';
    document.getElementById('groupSection').style.display = (type === 'group') ? 'block' : 'none';
    
    const header1 = document.getElementById('studentCard1')?.querySelector('h4');
    if (header1) {
        if (type === 'single') {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب';
        } else if (type === 'double') {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الأول';
        } else {
            header1.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الأول (قائد المجموعة)';
        }
    }
    
    const header2 = document.getElementById('studentCard2')?.querySelector('h4');
    if (header2) {
        header2.innerHTML = '<i class="fas fa-user-graduate"></i> الطالب الثاني';
    }
    
    if (type === 'group') {
        const currentSize = document.querySelectorAll('.group-member-item').length;
        if (currentSize === 0) {
            document.getElementById('groupSize').value = 2;
            updateGroupMembers();
        }
    }
}

function changeGroupSize(delta) {
    const input = document.getElementById('groupSize');
    if (!input) return;
    
    let size = parseInt(input.value) || 2;
    size = Math.max(2, Math.min(14, size + delta));
    input.value = size;
    updateGroupMembers();
}

function updateGroupMembers() {
    const container = document.getElementById('groupMembersContainer');
    const sizeInput = document.getElementById('groupSize');
    
    if (!container || !sizeInput) return;
    
    const size = parseInt(sizeInput.value) || 2;
    const validSize = Math.max(2, Math.min(14, size));
    sizeInput.value = validSize;
    
    let html = '';
    for (let i = 2; i <= validSize + 1; i++) {
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
    let students = [];
    
    if (type === 'single') {
        const nameInput = document.querySelector('#studentCard1 .student-name');
        const phoneInput = document.querySelector('#studentCard1 .student-phone');
        const paidCheck = document.querySelector('#studentCard1 .student-paid');
        
        const name = nameInput ? nameInput.value.trim() : '';
        
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
        const card1Name = document.querySelector('#studentCard1 .student-name');
        const card1Phone = document.querySelector('#studentCard1 .student-phone');
        const card1Paid = document.querySelector('#studentCard1 .student-paid');
        
        const card2Name = document.querySelector('#studentCard2 .student-name');
        const card2Phone = document.querySelector('#studentCard2 .student-phone');
        const card2Paid = document.querySelector('#studentCard2 .student-paid');
        
        const name1 = card1Name ? card1Name.value.trim() : '';
        const name2 = card2Name ? card2Name.value.trim() : '';
        
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
        const leaderName = document.querySelector('#studentCard1 .student-name');
        const leaderPhone = document.querySelector('#studentCard1 .student-phone');
        const leaderPaid = document.querySelector('#studentCard1 .student-paid');
        
        const name1 = leaderName ? leaderName.value.trim() : '';
        
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
        
        const memberItems = document.querySelectorAll('.group-member-item');
        let hasAnyMember = false;
        
        memberItems.forEach((item) => {
            const nameInput = item.querySelector('.member-name');
            const phoneInput = item.querySelector('.member-phone-input');
            const paidCheck = item.querySelector('.member-paid');
            
            const name = nameInput ? nameInput.value.trim() : '';
            
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
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    if (field.tagName === 'SELECT') {
        field.style.borderColor = 'var(--danger)';
        field.style.boxShadow = '0 0 0 4px rgba(213, 0, 0, 0.1)';
    } else {
        field.style.borderColor = 'var(--danger)';
    }
    
    field.focus();
    
    setTimeout(() => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }, 2000);
}

function handleSubmit(e) {
    e.preventDefault();
    
    const college = document.getElementById('college')?.value.trim() || '';
    const department = document.getElementById('department')?.value.trim() || '';
    const stage = document.getElementById('stage')?.value || '';
    const classroom = document.getElementById('classroom')?.value.trim() || '';
    const bookingCategory = document.getElementById('bookingCategory')?.value || '';
    const notes = document.getElementById('notes')?.value.trim() || '';
    const totalPrice = parseFloat(document.getElementById('totalPrice')?.value) || 0;
    let paidAmount = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    
    const studySession = document.querySelector('input[name="studySession"]:checked')?.value || 'morning';
    
    const typeElement = document.querySelector('input[name="registrationType"]:checked');
    if (!typeElement) {
        showNotification('الرجاء اختيار نوع التسجيل', 'error');
        return;
    }
    const type = typeElement.value;
    
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
    
    const students = collectStudentsData(type);
    if (!students || students.length === 0) {
        return;
    }
    
    const paidCount = students.filter(s => s.paid).length;
    const totalStudents = students.length;
    
    let paymentStatus;
    if (paidAmount >= totalPrice) {
        paymentStatus = 'paid';
        paidAmount = totalPrice;
    } else if (paidAmount > 0) {
        paymentStatus = 'partial';
    } else {
        paymentStatus = 'unpaid';
        paidAmount = 0;
    }
    
    const remainingAmount = totalPrice - paidAmount;
    
    const booking = {
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
        const typeText = type === 'single' ? 'طالب' : type === 'double' ? 'طالبان' : 'مجموعة';
        addLog('add', 'إضافة حجز', 
            `تم إضافة ${typeText}: ${students.map(s => s.name).join('، ')} | ${college} | ${bookingCategory} | ${formatCurrency(totalPrice)}`, 
            booking
        );
    }
    
    renderTable();
    updateStats();
    resetForm();
    
    const typeText = type === 'single' ? 'طالب' : type === 'double' ? 'طالبان' : 'مجموعة';
    showNotification(`تم تسجيل ${typeText}: ${students.map(s => s.name).join('، ')} بنجاح`, 'success');
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const tfoot = document.getElementById('tableFooter');
    
    if (!tbody || !tfoot) return;
    
    let filtered = [...window.bookings];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(b => b.paymentStatus === currentFilter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
            b.students && b.students.some(s => s.name && s.name.toLowerCase().includes(query))
        );
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (!filtered.length) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="14">
                    <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                    <p>${searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد حجوزات مسجلة حتى الآن'}</p>
                </td>
            </tr>
        `;
        tfoot.innerHTML = '';
        return;
    }
    
    const typeIcons = { single: 'fa-user', double: 'fa-user-friends', group: 'fa-users' };
    const typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    const categoryIcons = {
        'تقرير': 'fa-file-alt',
        'بحث': 'fa-search',
        'عرض تقديمي': 'fa-presentation',
        'كتاب': 'fa-book',
        'ملزمة': 'fa-copy'
    };
    const statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' };
    
    const studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    const studyIcons = {
        'morning': 'fa-sun',
        'evening': 'fa-moon',
        'hosting': 'fa-home'
    };
    const studyColors = {
        'morning': '#e65100',
        'evening': '#0d47a1',
        'hosting': '#1b5e20'
    };
    const studyBgColors = {
        'morning': '#fff3e0',
        'evening': '#e3f2fd',
        'hosting': '#e8f5e9'
    };
    
    tbody.innerHTML = filtered.map((b, i) => {
        const studentsHtml = (b.students || []).map(s => `
            <div style="margin: 3px 0; font-size: 13px; white-space: nowrap;">
                <i class="fas ${s.paid ? 'fa-check-circle' : 'fa-times-circle'}" 
                   style="color: ${s.paid ? 'var(--success)' : 'var(--danger)'}; margin-left: 6px; font-size: 12px;">
                </i>
                <span>${escapeHtml(s.name)}</span>
                ${s.isGroupLeader ? ' <small style="color: var(--primary);">(قائد)</small>' : ''}
            </div>
        `).join('');
        
        const studyText = studyTexts[b.studySession] || 'صباحي';
        const studyIcon = studyIcons[b.studySession] || 'fa-sun';
        const studyColor = studyColors[b.studySession] || '#e65100';
        const studyBg = studyBgColors[b.studySession] || '#fff3e0';
        
        return `
            <tr class="booking-row" data-id="${b.id}">
                <td>${i + 1}</td>
                <td>
                    <i class="fas ${typeIcons[b.type] || 'fa-user'}" title="${typeTexts[b.type] || 'طالب'}"></i>
                    <span style="margin-right: 5px;">${typeTexts[b.type] || 'طالب'}</span>
                    <br><small>(${b.totalStudents || 0} طالب)</small>
                </td>
                <td style="text-align: right;">${studentsHtml}</td>
                <td>
                    <span class="study-badge ${b.studySession || 'morning'}" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; background: ${studyBg}; color: ${studyColor}; border: 1px solid ${studyColor}40; white-space: nowrap;">
                        <i class="fas ${studyIcon}" style="font-size: 13px;"></i>
                        <span>${studyText}</span>
                    </span>
                </td>
                <td>
                    <span class="booking-category">
                        <i class="fas ${categoryIcons[b.bookingCategory] || 'fa-tag'}" style="color: var(--primary); margin-left: 5px;"></i>
                        <span>${escapeHtml(b.bookingCategory || '-')}</span>
                    </span>
                    ${b.notes ? `<br><small class="booking-notes" title="${escapeHtml(b.notes)}" style="color: #666;">
                        <i class="fas fa-sticky-note"></i> ${escapeHtml(b.notes)}
                    </small>` : ''}
                </td>
                <td>${escapeHtml(b.college)}</td>
                <td>${escapeHtml(b.department)}</td>
                <td>${b.stage}</td>
                <td class="amount-cell">${formatCurrency(b.totalPrice)}</td>
                <td>${formatCurrency(b.paidAmount)}</td>
                <td style="color: ${b.remainingAmount > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 700;">
                    ${formatCurrency(b.remainingAmount)}
                </td>
                <td>
                    <span class="status-badge ${b.paymentStatus}">
                        ${statusTexts[b.paymentStatus] || 'غير معروف'}
                    </span>
                </td>
                <td>
                    <div>${b.dateFormatted}</div>
                    <small style="color: #999;">${b.timeFormatted}</small>
                </td>
                <td>
                    <div class="row-actions">
                        <button class="btn-icon btn-edit" onclick="editBooking('${b.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteBooking('${b.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    const totalAll = filtered.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalPaid = filtered.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalRemaining = totalAll - totalPaid;
    const totalStudents = filtered.reduce((sum, b) => sum + (b.totalStudents || 0), 0);
    
    tfoot.innerHTML = `
        <tr class="table-footer">
            <td colspan="4"><strong>المجاميع (${filtered.length} حجز - ${totalStudents} طالب)</strong></td>
            <td colspan="4"><strong>${formatCurrency(totalAll)}</strong></td>
            <td><strong>${formatCurrency(totalPaid)}</strong></td>
            <td style="color: ${totalRemaining > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 700;">
                ${formatCurrency(totalRemaining)}
            </td>
            <td colspan="3"></td>
        </tr>
    `;
}

function updateStats() {
    const filtered = currentFilter === 'all' ? 
        window.bookings : 
        window.bookings.filter(b => b.paymentStatus === currentFilter);
    
    document.getElementById('statTotalBookings').textContent = filtered.length;
    document.getElementById('statTotalAmount').textContent = formatCurrency(
        filtered.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    );
    document.getElementById('statPaidAmount').textContent = formatCurrency(
        filtered.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
    );
    document.getElementById('statUnpaidAmount').textContent = formatCurrency(
        filtered.reduce((sum, b) => sum + ((b.totalPrice || 0) - (b.paidAmount || 0)), 0)
    );
}

function deleteBooking(id) {
    const booking = window.bookings.find(b => b.id === id);
    if (!booking) return;
    
    const names = booking.students.map(s => s.name).join('، ');
    
    if (confirm(`حذف حجز: ${names}؟`)) {
        window.bookings = window.bookings.filter(b => b.id !== id);
        saveBookings();
        
        if (typeof addLog === 'function') {
            addLog('delete', 'حذف', `تم حذف: ${names}`, booking);
        }
        
        renderTable();
        updateStats();
        showNotification('تم الحذف', 'error');
    }
}

function editBooking(id) {
    const b = window.bookings.find(b => b.id === id);
    if (!b) return;
    
    const typeRadio = document.querySelector(`input[name="registrationType"][value="${b.type}"]`);
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
    
    const studyRadio = document.querySelector(`input[name="studySession"][value="${b.studySession || 'morning'}"]`);
    if (studyRadio) studyRadio.checked = true;
    
    const paymentRadio = document.querySelector(`input[name="paymentStatus"][value="${b.paymentStatus}"]`);
    if (paymentRadio) paymentRadio.checked = true;
    
    if (b.type === 'single') {
        fillStudentCard(1, b.students[0]);
    } else if (b.type === 'double') {
        fillStudentCard(1, b.students[0]);
        if (b.students[1]) fillStudentCard(2, b.students[1]);
    } else if (b.type === 'group') {
        fillStudentCard(1, b.students[0]);
        
        const memberCount = b.students.length - 1;
        document.getElementById('groupSize').value = Math.max(2, memberCount);
        updateGroupMembers();
        
        setTimeout(() => {
            for (let i = 1; i < b.students.length; i++) {
                const memberItem = document.querySelector(`.group-member-item[data-member-index="${i + 1}"]`);
                if (memberItem) {
                    const nameInput = memberItem.querySelector('.member-name');
                    const phoneInput = memberItem.querySelector('.member-phone-input');
                    const paidCheck = memberItem.querySelector('.member-paid');
                    
                    if (nameInput) nameInput.value = b.students[i].name || '';
                    if (phoneInput) phoneInput.value = b.students[i].phone || '';
                    if (paidCheck) paidCheck.checked = b.students[i].paid !== false;
                }
            }
        }, 150);
    }
    
    window.bookings = window.bookings.filter(booking => booking.id !== id);
    saveBookings();
    renderTable();
    updateStats();
    
    showNotification('تم تحميل الحجز للتعديل', 'warning');
}

function fillStudentCard(cardNumber, studentData) {
    if (!studentData) return;
    
    const card = document.getElementById('studentCard' + cardNumber);
    if (!card) return;
    
    const nameInput = card.querySelector('.student-name');
    const phoneInput = card.querySelector('.student-phone');
    const paidCheck = card.querySelector('.student-paid');
    
    if (nameInput) nameInput.value = studentData.name || '';
    if (phoneInput) phoneInput.value = studentData.phone || '';
    if (paidCheck) paidCheck.checked = studentData.paid !== false;
}

function resetForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    form.reset();
    document.querySelector('input[name="registrationType"][value="single"]').checked = true;
    document.querySelector('input[name="paymentStatus"][value="paid"]').checked = true;
    
    const groupContainer = document.getElementById('groupMembersContainer');
    if (groupContainer) groupContainer.innerHTML = '';
    
    const groupSize = document.getElementById('groupSize');
    if (groupSize) groupSize.value = '2';
    
    handleTypeChange();
    
    setTimeout(() => {
        document.getElementById('college')?.focus();
    }, 100);
}

function exportToExcel() {
    if (!window.bookings.length) {
        showNotification('لا توجد بيانات', 'warning');
        return;
    }
    
    const typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    const statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' };
    const studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    
    let csv = '\uFEFFالرقم,النوع,الطلاب,عدد الطلاب,الدراسة,نوع الحجز,الكلية,القسم,المرحلة,الشعبة,ملاحظات,السعر,المدفوع,المتبقي,الحالة,التاريخ\n';
    
    window.bookings.forEach((b, i) => {
        const studyText = studyTexts[b.studySession] || 'صباحي';
        
        csv += [
            i + 1,
            typeTexts[b.type] || '',
            '"' + b.students.map(s => s.name + (s.paid ? ' (مدفوع)' : ' (غير مدفوع)')).join(' | ') + '"',
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
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    
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

function showNotification(message, type = 'success') {
    if (window.notificationsEnabled === false) return;
    
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${escapeHtml(message)}`;
    
    container.appendChild(div);
    setTimeout(() => {
        if (div.parentNode) div.remove();
    }, 4000);
}

function setupListeners() {
    document.getElementById('bookingForm')?.addEventListener('submit', handleSubmit);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter || 'all';
            renderTable();
            updateStats();
        });
    });
    
    document.getElementById('searchInput')?.addEventListener('input', function() {
        searchQuery = this.value.trim();
        renderTable();
    });
    
    document.getElementById('totalPrice')?.addEventListener('input', autoUpdatePayment);
    document.getElementById('paidAmount')?.addEventListener('input', autoUpdatePayment);
}

function autoUpdatePayment() {
    const total = parseFloat(document.getElementById('totalPrice')?.value) || 0;
    const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    
    if (total === 0) {
        const radio = document.querySelector('input[name="paymentStatus"][value="unpaid"]');
        if (radio) radio.checked = true;
    } else if (paid >= total) {
        const radio = document.querySelector('input[name="paymentStatus"][value="paid"]');
        if (radio) radio.checked = true;
        if (paid > total) document.getElementById('paidAmount').value = total;
    } else if (paid > 0) {
        const radio = document.querySelector('input[name="paymentStatus"][value="partial"]');
        if (radio) radio.checked = true;
    } else {
        const radio = document.querySelector('input[name="paymentStatus"][value="unpaid"]');
        if (radio) radio.checked = true;
    }
}

function openLogModal() { 
    const modal = document.getElementById('logModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderLogs === 'function') renderLogs(); 
}
function closeLogModal() { 
    const modal = document.getElementById('logModal');
    if (modal) modal.classList.remove('active'); 
}
function openSettingsModal() { 
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderSettings === 'function') renderSettings(); 
}
function closeSettingsModal() { 
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active'); 
}
function showDeveloperInfo() { 
    const modal = document.getElementById('developerModal');
    if (modal) modal.classList.add('active'); 
    if (typeof renderDeveloperInfo === 'function') renderDeveloperInfo(); 
}
function closeDeveloperInfo() { 
    const modal = document.getElementById('developerModal');
    if (modal) modal.classList.remove('active'); 
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(modal) {
            modal.classList.remove('active');
        });
    }
});

function openPrintOptions() {
    const modal = document.getElementById('printOptionsModal');
    if (modal) modal.classList.add('active');
}

function closePrintOptions() {
    const modal = document.getElementById('printOptionsModal');
    if (modal) modal.classList.remove('active');
}

function printReport(filterType) {
    closePrintOptions();
    
    let dataToPrint = [];
    let reportTitle = 'تقرير جميع الحجوزات';
    
    switch(filterType) {
        case 'all':
            dataToPrint = [...window.bookings];
            reportTitle = 'تقرير جميع الحجوزات';
            break;
        case 'paid':
            dataToPrint = window.bookings.filter(b => b.paymentStatus === 'paid');
            reportTitle = 'تقرير الحجوزات المدفوعة بالكامل';
            break;
        case 'unpaid':
            dataToPrint = window.bookings.filter(b => b.paymentStatus === 'unpaid');
            reportTitle = 'تقرير الحجوزات غير المدفوعة';
            break;
        case 'partial':
            dataToPrint = window.bookings.filter(b => b.paymentStatus === 'partial');
            reportTitle = 'تقرير الحجوزات المدفوعة جزئياً';
            break;
        case 'filtered':
            let filterValue = currentFilter;
            if (filterValue === 'all') {
                dataToPrint = [...window.bookings];
                reportTitle = 'تقرير جميع الحجوزات (حسب الفلتر)';
            } else {
                dataToPrint = window.bookings.filter(b => b.paymentStatus === filterValue);
                const statusNames = { paid: 'المدفوعة بالكامل', unpaid: 'غير المدفوعة', partial: 'المدفوعة جزئياً' };
                reportTitle = `تقرير الحجوزات ${statusNames[filterValue] || ''}`;
            }
            break;
        default:
            dataToPrint = [...window.bookings];
            reportTitle = 'تقرير جميع الحجوزات';
    }
    
    dataToPrint.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (dataToPrint.length === 0) {
        showNotification('لا توجد بيانات للطباعة', 'warning');
        return;
    }
    
    const printContent = generatePrintContent(dataToPrint, reportTitle);
    
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
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

function generatePrintContent(data, title) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const typeTexts = { single: 'طالب', double: 'طالبان', group: 'مجموعة' };
    const statusTexts = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'مدفوع جزئياً' };
    const studyTexts = {
        'morning': 'صباحي',
        'evening': 'مسائي',
        'hosting': 'استضافة'
    };
    
    let rowsHtml = '';
    let totalAll = 0;
    let totalPaid = 0;
    let totalStudents = 0;
    
    let maxStudentsLength = 0;
    let maxCollegeLength = 0;
    let maxDeptLength = 0;
    let maxCategoryLength = 0;
    let maxStageLength = 0;
    let maxDateLength = 0;
    
    data.forEach(function(b) {
        let studentsText = '';
        b.students.forEach(function(s) {
            let name = s.name || '';
            if (s.isGroupLeader) {
                name = name + ' (مسؤول)';
            }
            const mark = s.paid ? '✓' : '✗';
            name = mark + ' ' + name;
            studentsText += name + ' ';
        });
        if (studentsText.length > maxStudentsLength) {
            maxStudentsLength = studentsText.length;
        }
        
        if ((b.college || '').length > maxCollegeLength) {
            maxCollegeLength = (b.college || '').length;
        }
        if ((b.department || '').length > maxDeptLength) {
            maxDeptLength = (b.department || '').length;
        }
        if ((b.bookingCategory || '').length > maxCategoryLength) {
            maxCategoryLength = (b.bookingCategory || '').length;
        }
        if ((b.stage || '').length > maxStageLength) {
            maxStageLength = (b.stage || '').length;
        }
        if ((b.dateFormatted || '').length > maxDateLength) {
            maxDateLength = (b.dateFormatted || '').length;
        }
    });
    
    const totalChars = maxStudentsLength + maxCollegeLength + maxDeptLength + 
                       maxCategoryLength + maxStageLength + maxDateLength + 50;
    
    let studentsPercent = Math.max(18, Math.min(28, (maxStudentsLength / totalChars) * 100));
    let collegePercent = Math.max(6, Math.min(12, (maxCollegeLength / totalChars) * 100));
    let deptPercent = Math.max(6, Math.min(12, (maxDeptLength / totalChars) * 100));
    let categoryPercent = Math.max(5, Math.min(10, (maxCategoryLength / totalChars) * 100));
    let stagePercent = Math.max(4, Math.min(8, (maxStageLength / totalChars) * 100));
    let datePercent = Math.max(7, Math.min(12, (maxDateLength / totalChars) * 100));
    
    const fixedColumnsWidth = 22 + 38 + 38 + 42 + 42 + 42 + 42;
    const totalFixedPercent = (fixedColumnsWidth / 900) * 100;
    const totalDynamicPercent = studentsPercent + collegePercent + deptPercent + categoryPercent + stagePercent + datePercent;
    
    const maxDynamicPercent = 100 - totalFixedPercent - 5; 
    if (totalDynamicPercent > maxDynamicPercent) {
        const scaleFactor = maxDynamicPercent / totalDynamicPercent;
        studentsPercent = studentsPercent * scaleFactor;
        collegePercent = collegePercent * scaleFactor;
        deptPercent = deptPercent * scaleFactor;
        categoryPercent = categoryPercent * scaleFactor;
        stagePercent = stagePercent * scaleFactor;
        datePercent = datePercent * scaleFactor;
    }
    
    data.forEach(function(b, i) {
        let studentsList = [];
        b.students.forEach(function(s) {
            let name = s.name || '';
            if (s.isGroupLeader) {
                name = name + ' (مسؤول)';
            }
            const mark = s.paid ? '✓' : '✗';
            name = mark + ' ' + name;
            studentsList.push(name);
        });
        
        const studentsNames = studentsList.join('<br>');
        const studyText = studyTexts[b.studySession] || 'صباحي';
        
        rowsHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${typeTexts[b.type] || ''}</td>
                <td class="students-cell">${studentsNames}</td>
                <td>${studyText}</td>
                <td>${b.bookingCategory || '-'}</td>
                <td class="college-cell">${b.college || ''}</td>
                <td class="dept-cell">${b.department || ''}</td>
                <td>${b.stage || ''}</td>
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
    });
    
    const totalRemaining = totalAll - totalPaid;
    
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
                padding: 6px 4px;
                color: #1a1a2e;
                background: white;
                font-size: 8.5px;
                direction: rtl;
            }
            
            .print-header {
                text-align: center;
                padding: 5px 0;
                border-bottom: 2px solid #1a237e;
                margin-bottom: 6px;
            }
            .print-header h1 {
                color: #1a237e;
                font-size: 14px;
                margin-bottom: 1px;
            }
            .print-header h1 i {
                color: #c6a700;
                margin-left: 4px;
            }
            .print-header .subtitle {
                color: #555;
                font-size: 8.5px;
            }
            .print-header .datetime {
                color: #777;
                font-size: 8px;
                margin-top: 2px;
            }
            .print-header .datetime i {
                margin-left: 3px;
            }
            
            .print-title {
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                color: #1a237e;
                margin: 5px 0 6px;
                padding: 4px;
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
                font-size: 8px;
                direction: rtl;
                table-layout: auto;
            }
            
            th {
                background: #1a237e;
                color: white;
                padding: 3px 3px;
                font-weight: 700;
                text-align: center;
                border: 1px solid #1a237e;
                font-size: 7.5px;
                white-space: nowrap;
            }
            
            td {
                padding: 2px 3px;
                border: 1px solid #ddd;
                text-align: center;
                vertical-align: middle;
                word-wrap: break-word;
                overflow-wrap: break-word;
                font-size: 8px;
            }
            
            th:nth-child(1), td:nth-child(1) { 
                width: 20px; 
                min-width: 18px; 
                max-width: 25px; 
            }
            
            th:nth-child(2), td:nth-child(2) { 
                width: 32px; 
                min-width: 30px; 
                max-width: 40px; 
            }
            
            th:nth-child(3), td:nth-child(3) { 
                width: ${Math.min(studentsPercent, 25)}%; 
                min-width: 100px; 
                max-width: 200px; 
            }
            
            th:nth-child(4), td:nth-child(4) { 
                width: 32px; 
                min-width: 30px; 
                max-width: 40px; 
            }
            
            th:nth-child(5), td:nth-child(5) { 
                width: ${Math.min(categoryPercent, 8)}%; 
                min-width: 35px; 
                max-width: 60px; 
            }
            
            th:nth-child(6), td:nth-child(6) { 
                width: ${Math.min(collegePercent, 10)}%; 
                min-width: 40px; 
                max-width: 75px; 
            }
            
            th:nth-child(7), td:nth-child(7) { 
                width: ${Math.min(deptPercent, 10)}%; 
                min-width: 40px; 
                max-width: 75px; 
            }
            
            th:nth-child(8), td:nth-child(8) { 
                width: ${Math.min(stagePercent, 6)}%; 
                min-width: 28px; 
                max-width: 42px; 
            }
            
            th:nth-child(9), td:nth-child(9) { 
                width: 38px; 
                min-width: 35px; 
                max-width: 45px; 
            }
            
            th:nth-child(10), td:nth-child(10) { 
                width: 38px; 
                min-width: 35px; 
                max-width: 45px; 
            }
            
            th:nth-child(11), td:nth-child(11) { 
                width: 38px; 
                min-width: 35px; 
                max-width: 45px; 
            }
            
            th:nth-child(12), td:nth-child(12) { 
                width: 38px; 
                min-width: 35px; 
                max-width: 48px; 
            }
            
            th:nth-child(13), td:nth-child(13) { 
                width: ${Math.min(datePercent, 10)}%; 
                min-width: 50px; 
                max-width: 80px; 
            }
            
            td.students-cell {
                text-align: right !important;
                direction: ltr !important;
                font-size: 8.5px !important;
                line-height: 1.7 !important;
                padding: 2px 6px !important;
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
            
            td.amount-cell {
                font-weight: 600;
                font-size: 8px;
                text-align: left !important;
                direction: ltr !important;
                white-space: nowrap;
                padding-left: 3px !important;
            }
            
            td.remaining {
                color: #c62828;
                font-weight: 700;
            }
            
            td.date-cell {
                font-size: 7.5px !important;
                line-height: 1.2 !important;
                white-space: normal !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                padding: 2px 3px !important;
            }
            
            td.college-cell, td.dept-cell {
                font-size: 7.5px;
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
                font-size: 6.5px;
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
                padding: 3px 3px;
                font-size: 8px;
            }
            
            .print-footer {
                margin-top: 6px;
                padding-top: 5px;
                border-top: 2px solid #ddd;
                display: flex;
                justify-content: space-between;
                font-size: 7.5px;
                color: #555;
            }
            .print-footer i {
                margin-left: 3px;
            }

            @media print {
                body {
                    padding: 3px 2px;
                    font-size: 7px;
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
                    font-size: 7.5px !important;
                    line-height: 1.5 !important;
                }
                .print-header h1 {
                    font-size: 12px;
                }
                .print-title {
                    font-size: 9px;
                    padding: 3px;
                }
                th {
                    font-size: 6.5px !important;
                    padding: 2px 2px !important;
                }
                td {
                    font-size: 7px !important;
                    padding: 1.5px 2px !important;
                }
                td.amount-cell {
                    font-size: 7px !important;
                }
                td.date-cell {
                    font-size: 6.5px !important;
                }
                .status-badge {
                    font-size: 5.5px !important;
                    padding: 1px 3px !important;
                }
                .print-footer {
                    font-size: 6.5px !important;
                }
                .total-row td {
                    font-size: 7px !important;
                }
                tr {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                th:nth-child(3), td:nth-child(3) { max-width: 160px; }
                th:nth-child(6), td:nth-child(6) { max-width: 60px; }
                th:nth-child(7), td:nth-child(7) { max-width: 60px; }
                th:nth-child(13), td:nth-child(13) { max-width: 65px; }
            }
            
            @page {
                size: A4 portrait;
                margin: 3mm 2mm;
            }
            
            @media screen and (max-width: 900px) {
                body {
                    padding: 3px 2px;
                    font-size: 6.5px;
                }
                th, td {
                    font-size: 6px;
                    padding: 1.5px 1.5px;
                }
                td.students-cell {
                    font-size: 6.5px !important;
                    line-height: 1.3 !important;
                }
                td.amount-cell {
                    font-size: 6px !important;
                }
                td.date-cell {
                    font-size: 5.5px !important;
                }
                .status-badge {
                    font-size: 5px;
                    padding: 1px 2px;
                }
                .print-header h1 {
                    font-size: 11px;
                }
                .print-title {
                    font-size: 8px;
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
                    <th>الدراسة</th>
                    <th>نوع الحجز</th>
                    <th>الكلية</th>
                    <th>القسم</th>
                    <th>المرحلة</th>
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
                    <td colspan="7" style="text-align: right; font-size: 8px; padding-right: 4px;">
                        <strong><i class="fas fa-calculator"></i> المجموع (${data.length} حجز — ${totalStudents} طالب)</strong>
                    </td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: left; font-weight: 700; direction: ltr; font-size: 7.5px;">${totalAll.toLocaleString('ar-IQ')}</td>
                    <td style="text-align: left; font-weight: 700; direction: ltr; font-size: 7.5px;">${totalPaid.toLocaleString('ar-IQ')}</td>
                    <td style="text-align: left; font-weight: 700; color: ${totalRemaining > 0 ? '#c62828' : '#2e7d32'}; direction: ltr; font-size: 7.5px;">
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