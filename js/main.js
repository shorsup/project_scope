$(document).ready(function() {
    calculateTotalHours();
    // milestones();
    run();
    groupDetection();

    var editor = ace.edit('editor');
    var input = editor.getValue();

    editor.session.on('change', function(delta) {
        calculateTotalHours();
        // milestones();
        run();
        groupDetection();
        Cookies.set('markdown', input);
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
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

function minutesRegex(regexItem, regexLine, type) {
    // Text Area
    var editor = ace.edit("editor");
    var input = editor.getValue();
    
    // Regex
    var numbers = /\d+/g;
    var regexLineMatch = input.match(regexLine);
    var regexItemMatch = input.match(regexItem);

    // Totals
    var total = 0;
    var mockupTotal = 0;

    // Calculation
    if (regexLineMatch) {
        console.log(regexLineMatch);
        console.log(regexLineMatch.length);

        for (var i = 0; i < regexLineMatch.length; i++) {
            var itemWithinLine = regexLineMatch[i].match(regexItem);
            var sum = 0;

            console.log('22 ' + itemWithinLine);

            if (itemWithinLine) {
                console.log('yey');
                console.log(type);

                var hours = parseInt(itemWithinLine[0].match(numbers));

                if (type === 'mins') sum += hours/60;
                if (type === 'hrs') sum += hours;
                if (type === 'hrs/mins') {
                    var mins = parseInt(itemWithinLine[0].match(numbers)[1]);

                    sum += hours;
                    sum += mins/60;
                }

                total = total + sum;

                if (regexLineMatch[i].match(/mockup/g)) {
                    console.log('mockup found');
                    mockupTotal += sum;
                }
            }
        }
    }
    console.log("total hours: " + total);
    console.log("total mockup hours: " + mockupTotal);
    return [total, mockupTotal];
}

function calculateTotalHours() {
    // Text Area
    var editor = ace.edit("editor");
    var input = editor.getValue();

    // Regex

    // Minutes Only
    var min = /<!--.\d+(m|min|mins|minutes).-->/g;
    var minLine = /.*(<!--.\d+(m|min|mins|minutes).-->).*/g;
    // var min = /\*\*\(\d\dm\)\*\*/g;
    
    // Hours Only
    var hr = /<!--.\d+(hr|hrs|hour|hours).-->/g; 
    var hrLine = /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g;
    // var hr = /\*\*\(\d+hr\)\*\*/g;
    
    // Hours & Minutes
    var hrMin = /<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g;
    var hrMinLine = /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g;
    // var hrMin = /\*\*\(\d+hr\s\d\dm\)\*\*/g;

    // ---Baseline Hours---
    // Coding
    var baselineMin = /Coding\s(\d+)(m|min|mins|minutes)\n/g;
    var baselineHr = /Coding\s(\d+)(hr|hrs|hour|hours)\n/g;
    var baselineHrMin = /Coding\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g;
    // Wireframes/Mockups
    var baselineMockupsMin = /(Wireframe|Wireframes|Mockup|Mockups)\s(\d+)(m|min|mins|minutes)\n/g;
    var baselineMockupsHr = /(Wireframe|Wireframes|Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\n/g;
    var baselineMockupsHrMin = /(Wireframe|Wireframes|Mockup|Mockups)\s(\d+)(hr|hrs|hour|hours)\s+(\d+)(m|min|mins|minutes)/g;

    // Numbers
    var numbers = /\d+/g;

    // Number Formats
    var matchesHr = input.match(hr);
    var matchesHrLine = input.match(hrLine);
    var matchesBaselineHr = input.match(baselineHr);
    var matchesBaselineMockupsHr = input.match(baselineMockupsHr);

    var matchesMin = input.match(min);
    var matchesMinLine = input.match(minLine);
    var matchesBaselineMin = input.match(baselineMin);
    var matchesBaselineMockupsMin = input.match(baselineMockupsMin);

    var matchesHrMin = input.match(hrMin);
    var matchesHrMinLine = input.match(hrMinLine);
    var matchesBaselineHrMin = input.match(baselineHrMin);
    var matchesBaselineMockupsHrMin = input.match(baselineMockupsHrMin);

    // Mockups
    var mockups = /mockup/;

    // Hour Totals
    var sum = 0;
    var total = 0;
    var mockupSum = 0;

    sum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins')[0];
    sum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs')[0];
    sum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins')[0];

    mockupSum += minutesRegex(/<!--.\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(m|min|mins|minutes).-->).*/g, 'mins')[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours).-->).*/g, 'hrs')[1];
    mockupSum += minutesRegex(/<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->/g, /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes).-->).*/g, 'hrs/mins')[1];

    if (matchesBaselineHr) {
        for (var i = 0; i < matchesBaselineHr.length; i++) {
            var match = matchesBaselineHr[i].match(numbers);
            var int = parseInt(match);

            sum += int;
            console.log("1 " + matchesBaselineHr);
        }
    }

    if (matchesBaselineMockupsHr) {
        for (var i = 0; i < matchesBaselineMockupsHr.length; i++) {
            var match = matchesBaselineMockupsHr[i].match(numbers);
            var int = parseInt(match);

            sum += int;
            mockupSum += int;
            console.log("1A " + matchesBaselineMockupsHr[i]);
        }
    }

    if (matchesBaselineMin) {
        for (var i = 0; i < matchesBaselineMin.length; i++) {
            var match = matchesBaselineMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;
            console.log("2 " + matchesBaselineMin);
        }
    }

    if (matchesBaselineMockupsMin) {
        for (var i = 0; i < matchesBaselineMockupsMin.length; i++) {
            var match = matchesBaselineMockupsMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;
            mockupSum += int/60;
            console.log("2A " + matchesBaselineMockupsMin[i]);
        }
    }

    if (matchesBaselineHrMin) {
        for (var i = 0; i < matchesBaselineHrMin.length; i++) {
            var numbers = /\d+/g;
            var match = matchesBaselineHrMin[i].match(numbers);
            var hours = parseInt(match[0]);
            var mins = parseInt(match[1]);

            sum += hours;
            sum += mins/60;
            console.log("3 " + matchesBaselineHrMin);
        }
    }

    if (matchesBaselineMockupsHrMin) {
        for (var i = 0; i < matchesBaselineMockupsHrMin.length; i++) {
            var numbers = /\d+/g;
            var match = matchesBaselineMockupsHrMin[i].match(numbers);
            var hours = parseInt(match[0]);
            var mins = parseInt(match[1]);

            mockupSum += hours;
            mockupSum += mins/60;
            sum += hours;
            sum += mins/60;
            console.log("3A " + matchesBaselineMockupsHrMin[i]);
        }
    }

    // console.log("mockups " + mockupSum);
    var price = sum * 160;
    $('.js-hours-total').text(sum);
    $('.js-price-total').text(price);
    $('.js-mockups-total').text(mockupSum);
    $('.js-coding-total').text(sum - mockupSum);
    return sum;
}

function milestones() {
    var milestoneRegex = /\#+.+?(hr\))/g;
    var milestoneRegex2 = /\#+.+?(m\))/g;
    var graphic = /^.*\b(a wireframe|a photoshop mockup)\b.*$/g;
    var editor = ace.edit("editor");
    var input = editor.getValue();

    var test = input.match(milestoneRegex);
    var test2 = input.match(milestoneRegex2);
    var test3 = input.match(graphic);

    var x = '';

    if (test) {
        for (var i = 0; i < test.length; i++) {
            x += test[i] + '<br>';
        }
    }

    if (test2) {
        for (var i = 0; i < test2.length; i++) {
            x += test2[i] + '<br>';
        }
    }

    $('.js-milestones').html(x);
}