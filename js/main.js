$(document).ready(function() {
    calculateTotalHours();
    milestones();
    run();
    groupDetection();

    var editor = ace.edit('editor');
    var input = editor.getValue();

    editor.session.on('change', function(delta) {
        calculateTotalHours();
        milestones();
        run();
        groupDetection();
        Cookies.set('markdown', input);
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    $('.js-toggle-rt').click(function() {
        if (!$('.js-toggle-rt .fa').hasClass('active')) {
            $('#targetDiv').show();
            $('.js-toggle-rt .fa').addClass('active');
            $('.js-toggle-md .fa').removeClass('active');
        }
    });

    $('.js-toggle-md').click(function() {
        if (!$('.js-toggle-md .fa').hasClass('active')) {
            $('#targetDiv').hide();
            $('.js-toggle-md .fa').addClass('active');
            $('.js-toggle-rt .fa').removeClass('active');
        }
    });
});

function toggleSnippetMenu() {
    $('.wrapper-snippet-menu').toggle('hide');
}

function insertSnippet(string, value) {
    var editor = ace.edit("editor");
    // editor.insert(string);
    // Use below when making a proper snippet manager: 
    var snippetManager = ace.require("ace/snippets").snippetManager;
    snippetManager.insertSnippet(editor, value);
}

function groupDetection() {
    // Text Area
    var editor = ace.edit("editor");
    var input = editor.getValue();

    var groupBoundaries = /^---((.|\n)*)(---)$/g;

    var matchesGroupBoundaries = input.match(groupBoundaries);

    if (matchesGroupBoundaries) {
        for (var i = 0; i < matchesGroupBoundaries.length; i++) {
            console.log(matchesGroupBoundaries[i]);
        }
    }

}

function minutesRegex(regexItem, regexLine, timepoint, type) {
    // Text Area
    var editor = ace.edit("editor");
    var input = editor.getValue();
    
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

            console.log('hours ' + itemWithinLine);

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
                    console.log('mockup found: ' + mockupTotal);
                }
                if (type === 'baseline wireframe') {
                    wireframeTotal += sum;
                    sum = 0;
                    console.log('wireframe found: ' + wireframeTotal);
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

    // ---Normal Times---
    // Coding
    codingSum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal')[0];
    codingSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal')[0];
    codingSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal')[0];
    // Mockups
    mockupSum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins', 'normal')[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs', 'normal')[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins', 'normal')[1];

    // ---Baseline Times---
    // Coding
    codingSum += minutesRegex(/Coding\s(\d+)(m|min|mins|minutes)\n/g, /Coding\s(\d+)(m|min|mins|minutes)\n/g, 'mins', 'baseline')[0];
    codingSum += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\n/g, /Coding\s(\d+)(hr|hrs|hour|hours)\n/g, 'hrs', 'baseline')[0];
    codingSum += minutesRegex(/Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline')[0];
    // Wireframes
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline wireframe')[2];
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline wireframe')[2];
    wireframeSum += minutesRegex(/(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Wireframe|Wireframes)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline wireframe')[2];
    // Mockups
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(m|min|mins|minutes)/g, 'mins', 'baseline mockup')[1];
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)/g, 'hrs', 'baseline mockup')[1];
    mockupSum += minutesRegex(/(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, /(Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g, 'hrs/mins', 'baseline mockup')[1];

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
            x += '<p>' + milestoneMatch[i] + '</p>';
        }
    }

    $('.js-milestones').html(x);
    // (?<=#+).*
}