$(document).ready(function() {
    calculateTotalHours();
    // milestones();
    run();
    groupDetection();

    var editor = ace.edit("editor");
    
    editor.session.on('change', function(delta) {
        calculateTotalHours();
        // milestones();
        run();
        groupDetection();
    });
});

function toggleSnippetMenu() {
    $('.wrapper-snippet-menu').toggle('hide');
}

function insertSnippet(string) {
    var editor = ace.edit("editor");
    // editor.insert(string);
    // Use below when making a proper snippet manager: 
    var snippetManager = ace.require("ace/snippets").snippetManager;
    snippetManager.insertSnippet(editor, '- The ${1:name} banners are set up as adverts and assigned to two separate advert groups, one for desktop and one for mobile: ${1:desktop_group} and ${2:mobile_group}');
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

    if (matchesHr) {
        for (var i = 0; i < matchesHr.length; i++) {
            var match = matchesHr[i].match(numbers);
            var int = parseInt(match);

            sum += int;

            console.log(matchesHrLine[i])
        }
    }

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

    if (matchesMin) {
        for (var i = 0; i < matchesMin.length; i++) {
            var match = matchesMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;

            console.log(matchesMinLine[i])
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

    if (matchesHrMin) {
        for (var i = 0; i < matchesHrMin.length; i++) {
            var numbers = /\d+/g;
            var match = matchesHrMin[i].match(numbers);
            var hours = parseInt(match[0]);
            var mins = parseInt(match[1]);

            sum += hours;
            sum += mins/60;

            console.log(matchesHrMinLine[i])
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

    console.log("mockups " + mockupSum);
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