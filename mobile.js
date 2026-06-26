// Developer : Mohammed Al-Baqer
// Copyright (C) 2026 lnc
// Requests Student Cash
// JavaScript

(function() {
    'use strict';
    
    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
    
    function optimizeTableForMobile() {
        if (!isMobileDevice()) return;
        
        var tables = document.querySelectorAll('.table-wrapper table');
        tables.forEach(function(table) {
            table.style.minWidth = '800px';
            table.style.fontSize = '11px';
            
            var cells = table.querySelectorAll('td, th');
            cells.forEach(function(cell) {
                cell.style.fontSize = '10px';
                cell.style.padding = '4px 3px';
            });
        });
    }
    
    function optimizeCardsForMobile() {
        if (!isMobileDevice()) return;
        
        var cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            card.style.marginBottom = '15px';
            card.style.borderRadius = '8px';
        });
        
        var cardBodies = document.querySelectorAll('.card-body');
        cardBodies.forEach(function(body) {
            body.style.padding = '15px';
        });
        
        var cardHeaders = document.querySelectorAll('.card-header');
        cardHeaders.forEach(function(header) {
            header.style.padding = '15px';
            header.style.fontSize = '14px';
        });
    }
    
    function optimizeFormForMobile() {
        if (!isMobileDevice()) return;
        
        var formControls = document.querySelectorAll('.form-control');
        formControls.forEach(function(input) {
            input.style.fontSize = '14px';
            input.style.padding = '10px 35px 10px 15px';
        });
        
        var buttons = document.querySelectorAll('.btn');
        buttons.forEach(function(btn) {
            btn.style.fontSize = '13px';
            btn.style.padding = '10px 15px';
            btn.style.minHeight = '44px';
        });
        
        var radioLabels = document.querySelectorAll('.reg-type-content, .payment-status-content, .study-session-content');
        radioLabels.forEach(function(label) {
            label.style.padding = '12px 10px';
            label.style.fontSize = '13px';
        });
    }
    
    function optimizeModalsForMobile() {
        if (!isMobileDevice()) return;
        
        var modals = document.querySelectorAll('.modal');
        modals.forEach(function(modal) {
            modal.style.width = '95%';
            modal.style.maxWidth = '95%';
            modal.style.maxHeight = '90vh';
            modal.style.borderRadius = '10px';
        });
        
        var modalBodies = document.querySelectorAll('.modal-body');
        modalBodies.forEach(function(body) {
            body.style.padding = '15px';
            body.style.maxHeight = '60vh';
            body.style.overflowY = 'auto';
        });
        
        var modalHeaders = document.querySelectorAll('.modal-header');
        modalHeaders.forEach(function(header) {
            header.style.padding = '12px 15px';
            header.style.flexWrap = 'wrap';
            header.style.gap = '8px';
        });
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
   
    function optimizeStatsForMobile() {
        if (!isMobileDevice()) return;
        
        var statBoxes = document.querySelectorAll('.stat-box');
        statBoxes.forEach(function(box) {
            box.style.padding = '15px';
            box.style.textAlign = 'center';
            
            var statValue = box.querySelector('.stat-value');
            if (statValue) {
                statValue.style.fontSize = '22px';
            }
            
            var statLabel = box.querySelector('.stat-label');
            if (statLabel) {
                statLabel.style.fontSize = '11px';
            }
        });
    }
  
    function optimizeFiltersForMobile() {
        if (!isMobileDevice()) return;
        
        var filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.style.flexWrap = 'wrap';
            filterSection.style.gap = '5px';
        }
        
        var filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(function(btn) {
            btn.style.padding = '6px 12px';
            btn.style.fontSize = '11px';
            btn.style.borderRadius = '15px';
        });
        
        var searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.style.width = '100%';
            var searchInput = searchBox.querySelector('.search-input');
            if (searchInput) {
                searchInput.style.width = '100%';
                searchInput.style.fontSize = '13px';
                searchInput.style.padding = '8px 35px 8px 12px';
            }
        }
    }
    
    function preventAutoZoom() {
        if (!isMobileDevice()) return;
        
        var inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.style.fontSize = '16px';
        });
    }
    
    function optimizeActionButtonsForMobile() {
        if (!isMobileDevice()) return;
        
        var actionRows = document.querySelectorAll('.row-actions');
        actionRows.forEach(function(row) {
            row.style.flexDirection = 'row';
            row.style.gap = '4px';
            row.style.flexWrap = 'wrap';
            row.style.justifyContent = 'center';
        });
        
        var actionBtns = document.querySelectorAll('.btn-icon');
        actionBtns.forEach(function(btn) {
            btn.style.width = '34px';
            btn.style.height = '34px';
            btn.style.fontSize = '13px';
            btn.style.minHeight = '34px';
            btn.style.minWidth = '34px';
        });
    }
    
    function optimizeDateTimeForMobile() {
        if (!isMobileDevice()) return;
        
        var navDateTime = document.querySelector('.nav-datetime');
        if (navDateTime) {
            navDateTime.style.fontSize = '11px';
            var time = navDateTime.querySelector('.time');
            if (time) {
                time.style.fontSize = '14px';
            }
        }
    }
    
    function optimizeNavForMobile() {
        if (!isMobileDevice()) return;
        
        var navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.style.flexDirection = 'column';
            navContainer.style.height = 'auto';
            navContainer.style.padding = '10px 15px';
            navContainer.style.gap = '8px';
        }
        
        var navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.style.flexWrap = 'wrap';
            navActions.style.justifyContent = 'center';
            navActions.style.gap = '5px';
        }
        
        var navBtns = document.querySelectorAll('.btn-nav');
        navBtns.forEach(function(btn) {
            btn.style.padding = '5px 12px';
            btn.style.fontSize = '11px';
            btn.style.borderRadius = '15px';
            
            var span = btn.querySelector('span:not(.badge)');
            if (span && btn.querySelector('.badge')) {
                span.style.display = 'none';
            }
        });
        
        var navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            var navTitle = navBrand.querySelector('.nav-title');
            if (navTitle) {
                navTitle.style.fontSize = '16px';
            }
            var navSubtitle = navBrand.querySelector('.nav-subtitle');
            if (navSubtitle) {
                navSubtitle.style.fontSize = '9px';
            }
            var navLogo = navBrand.querySelector('.nav-logo');
            if (navLogo) {
                navLogo.style.width = '35px';
                navLogo.style.height = '35px';
                navLogo.style.fontSize = '16px';
            }
        }
    }
    
    function reapplyMobileOptimizations() {
        var styleTag = document.getElementById('mobile-optimization-style');
        if (styleTag) {
            styleTag.remove();
        }
        
        var style = document.createElement('style');
        style.id = 'mobile-optimization-style';
        style.textContent = `
            @media (max-width: 768px) {
                .nav-container { flex-direction: column !important; height: auto !important; padding: 8px 12px !important; gap: 6px !important; }
                .nav-actions { flex-wrap: wrap !important; justify-content: center !important; gap: 4px !important; }
                .btn-nav { padding: 4px 10px !important; font-size: 10px !important; border-radius: 12px !important; }
                .btn-nav span:not(.badge) { display: none !important; }
                .nav-title { font-size: 15px !important; }
                .nav-subtitle { font-size: 9px !important; }
                .nav-logo { width: 32px !important; height: 32px !important; font-size: 14px !important; }
                
                .dashboard-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
                .stats-container { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
                .stat-box { padding: 12px !important; text-align: center !important; }
                .stat-value { font-size: 20px !important; }
                .stat-label { font-size: 10px !important; }
                
                .registration-types { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
                .payment-status-options { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
                .study-session-options { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
                .form-row { grid-template-columns: 1fr !important; gap: 10px !important; }
                
                .card-body { padding: 12px !important; }
                .card-header { padding: 12px 15px !important; }
                .card-header h3 { font-size: 16px !important; }
                
                .form-control { font-size: 14px !important; padding: 8px 30px 8px 12px !important; }
                .btn { font-size: 12px !important; padding: 8px 12px !important; min-height: 40px !important; }
                .btn-nav .badge { font-size: 9px !important; padding: 1px 6px !important; }
                
                .filter-section { flex-wrap: wrap !important; gap: 4px !important; }
                .filter-btn { padding: 5px 10px !important; font-size: 10px !important; border-radius: 12px !important; }
                .search-box { width: 100% !important; }
                .search-input { width: 100% !important; font-size: 12px !important; padding: 6px 30px 6px 10px !important; }
                
                .table-wrapper { overflow-x: auto !important; }
                table { min-width: 700px !important; font-size: 10px !important; }
                th, td { padding: 3px 4px !important; font-size: 9px !important; }
                .status-badge { font-size: 8px !important; padding: 1px 6px !important; }
                .btn-icon { width: 30px !important; height: 30px !important; font-size: 11px !important; }
                
                .modal { width: 95% !important; max-width: 95% !important; max-height: 90vh !important; border-radius: 10px !important; }
                .modal-header { padding: 10px 12px !important; flex-wrap: wrap !important; gap: 6px !important; }
                .modal-header h3 { font-size: 15px !important; }
                .modal-body { padding: 12px !important; max-height: 55vh !important; }
                
                .notification { min-width: auto !important; width: 90% !important; left: 5% !important; font-size: 12px !important; padding: 12px 15px !important; }
                .group-member-item { grid-template-columns: 1fr !important; gap: 8px !important; }
                
                .student-card { padding: 12px !important; }
                .student-card-header { flex-wrap: wrap !important; gap: 8px !important; }
                
                .button-group { flex-direction: column !important; gap: 8px !important; }
                .button-group .btn { width: 100% !important; }
                
                .print-footer { flex-direction: column !important; text-align: center !important; gap: 5px !important; }
                .print-footer span { font-size: 8px !important; }
                
                /* خيارات الطباعة */
                #printOptionsModal .modal-body button { font-size: 13px !important; padding: 12px !important; }
            }
            
            @media (max-width: 400px) {
                .registration-types { grid-template-columns: 1fr !important; }
                .payment-status-options { grid-template-columns: 1fr !important; }
                .study-session-options { grid-template-columns: 1fr !important; }
                .stats-container { grid-template-columns: 1fr 1fr !important; }
                .nav-title { font-size: 13px !important; }
                .stat-value { font-size: 17px !important; }
            }
        `;
        document.head.appendChild(style);
        
        optimizeTableForMobile();
        optimizeCardsForMobile();
        optimizeFormForMobile();
        optimizeModalsForMobile();
        optimizeStatsForMobile();
        optimizeFiltersForMobile();
        preventAutoZoom();
        optimizeActionButtonsForMobile();
        optimizeDateTimeForMobile();
        optimizeNavForMobile();
    }
    
    function initMobileOptimizations() {
        if (!isMobileDevice()) return;
        
        reapplyMobileOptimizations();
        
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                reapplyMobileOptimizations();
            }, 250);
        });
        
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                reapplyMobileOptimizations();
            }, 300);
        });
        
        console.log('أنت تستخدم الهاتف حالياً');
    }
    
    
    function printMobileReport(filterType) {
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
        var originalPrintReport = window.printReport;
        
        window.printReport = function(filterType) {
            closePrintOptions();
            printMobileReport(filterType);
        };
        
        var originalPrintSingle = window.printSingleBooking;
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
    }
    
    window.isMobileDevice = isMobileDevice;
    window.initMobileOptimizations = initMobileOptimizations;
    window.reapplyMobileOptimizations = reapplyMobileOptimizations;
    window.printMobile = printMobile;
    window.printMobileReport = printMobileReport;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileOptimizations);
    } else {
        initMobileOptimizations();
    }
    
    console.log('أنت تستخدم الهاتف حالياً');
    
})();