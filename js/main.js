$(document).ready(function() {
    calculate();

    $('.js-toggle-rt, .js-toggle-md, .js-toggle-fn').on('click', function() {
        mode.set(this);
    });

    $('.js-calculate').click(function() {
        calculate();
    });
});

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

        var segmentTotal = codingSegment + wireframeSegment + mockupSegment;
        milestonesInput(segment[i], segmentTotal, wireframeSegment, mockupSegment, codingSegment);
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

function milestonesInput(input, segmentTotal, wireframeSegment, mockupSegment, codingSegment) {
    var milestoneRegex = /\#+.+?((hr|m)\))/g;

    var milestoneMatch = input.match(milestoneRegex);

    var giveMe = '';

    if (milestoneMatch) {
        for (var i = 0; i < milestoneMatch.length; i++) {
            giveMe += milestoneMatch[i].match(/(?!#)(?!\s).+/g);
        }
    }

    createSegment(segmentTotal, wireframeSegment, mockupSegment, codingSegment, giveMe);
}

function createSegment(segmentTotal, wireframeSegment, mockupSegment, codingSegment, title) {
    var segment = {
        types: [segmentTotal, wireframeSegment, mockupSegment, codingSegment],
        title: ['Total', 'Wireframe', 'Mockup', 'Coding'],
        colours: ['green', 'blue', 'pink', 'yellow'],
        icons: ['clock-o', 'pencil', 'paint-brush', 'code']
    };

    var output = "";
    var contents = $('.js-segments').html();

    output += "<div class='wrapper-segment'>";
    output += " <h2 class='section-title'>" + title + "</h2>";

    for (var i = 0; i < segment.types.length; i++) {
        if (segment.types[i] != 0) {
            output += " <div class='menu-row'>"; 
            output += "<p><i class='fa fa-" + segment.icons[i] + " circle-bg " + segment.colours[i] + " text-center pull-left'></i>" +  segment.title[i] + "</p>";
            output += "<p><span class='" + segment.colours[i] + "-colour'>Hours</span> <span class='pull-right'>" + segment.types[i] + "</span></p>";
            output += "</div>";
            output += "<hr>"; 
        }
    }
    output += "</div>";

    $('.js-segments').html(contents + output);
}