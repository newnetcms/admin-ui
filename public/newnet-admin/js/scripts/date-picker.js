$(document).ready(function () {
    "use strict"; // Start of use strict

    const germanMapping = {
        'Su': 'CN',
        'Mo': 'T2',
        'Tu': 'T3',
        'We': 'T4',
        'Th': 'T5',
        'Fr': 'T6',
        'Sa': 'T7',

        'January': 'Tháng 1',
        'February': 'Tháng 2',
        'March': 'Tháng 3',
        'April': 'Tháng 4',
        'May': 'Tháng 5',
        'June': 'Tháng 6',
        'July': 'Tháng 7',
        'August': 'Tháng 8',
        'September': 'Tháng 9',
        'October': 'Tháng 10',
        'November': 'Tháng 11',
        'December': 'Tháng 12',

        "Apply": "Áp dụng",
        "Cancel": "Huỷ"
    }
    function tc(val) {
        if (window.locale === 'vi') {
            return germanMapping[val];
        }

        return val;
    }

    $('.date-picker').each(function () {
        var $this = $(this);

        var options = $this.data('options');
        $this.daterangepicker(Object.assign({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
                format: 'YYYY-MM-DD',
                applyLabel: tc('Apply'),
                cancelLabel: tc('Cancel'),
                daysOfWeek: [
                    tc('Su'), tc('Mo'), tc('Tu'), tc('We'), tc('Th'), tc('Fr'), tc('Sa')
                ],
                monthNames: [
                    tc('January'), tc('February'), tc('March'), tc('April'), tc('May'), tc('June'), tc('July'), tc('August'), tc('September'), tc('October'), tc('November'), tc('December')
                ],
                firstDay: 1,
            }
        }, options || {}), function (start) {
            $this.val(start.format('YYYY-MM-DD'));
        });
    });

    $('.datetime-picker').each(function () {
        var $this = $(this);

        var options = $this.data('options');
        $this.daterangepicker(Object.assign({
            timePicker: true,
            timePicker24Hour: true,
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
                format: 'YYYY-MM-DD HH:mm:ss',
                applyLabel: tc('Apply'),
                cancelLabel: tc('Cancel'),
                daysOfWeek: [
                    tc('Su'), tc('Mo'), tc('Tu'), tc('We'), tc('Th'), tc('Fr'), tc('Sa')
                ],
                monthNames: [
                    tc('January'), tc('February'), tc('March'), tc('April'), tc('May'), tc('June'), tc('July'), tc('August'), tc('September'), tc('October'), tc('November'), tc('December')
                ],
                firstDay: 1,
            }
        }, options || {}), function (start) {
            $this.val(start.format('YYYY-MM-DD HH:mm:ss'));
        });
    });

    $('.daterange-picker').each(function () {
        var $this = $(this);

        var options = $this.data('options');
        $this.daterangepicker(Object.assign({
            timePicker: false,
            timePicker24Hour: false,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
                format: 'YYYY/MM/DD',
                applyLabel: tc('Apply'),
                cancelLabel: tc('Cancel'),
                daysOfWeek: [
                    tc('Su'), tc('Mo'), tc('Tu'), tc('We'), tc('Th'), tc('Fr'), tc('Sa')
                ],
                monthNames: [
                    tc('January'), tc('February'), tc('March'), tc('April'), tc('May'), tc('June'), tc('July'), tc('August'), tc('September'), tc('October'), tc('November'), tc('December')
                ],
                firstDay: 1,
            }
        }, options || {}), function (start, end) {
            $this.val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
        });
    });

    $('.datetimerange-picker').each(function () {
        var $this = $(this);

        var options = $this.data('options');
        $this.daterangepicker(Object.assign({
            timePicker: true,
            timePicker24Hour: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
                format: 'YYYY/MM/DD HH:mm',
                applyLabel: tc('Apply'),
                cancelLabel: tc('Cancel'),
                daysOfWeek: [
                    tc('Su'), tc('Mo'), tc('Tu'), tc('We'), tc('Th'), tc('Fr'), tc('Sa')
                ],
                monthNames: [
                    tc('January'), tc('February'), tc('March'), tc('April'), tc('May'), tc('June'), tc('July'), tc('August'), tc('September'), tc('October'), tc('November'), tc('December')
                ],
                firstDay: 1,
            }
        }, options || {}), function (start, end) {
            $this.val(start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('YYYY/MM/DD HH:mm'));
        });
    });
});
