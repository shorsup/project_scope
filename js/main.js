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

    $('.js-toggle-rt').click(function() {
        $('#targetDiv').show();
        $('.js-toggle-rt .fa, .js-toggle-md .fa').toggleClass('active');
    });

    $('.js-toggle-md').click(function() {
        $('#targetDiv').hide();
        $('.js-toggle-rt .fa, .js-toggle-md .fa').toggleClass('active');
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
    var regexItemMatch = input.match(regexItem);

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

    // if (matchesBaselineHr) {
    //     for (var i = 0; i < matchesBaselineHr.length; i++) {
    //         var match = matchesBaselineHr[i].match(numbers);
    //         var int = parseInt(match);

    //         sum += int;
    //         console.log("1 " + matchesBaselineHr);
    //     }
    // }

    // if (matchesBaselineMockupsHr) {
    //     for (var i = 0; i < matchesBaselineMockupsHr.length; i++) {
    //         var match = matchesBaselineMockupsHr[i].match(numbers);
    //         var int = parseInt(match);

    //         sum += int;
    //         mockupSum += int;
    //         console.log("1A " + matchesBaselineMockupsHr[i]);
    //     }
    // }

    // if (matchesBaselineMin) {
    //     for (var i = 0; i < matchesBaselineMin.length; i++) {
    //         var match = matchesBaselineMin[i].match(numbers);
    //         var int = parseInt(match);

    //         sum += int/60;
    //         console.log("2 " + matchesBaselineMin);
    //     }
    // }

    // if (matchesBaselineMockupsMin) {
    //     for (var i = 0; i < matchesBaselineMockupsMin.length; i++) {
    //         var match = matchesBaselineMockupsMin[i].match(numbers);
    //         var int = parseInt(match);

    //         sum += int/60;
    //         mockupSum += int/60;
    //         console.log("2A " + matchesBaselineMockupsMin[i]);
    //     }
    // }

    // if (matchesBaselineHrMin) {
    //     for (var i = 0; i < matchesBaselineHrMin.length; i++) {
    //         var numbers = /\d+/g;
    //         var match = matchesBaselineHrMin[i].match(numbers);
    //         var hours = parseInt(match[0]);
    //         var mins = parseInt(match[1]);

    //         sum += hours;
    //         sum += mins/60;
    //         console.log("3 " + matchesBaselineHrMin);
    //     }
    // }

    // if (matchesBaselineMockupsHrMin) {
    //     for (var i = 0; i < matchesBaselineMockupsHrMin.length; i++) {
    //         var numbers = /\d+/g;
    //         var match = matchesBaselineMockupsHrMin[i].match(numbers);
    //         var hours = parseInt(match[0]);
    //         var mins = parseInt(match[1]);

    //         mockupSum += hours;
    //         mockupSum += mins/60;
    //         sum += hours;
    //         sum += mins/60;
    //         console.log("3A " + matchesBaselineMockupsHrMin[i]);
    //     }
    // }

    // console.log("mockups " + mockupSum);
    var sum = codingSum + wireframeSum + mockupSum;
    var price = sum * 160;
    $('.js-hours-total').text(sum);
    $('.js-price-total').text(price);
    $('.js-mockups-total').text(mockupSum);
    $('.js-wireframes-total').text(wireframeSum);
    $('.js-coding-total').text(codingSum);
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