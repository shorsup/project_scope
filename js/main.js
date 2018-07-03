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

    // segment.map(segment => ``);
    // const dogs = new Map();
    // dogs.set('Hugo', 20);

    // #{2}\s+(.*(\(.*))
    // #{2}\s+(.*(?!\s)(\(.*))

    const editorValue = ace.edit('editor').getValue();
    const segments = editorValue.split('---');
    // console.log(segment[0]);
    // console.log(segment[1]);

    let segment = segments.map(function(contents) {
        // var h2Pattern = new RegExp(/#{2}\s+.*(?!\s).*/, 'g');
        // var h2Pattern = new RegExp(/^#{2}\s+(.*)/, 'gm');
        var h2Pattern = new RegExp(/^#{2}\s+((?<title>.*)\s+(?<time>\(.*))/, 'm');
        var h3Pattern = new RegExp(/^#{3}\s+(.*)/, 'm');
        var bullet = /^-\s.*/gm;
        var min = new RegExp(/\d+m|min|mins|minutes/, 'g');
        var hour = new RegExp(/\d+hr|hrs|hour|hours/, 'g');
        var time = new RegExp(/<!--(min|hour)-->/, 'g');

        if(h2Pattern.test(contents)) { 
            var validPattern = h2Pattern.exec(contents);
            var h2 = validPattern[2];
            // console.log(validPattern.groups.title);
        }

        // console.log(hourArray);

            // if(hourRegexOb.test(contents)) { 
            var hourRegexOb = /(?<minutes>\d+(\s+|)(m|min|mins|minutes)\b)|(?<hours>\d+(\s+|)(hr|hrs|hour|hours)\b)|(?<decimalHours>\d+\.\d+(hr|hrs|hour|hours))/gm;
            var myArray;
            // var validPattern = hourRegexOb.exec(contents);
            while ((myArray = hourRegexOb.exec(contents)) !== null) {
                // console.log(myArray.groups.minutes);
            }

            // var test = contents.match(hourRegexOb);
            
            // console.log(validPattern === null);
            // console.log(validPattern);
            
            // console.log(test);
        // }

        if(h3Pattern.test(contents)) { 
            var validPattern = h3Pattern.exec(contents);
            var h3 = validPattern[1];
            // console.log(h3Pattern.exec(contents));
        }
        // console.log(h2Pattern.test(contents));

        // console.log(contents.match(bullet));

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
            

            // console.log(item);

            // **TODO:**
            // 1. Function to calculate type
            // 2. Function to calculate times (if no time, time is 0)
            return ({
                line: {
                    text: item,
                    hours: returnTime(item),
                    type: 'coding'
                }
            });
        });

        if(bullet.test(contents)) { 
            var validPattern = bullet.exec(contents);
            var bullet = validPattern;
            // console.log(bullet);
        }

        return {
            title: h2,
            subtitle: h3,
            content: lineObject
        };
    });

    // console.log(line);
    for (i = 0; i < segment.length; i++) {
        if (segment[i].title === undefined) segment.splice(i, 1);
    }
    console.log(segment);
});

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

function pdfRender() {
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('landscape')
    var featureNotesHTML = $('#markdownPreview').html();

    doc.text(featureNotesHTML, 10, 10)
    doc.save('a4.pdf')
}

function calculate() {
    calculateTotalHours();
    milestones();
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

function toggleSnippetMenu() {
    $('.wrapper-snippet-menu').toggle('hide');
}

function insertSnippet(string, editor) {
    var editor = ace.edit(editor);
    editor.insert(string);
    editor.gotoLine(10, 0, false);
    editor.focus();
}

function minutesRegex(regexItem, regexLine, timepoint, type, input) {
    // Regex
    var numbers = /\d+/g;
    var regexLineMatch = input.match(regexLine);

    // Totals
    var mockupTotal = 0;
    var codingTotal = 0;
    var wireframeTotal = 0;

    // Calculation
    if (regexLineMatch) {
        for (var i = 0; i < regexLineMatch.length; i++) {
            var itemWithinLine = regexLineMatch[i].match(regexItem);
            var sum = 0;

            // console.log('hours ' + itemWithinLine);

            if (itemWithinLine) {
                var hours = parseInt(itemWithinLine[0].match(numbers));

                if (timepoint === 'mins') sum += hours/60;
                if (timepoint === 'hrs') sum += hours;
                if (timepoint === 'hrs/mins') {
                    var mins = parseInt(itemWithinLine[0].match(numbers)[1]);

                    sum += hours;
                    sum += mins/60;
                }

                if (regexLineMatch[i].match(/mockup/g) || type === 'baseline mockup') {
                    mockupTotal += sum;
                    sum = 0;
                    // console.log('mockup found: ' + mockupTotal);
                }
                if (type === 'baseline wireframe') {
                    wireframeTotal += sum;
                    sum = 0;
                    // console.log('wireframe found: ' + wireframeTotal);
                }
                codingTotal += sum;
            }
        }
    }
    return [codingTotal, mockupTotal, wireframeTotal];
}

function calculateTotalHours() {
    // Hour Totals
    var codingSum = 0;
    var mockupSum = 0;
    var wireframeSum = 0;

    // Input
    var editor = ace.edit('editor');
    var input = editor.getValue();

    var segment = input.split('---');

    // ---Normal Times---
    // Coding
    codingSum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal', input)[0];
    codingSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal', input)[0];
    codingSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal', input)[0];
    // Mockups
    mockupSum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal', input)[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal', input)[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal', input)[1];

    // ---Baseline Times---
    // Coding
    codingSum += minutesRegex(/Coding\s(\d+)(m|min|mins|minutes)\n/g, /Coding\s(\d+)(m|min|mins|minutes)\n/g, 'mins', 'baseline', input)[0];
    codingSum += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\n/g, /Coding\s(\d+)(hr|hrs|hour|hours)\n/g, 'hrs', 'baseline', input)[0];
    codingSum += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline', input)[0];
    // Wireframes
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline wireframe', input)[2];
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline wireframe', input)[2];
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline wireframe', input)[2];
    // Mockups
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline mockup', input)[1];
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline mockup', input)[1];
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline mockup', input)[1];

    for (var i = 0; i < segment.length; i++) {
        var codingSegment = 0;
        var wireframeSegment = 0;
        var mockupSegment = 0;
        
        // ---Normal Times---
        // Coding
        codingSegment += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal', segment[i])[0];
        codingSegment += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal', segment[i])[0];
        codingSegment += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal', segment[i])[0];
        // Mockups
        mockupSegment += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal', segment[i])[1];
        mockupSegment += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal', segment[i])[1];
        mockupSegment += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal', segment[i])[1];

        // ---Baseline Times---
        // Coding
        codingSegment += minutesRegex(/Coding\s(\d+)(m|min|mins|minutes)\n/g, /Coding\s(\d+)(m|min|mins|minutes)\n/g, 'mins', 'baseline', segment[i])[0];
        codingSegment += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\n/g, /Coding\s(\d+)(hr|hrs|hour|hours)\n/g, 'hrs', 'baseline', segment[i])[0];
        codingSegment += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline', segment[i])[0];
        // Wireframes
        wireframeSegment += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline wireframe', segment[i])[2];
        wireframeSegment += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline wireframe', segment[i])[2];
        wireframeSegment += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline wireframe', segment[i])[2];
        // Mockups
        mockupSegment += minutesRegex(/(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline mockup', segment[i])[1];
        mockupSegment += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline mockup', segment[i])[1];
        mockupSegment += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline mockup', segment[i])[1];

        if (codingSegment === 0 ) codingSegment = null;
        if (wireframeSegment === 0 ) wireframeSegment = null;
        if (mockupSegment === 0 ) mockupSegment = null;

        var segmentTotal = codingSegment + wireframeSegment + mockupSegment;
        if (segmentTotal === 0 ) segmentTotal = null;

        milestonesInput(segment[i], wireframeSegment + mockupSegment, codingSegment);
    }

    var sum = codingSum + wireframeSum + mockupSum;
    var price = sum * 160;
    $('.js-hours-total').text(sum);
    $('.js-price-total').text(price);
    $('.js-mockups-total').text(mockupSum);
    $('.js-wireframes-total').text(wireframeSum);
    $('.js-coding-total').text(codingSum);
}

function milestones() {
    var milestoneRegex = /\#+.+?((hr|m)\))/g;
    var editor = ace.edit("editor");
    var input = editor.getValue();

    var milestoneMatch = input.match(milestoneRegex);

    var x = '';

    if (milestoneMatch) {
        for (var i = 0; i < milestoneMatch.length; i++) {
            x += '<p> ' + milestoneMatch[i].match(/(?!#)(?!\s).+/g) + '</p>';
        }
    }

    $('.js-milestones').html(x);
}

function calculateType(input) {
    var milestoneRegex = new RegExp(/\#+.+?((hr|m)\))/, 'g');

    milestoneRegex.test(input);
    // input.test(milestoneRegex);

    // return milestoneMatch = input.match(milestoneRegex);
}

// new RegExp(/^#{2}\s+((.*)\s+(\(.*))/, 'm');
function milestonesInput(input, designSegment, codingSegment) {
    var milestoneRegex = /\#+.+?((hr|m)\))/g;

    var milestoneMatch = input.match(milestoneRegex);

    var segmentTitle = '';

    if (milestoneMatch) {
        for (var i = 0; i < milestoneMatch.length; i++) {
            segmentTitle += milestoneMatch[i].match(/(?!#)(?!\s).+/g);
        }
    }

    createSegment(designSegment, codingSegment, segmentTitle);
}

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