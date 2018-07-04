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

    function returnTime(input) {
        var hourRegexOb = /(((?<hr>\d+)(hr|hrs|hour|hours)\b)\s+((?<min>\d+)(m|min|mins|minutes)\b))|((?<minutes>\d+)(\s+|)(m|min|mins|minutes)\b)|((?<hours>\d+)(\s+|)(hr|hrs|hour|hours)\b)|((?<decimal>\d+\.\d+)(hr|hrs|hour|hours))/gm;
        var myArray;
        var result = 0;

        while ((myArray = hourRegexOb.exec(input)) !== null) {
            if (myArray.groups.hr && myArray.groups.min) result += parseInt(myArray.groups.hr) + myArray.groups.min/60;
            if (myArray.groups.hours) result += parseInt(myArray.groups.hours);
            if (myArray.groups.minutes) result += myArray.groups.minutes/60;
            if (myArray.groups.decimal) result = parseFloat(myArray.groups.decimal);
            
            return result;
        }
        return result;
    }

    function totalHours(input) {
        var total = 0;
        var coding = 0;
        var design = 0;

        
        for (i = 0; i < input.length > 0; i++) {
            // console.log(input[i]);

            if (input[i].hours !== undefined) total += input[i].hours;
            if (input[i].type === 'coding') coding += input[i].hours;
            if (input[i].type === 'design') design += input[i].hours;
        }
        // return result;
        return ({
            coding: coding,
            design: design,
            total: total
        });
    }

    let segment = segments.map(function(contents) {
        var h2Pattern = new RegExp(/^#{2}\s+((?<title>.*)(\s+|\s+`)(?<time>\(.*\)))/, 'm');
        var bullet = /^-\s.*/gm;
        var commentRegex = /^(Coding|coding|Mockup|mockup|Wireframe|wireframe|Designs|designs).*/gm;
        var commentRegex2 = /^((?<coding>Coding|coding)|(?<design>Mockup|mockup|Wireframe|wireframe|Designs|designs)).*/gm;

        if(h2Pattern.test(contents)) { 
            var validPattern = h2Pattern.exec(contents);
            var h2 = validPattern[2];
        }


        var lineArray = contents.match(bullet);

        if (lineArray === null) return {};

        let lineObject = lineArray.map(function(item) {
            return ({
                // line: {
                    line: item,
                    hours: returnTime(item),
                    type: 'coding'
                // }
            });
        });
        
        var commentObject = [];
        var commentObject2 = [];
        var commentCapture = [];

        var commentArrayHours;
        var commentIndex = 0;

        while ((commentArrayHours = commentRegex2.exec(contents)) !== null) {
            var type  = '';

            if (commentArrayHours.groups.coding !== undefined) type = 'coding';
            if (commentArrayHours.groups.design !== undefined) type = 'design';

            commentObject2.push({
                line: commentArrayHours[0],
                hours: returnTime(commentArrayHours),
                type: type
            });

            var type  = '';

            // console.log(commentObject2);
        }
        // console.log(commentObject2);

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

        return {
            title: h2,
            hours: {
                // coding: totalHours(lineObject) + totalHours(commentObject),
                // designs: 10,
                // total: totalHours(lineObject) + totalHours(commentObject) + 10
                coding: totalHours(commentObject2).coding + totalHours(lineObject).coding,
                design: totalHours(commentObject2).design + totalHours(lineObject).design,
                total: totalHours(commentObject2).total + totalHours(lineObject).total,
                // comment: totalHours(commentObject2),
                // line: totalHours(lineObject) 
            },
            comments: commentObject2,
            content: lineObject,
        };
    });
    
    for (var i = segment.length - 1; i >= 0; i--) {
        if (segment[i].title === undefined) segment.splice(i, 1);
    }
    
    console.log(segment);
    calculateTotalHours(segment);

    function calculateTotalHours(input) {
        var designTotal = 0;
        var codingTotal = 0;

        for (var i = 0; i < input.length; i++) {
            createSegment(input[i].hours.design, input[i].hours.coding, input[i].title);
            
            designTotal += input[i].hours.design;
            codingTotal += input[i].hours.coding;
        }
        createSegment(designTotal, codingTotal, 'Project');
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
            { title: 'Total', colour: 'purple', icon: 'clock-o', hours: designSegment + codingSegment},
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