$(document).ready(function() {
    calculateTotalHours();
    milestones();

    $("#textinput").bind('input propertychange', function() {
        calculateTotalHours();
        milestones();
      });
});

function calculateTotalHours() {
    // Text Area
    var input = $('#textinput').val();
    // Regex
    var min = /\*\*\(\d\dm\)\*\*/g;
    // **(30m)**
    // ! **(5m)** or **(100m)**
    var hr = /\*\*\(\d+hr\)\*\*/g;
    // **(1+hr)**
    var hrMin = /\*\*\(\d+hr\s\d\dm\)\*\*/g;
    // **(1+hr 30m)**
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

            console.log(matchesHr[i]);
        }
    }

    if (matchesMin) {
        for (var i = 0; i < matchesMin.length; i++) {
            var match = matchesMin[i].match(numbers);
            var int = parseInt(match);

            sum += int/60;

            console.log(matchesMin[i]);
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

            console.log(matchesHrMin[i]);
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
    var input = $('#textinput').val();
    var sum = calculateTotalHours();

    input.replace(totalHoursRegex, '**' + sum + ' hours**');
}

function milestones() {
    var milestoneRegex = /\#+.+?(hr\))/g;
    var milestoneRegex2 = /\#+.+?(m\))/g;
    var graphic = /^.*\b(a wireframe|a photoshop mockup)\b.*$/g;
    var input = $('#textinput').val();

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