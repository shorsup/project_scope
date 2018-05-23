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
    // var min = /\*\*\(\d\dm\)\*\*/g;
    
    // Hours Only
    var hr = /<!--.\d+(hr|hrs|hour|hours).-->/g; 
    // var hr = /\*\*\(\d+hr\)\*\*/g;
    
    // Hours & Minutes
    var hrMin = /<!--.\d+(hr|hrs|hour|hours)\s\d+(m|min|mins|minutes)-->/g;
    // var hrMin = /\*\*\(\d+hr\s\d\dm\)\*\*/g;

    // Numbers
    var numbers = /\d+/g;

    // Number Formats
    var matchesHr = input.match(hr);
    var matchesMin = input.match(min);
    var matchesHrMin = input.match(hrMin);
    // Hour Totals
    var sum = 0;
    var total = 0;

    if (matchesHr) {
        for (var i = 0; i < matchesHr.length; i++) {
            var match = matchesHr[i].match(numbers);
            var int = parseInt(match);

            sum += int;

            console.log("Hours: " + matchesHr[i]);
        }
    }

    if (matchesMin) {
        for (var i = 0; i < matchesMin.length; i++) {
            var match = matchesMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;

            console.log("Minutes: " + matchesMin[i]);
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

            console.log("Hours, Minutes: " + matchesHrMin[i]);
        }
    }

    // console.log(sum);
    var price = sum * 160;
    $('.js-hours-total').text(sum);
    $('.js-price-total').text(price);
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