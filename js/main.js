$(document).ready(function() {
    calculate();

    if (localStorage.getItem("markdownStorage") != null && localStorage.getItem("notesStorage") != null) {
        loadEditors();
    }

    $('.js-toggle-rt, .js-toggle-md, .js-toggle-fn').on('click', function() {
        mode.set(this);
    });

    $('.js-calculate').click(function() {
        saveEditors();
        calculate();

        // Feature Notes Colour
        var colour = $('#fn-2').val();
        $('#targetDiv h1').css('background-color', colour);
        $('#targetDiv h2, #targetDiv h3').css('border-color', colour);
        $('#targetDiv a').css('color', colour);
    });

    const editorValue = ace.edit('editor').getValue();
    const segments = editorValue.split('---');

    let segment = segments.map(function(contents) {
        var h2Pattern = new RegExp(/^#{2}\s+((?<title>.*)\s+(?<time>\(.*))/, 'm');
        var bullet = /^-\s.*/gm;
        var commentRegex = /^(Coding|coding|Mockup|mockup|Wireframe|wireframe|Designs|designs).*/gm;

        if(h2Pattern.test(contents)) { 
            var validPattern = h2Pattern.exec(contents);
            var h2 = validPattern[2];
        }

        function returnTime(input) {
            var hourRegexOb = /((?<minutes>\d+)(\s+|)(m|min|mins|minutes)\b)|((?<hours>\d+)(\s+|)(hr|hrs|hour|hours)\b)|((?<decimal>\d+\.\d+)(hr|hrs|hour|hours))/gm;
            var myArray;
            var result = 0;

            while ((myArray = hourRegexOb.exec(input)) !== null) {
                if (myArray.groups.hours) result += parseInt(myArray.groups.hours);
                if (myArray.groups.minutes) result += myArray.groups.minutes/60;
                if (myArray.groups.decimal) result = parseFloat(myArray.groups.decimal);
                
                return result;
            }
            return result;
        }

        var lineArray = contents.match(bullet);
        let lineObject = lineArray.map(function(item) {
            return ({
                line: {
                    text: item,
                    hours: returnTime(item),
                    type: 'coding'
                }
            });
        });
        
        var commentObject = [];

        if (contents.match(commentRegex) !== null) {
            var commentArray = contents.match(commentRegex);

            for (i = 0; i < commentArray.length; i++) {
                commentObject[i] = {
                    line: commentArray[i],
                    hours: returnTime(commentArray[i]),
                    type: 'comment'
                }
            }
        }

        function totalHours(input) {
            var result = 0;

            for (i = 0; i < input.length; i++) {
                result += input[i].line.hours;
            }
            return result;
        }

        function totalHoursComment(input) {
            var result = 0;

            for (i = 0; i < input.length && input.length !== 0; i++) {
                result += input[i].hours;
            }
            return result;
        }

        return {
            title: h2,
            hours: {
                coding: totalHours(lineObject) + totalHoursComment(commentObject),
                designs: 10,
                total: totalHours(lineObject) + totalHoursComment(commentObject) + 10
            },
            comments: commentObject,
            content: lineObject,
        };
    });

    console.log(segment);

    function calculateTotalHours() {
        for (var i = 0; i < segment.length; i++) {
            createSegment(segment.hours.designs, segment.hours.coding, segment.title);
        }
    
        var sum = codingSum + wireframeSum + mockupSum;
        var price = sum * 160;
        $('.js-hours-total').text(sum);
        $('.js-price-total').text(price);
        $('.js-mockups-total').text(mockupSum);
        $('.js-wireframes-total').text(wireframeSum);
        $('.js-coding-total').text(codingSum);
    }
    
    function saveEditors() {
        if (typeof(Storage) !== "undefined") {
            var markdownEditor = ace.edit('editor');
            var notesEditor = ace.edit('notesEditor');
    
            // Store
            localStorage.setItem("markdownStorage", markdownEditor.getValue());
            localStorage.setItem("notesStorage", notesEditor.getValue());
        }
    }
    
    function loadEditors() {
        if (typeof(Storage) !== "undefined") {
            var markdownEditor = ace.edit('editor');
            var notesEditor = ace.edit('notesEditor');
    
            // Retrieve
            markdownEditor.setValue(localStorage.getItem("markdownStorage"));
            notesEditor.setValue(localStorage.getItem("notesStorage"));
        }
    }
    
    function calculate() {
        // calculateTotalHours();
        runMarkdown();
        runFeatureNotes();
    }
    
    const mode = {
        clear() {
            $('.wrapper-menu .menu .menu-btn').each(function() {
                $(this).find('.fa').removeClass('active');
                $('.editor, .sidebar').hide();
            });
        },
        set(mode) {
            this.clear();
            calculate();
    
            var editor = ($(mode).data('editor'));
            var sidebar = ($(mode).data('sidebar'));
    
            $(mode).find('.fa').addClass('active');
            $(editor).show();
            $(sidebar).show();
        }
    }
    
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    
    function createSegment(designSegment, codingSegment, segmentTitle) {
        var contents = $('.js-segments').html();
        let markup = '';
    
        const segment = [
            { title: 'Total', colour: 'green', icon: 'clock-o', hours: designSegment + codingSegment},
            { title: 'Design', colour: 'blue', icon: 'pencil', hours: designSegment },
            { title: 'Coding', colour: 'yellow', icon: 'code', hours: codingSegment }
        ];
    
        function renderSegment(segment) {
            return segment.map(segment => segment.hours ? `
                <div class="menu-row">
                    <p><i class="fa fa-${segment.icon} circle-bg ${segment.colour} text-center pull-left"></i> ${segment.title}</p>
                    <p><span class="${segment.colour}-colour">Hours</span> <span class="pull-right">${segment.hours}</span></p>
                </div>
                <hr>
            ` : '').join('');
        }
    
        markup += `
            <div class="wrapper-segment">
                <h2 class="section-title">${segmentTitle}</h2>
                ${renderSegment(segment)}
            </div>
        `;
    
        $('.js-segments').html(contents + markup);
    }
});