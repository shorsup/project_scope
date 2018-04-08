$(document).ready(function() {
    calculateTotalHours();

    $("#textinput").bind('input propertychange', function() {
        calculateTotalHours();
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
}