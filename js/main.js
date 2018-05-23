$(document).ready(function() {
    calculateTotalHours();
    milestones();
    run();

    // $("#textinput").bind('input propertychange', function() {
    //     calculateTotalHours();
    //     milestones();
    //     run();
    // });
    var editor = ace.edit("editor");
    editor.session.on('change', function(delta) {
        calculateTotalHours();
        milestones();
        run();
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
    var hrMin = /<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes)-->/g;
    var hrMinLine = /.*(<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes)-->).*/g;
    // var hrMin = /\*\*\(\d+hr\s\d\dm\)\*\*/g;

    // Numbers
    var numbers = /\d+/g;

    // Number Formats
    var matchesHr = input.match(hr);
    var matchesHrLine = input.match(hrLine);

    var matchesMin = input.match(min);
    var matchesMinLine = input.match(minLine);

    var matchesHrMin = input.match(hrMin);
    var matchesHrMinLine = input.match(hrMinLine);

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

            // Totaling Mockup Hours
            if (matchesHrLine[i].match(mockups)) {
                mockupSum += int;
            }

            console.log(matchesHrLine[i])
            // console.log("Hours: " + matchesHr[i]);
        }
    }

    if (matchesMin) {
        for (var i = 0; i < matchesMin.length; i++) {
            var match = matchesMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;

            // Totaling Mockup Hours
            if (matchesMinLine[i].match(mockups)) {
                mockupSum += int;
            }

            console.log(matchesMinLine[i])
            // console.log("Minutes: " + matchesMin[i]);
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

             // Totaling Mockup Hours
             if (matchesHrMinLine[i].match(mockups)) {
                mockupSum += int;
            }

            console.log(matchesHrMinLine[i])
            // console.log("Hours, Minutes: " + matchesHrMin[i]);
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

function updateTotalHours() {
    var totalHoursRegex = /\*\*XX\shours\*\*/;
    // var input = $('#textinput').val();
    var editor = ace.edit("editor");
    var input = editor.getValue();
    var sum = calculateTotalHours();

    input.replace(totalHoursRegex, '**' + sum + ' hours**');
}

function milestones() {
    var milestoneRegex = /\#+.+?(hr\))/g;
    var milestoneRegex2 = /\#+.+?(m\))/g;
    var graphic = /^.*\b(a wireframe|a photoshop mockup)\b.*$/g;
    // var input = $('#textinput').val();
    var editor = ace.edit("editor");
    var input = editor.getValue();

    var test = input.match(milestoneRegex);
    var test2 = input.match(milestoneRegex2);
    var test3 = input.match(graphic);

    console.log(test3);

    var x = '';

    if (test) {
        for (var i = 0; i < test.length; i++) {
            // var removeTimeRegex = /(?:(?!\s\().)*/;

            x += test[i] + '<br>';

            // var match = test[i].match(removeTimeRegex);
            // console.log(match);
        }
    }

    if (test2) {
        for (var i = 0; i < test2.length; i++) {
            x += test2[i] + '<br>';
        }
    }

    $('.js-milestones').html(x);
}