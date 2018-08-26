$(document).ready(function() {
    runEditors();

    if (localStorage.getItem("markdownStorage") != null && localStorage.getItem("notesStorage") != null) {
        loadEditors();
    }

    $('.js-toggle-rt, .js-toggle-md, .js-toggle-fn').on('click', function() {
        mode.set(this);
    });

    $('.js-errors').click(function() {
        $('.wrapper-errors').toggle();
    });

    $('#scopeType').on('change', function() {
        if ($(this).val() === 'Premium Theme') {
            $('#themeName').show();
        } else {
            $('#themeName').hide();
        }
    });

    $('#js-create-btn').click(function() {
        var company = $('#companyName').val().replace(/\s+/g, '');

        let scopeBase = {
            case: $('#caseNumber').val(),
            company: company,
            type: $('#scopeType').val(),
            theme:  $('#themeName').val(),
            version: $('#scopeVersion').val(),
            website: $('#companyWebsite').val()
        }

        let fileName = `${scopeBase.company}-ProjectScope-${scopeBase.version}.md`;

        console.log(scopeBase);
        console.log(fileName);
    });

    $('.js-colour').click(function() {
        var colour = $('#fn-2').val();
        $('#targetDiv h1').css('background-color', colour);
        $('#targetDiv h2, #targetDiv h3').css('border-color', colour);
    });

    $('.js-times-toggle, .js-style, .js-comment, .js-create-scope').on('click', function() {
        if(!$(this).hasClass('mode-active')){
            if($(this).hasClass('js-times-toggle')){
                const segmentArray = ace.edit('editor').getValue().split('---');
                var scopeArray = createScope(segmentArray);

                calculateTotalHours(scopeArray);
                calculateMilestones(scopeArray);
            }
            menuItem.set(this);
            $(this).addClass('mode-active');
        } else {
            menuItem.clear();
            $(this).removeClass('mode-active');
        }
    });

    setInterval(runMarkdown, 5000);
    setInterval(runFeatureNotes, 5000);

    ace.edit('editor').getSession().on('change', function(e) {
        setTimeout(saveEditor('editor'), 4000);
    });

    ace.edit('notesEditor').getSession().on('change', function() {
        setTimeout(saveEditor('notesEditor'), 4000);
    });

    const editorValue = ace.edit('editor').getValue();
    const segmentArray = editorValue.split('---');

    function objectIsEmpty(object) {
        return Object.keys(object).length > 0;
    }

    function returnTime(input) {
        var hourRegexOb = /(((\d+)(hr|hrs|hour|hours)\b)\s+((\d+)(m|min|mins|minutes)\b))|((\d+)(\s+|)(m|min|mins|minutes)\b)|((\d+)(\s+|)(hr|hrs|hour|hours)\b)|((\d+\.\d+)(hr|hrs|hour|hours))/gm;
        var myArray;
        var result = 0;

        while ((myArray = hourRegexOb.exec(input)) !== null) {
            if (myArray[3] && myArray[6]) result += parseInt(myArray[3]) + myArray[6]/60; // hr 3, min 6
            if (myArray[13]) result += parseInt(myArray[13]); // hours 13
            if (myArray[9]) result += myArray[9]/60; // minutes 9
            if (myArray[17]) result = parseFloat(myArray[17]); // decimal 17

            return result;
        }
        return result;
    }

    function totalHours(input) {
        var total = 0;
        var coding = 0;
        var design = 0;

        for (i = 0; i < input.length > 0; i++) {
            if (input[i].hours !== undefined) total += input[i].hours;
            if (input[i].type === 'coding') coding += input[i].hours;
            if (input[i].type === 'design') design += input[i].hours;
        }

        return ({
            coding: coding,
            design: design,
            total: total
        });
    }

    function createScope(segmentArray) {
        scope = segmentArray.map(function(contents) {
            var h2Pattern = new RegExp(/^#{2}\s+((.*)(\s+|\s+`)(\(.*\)))/, 'm');
            var bulletPattern = /^-\s.*/gm;
            var subBulletPattern = /^(\s{2}|\s{4}|\t{1})\-.*/gm;
            var commentPattern = /^((Coding|coding)|(Mockup|mockup|Wireframe|wireframe|Designs|designs|Design|design)|(<!--(\s+|)((Coding|coding)|(Mockup|mockup)).*-->)).*/gm;

            if(h2Pattern.test(contents)) {
                var validPattern = h2Pattern.exec(contents);
                var h2 = validPattern[2]; // Title
            }

            // Creating Sub-Bullet Object
            var subBulletMatch = contents.match(subBulletPattern);
            let subBulletObject = {};

            if (subBulletMatch != null) {
                // console.log(subBulletMatch);
                subBulletObject = subBulletMatch.map(function(item) {
                    return ({
                        line: item,
                        hours: returnTime(item),
                        type: 'sub-bullet'
                    });
                });
            }

            // Creating Line Object
            var lineMatch = contents.match(bulletPattern);
            if (lineMatch === null) return {};

            let lineObject = lineMatch.map(function(item) {
                return ({
                    line: item,
                    hours: returnTime(item),
                    type: 'coding'
                });
            });

            // Creating Comment Object
            var commentObject = [];
            var commentMatch;

            while ((commentMatch = commentPattern.exec(contents)) !== null) {
                var type  = '';

                if (commentMatch[2] !== undefined || commentMatch[7] !== undefined) type = 'coding';
                if (commentMatch[3] !== undefined || commentMatch[8] !== undefined ) type = 'design';

                commentObject.push({
                    line: commentMatch[0],
                    hours: returnTime(commentMatch),
                    type: type
                });

                var type  = '';
            }

            // Segment Output
            if (h2 !== undefined) {
                return {
                    title: h2,
                    hours: {
                        coding: totalHours(commentObject).coding + totalHours(lineObject).coding,
                        design: totalHours(commentObject).design + totalHours(lineObject).design,
                        total: totalHours(commentObject).total + totalHours(lineObject).total,
                        errors: totalHours(subBulletObject)
                    },
                    comments: commentObject,
                    content: lineObject,
                    errors: subBulletObject
                };
            }
        });
        // Removes segments without titles
        for (var i = scope.length - 1; i >= 0; i--) {
            if (scope[i] === undefined) scope.splice(i, 1);
        }
        return scope;
    }

    let scopeArray = createScope(segmentArray);

    calculateTotalHours(scopeArray);
    calculateMilestones(scopeArray);

    function testFilter(input) {
        return Object.keys(input).length > 0;
    }

    function calculateMilestones(scopeArray) {
        var inputArray = scopeArray.filter(testFilter);
        var x = [];
        var output = [];
        var titleCounter = 1;
        var mainCounter = 1;

        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i].hours.design > 0) {
                output.push({
                    name: inputArray[i].title + ' Mockup',
                    hours: inputArray[i].hours.design
                });

                if (inputArray[i].title === 'Home Page') {
                    x.push(`- ${titleCounter}.1 - ${inputArray[i].title} Design Deliverable (week ____)`);
                    titleCounter++;
                } else {
                    x.push(`- ${titleCounter}.${mainCounter} - ${inputArray[i].title} Design Deliverable (week ____)`);
                    mainCounter++;
                }
            }
        }
        console.log(x, output);
    }

    function calculateTotalHours(input) {
        var inputArray = input.filter(testFilter);
        console.log(inputArray);

        $('.js-segments').html('');

        var designTotal = 0;
        var codingTotal = 0;
        var errorTotal = 0;
        var homepageCodingTotal = 0;

        for (var i = 0; i < inputArray.length; i++) {
            createSegment(inputArray[i].hours.design, inputArray[i].hours.coding, inputArray[i].title, inputArray[i].hours.errors.total);

            designTotal += inputArray[i].hours.design;
            codingTotal += inputArray[i].hours.coding;
            errorTotal += inputArray[i].hours.errors.total;

            if (inputArray[i].title === 'General' || inputArray[i].title === 'Aesthetic' || inputArray[i].title === 'Header' || inputArray[i].title === 'Home Page' || inputArray[i].title === 'Footer' || inputArray[i].title === 'Product Thumbnails') {
                homepageCodingTotal += inputArray[i].hours.coding;
            }

        }
        createFooter(homepageCodingTotal);
        createSegment(designTotal, codingTotal, 'Project', errorTotal);
    }

    function saveEditor(scope) {
        console.log('save');

        var editor = ace.edit(scope).getValue();

        if (scope === 'editor') {
            localStorage.setItem("markdownStorage", editor);
        } else {
            localStorage.setItem("notesStorage", editor);
        }
    }

    function loadEditors() {
        if (typeof(Storage) !== "undefined") {
            var markdownEditor = ace.edit('editor');
            var notesEditor = ace.edit('notesEditor');

            // Retrieve
            markdownEditor.setValue(localStorage.getItem("markdownStorage"));
            notesEditor.setValue(localStorage.getItem("notesStorage"));

            runEditors();
        }
    }

    function runEditors() {
        runMarkdown();
        runFeatureNotes();
    }

    const menuItem = {
        clear() {
            $('.sidebar-icon').each(function() {
                $(this).removeClass('mode-active');
            });

            $('.icon-menu').hide();
            $('.icon-menu').removeClass('col col-sm-2');
            $('.ace_editor').removeClass('left-spacing');
            ace.edit('editor').resize();

        },
        set(item) {
            this.clear();

            var iconMenu = ($(item).data('icon-menu'));
            $(iconMenu).addClass('col col-sm-2');
            $(iconMenu).show();
            $('.ace_editor').addClass('left-spacing');
            ace.edit('editor').resize();
        }
    }

    const mode = {
        clear() {
            $('.wrapper-menu .menu .menu-btn').each(function() {
                $(this).find('.fa').removeClass('active');
                $('.editor, .sidebar, .sidebar-menu').hide();
                $('.editor').removeClass('d-sm-block');
                ace.edit('editor').clearSelection();
                ace.edit('notesEditor').clearSelection();
            });
            menuItem.clear();
        },
        set(mode) {
            this.clear();
            runEditors();

            var editor = ($(mode).data('editor'));
            var preview = ($(mode).data('preview'));
            var sidebar = ($(mode).data('sidebar'));

            $(mode).find('.fa').addClass('active');
            $(editor).show();
            $(sidebar).show();
            $(preview).toggleClass('d-none d-sm-block');
            $(preview).show();

            ace.edit('editor').clearSelection();
            ace.edit('notesEditor').clearSelection();
        }
    }

    mode.set('.js-toggle-md');

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    function createSegment(designSegment, codingSegment, segmentTitle, errorSegment) {
        var contents = $('.js-segments').html();
        let markup = '';

        const segment = [
            { title: 'Design', colour: 'blue', icon: 'pencil', hours: designSegment },
            { title: 'Coding', colour: 'yellow', icon: 'code', hours: codingSegment },
            { title: 'Total', colour: 'purple', icon: 'clock-o', hours: designSegment + codingSegment},
            { title: 'Errors', colour: 'pink', icon: 'error', hours: errorSegment }
        ];

        function renderCost(hours) {
            return `
            <div class="menu-row mb-2">
                <p><span class="green-colour">Cost</span> <span class="pull-right">$${hours * 160}</span></p>
            </div>`;
        }

        function renderSegment(segment) {
            return segment.map(segment => segment.hours ? `
                <div class="menu-row mb-2">
                    <p><span class="${segment.colour}-colour">${segment.title}</span> <span class="pull-right">${segment.hours}</span></p>
                </div>
                ${segmentTitle === 'Project' && segment.title === 'Total' ? renderCost(segment.hours) : ''}
            ` : '').join('');
        }

        markup += `
            <div class="wrapper-segment mb-4">
                <h2 class="section-title">${segmentTitle}</h2>
                ${renderSegment(segment)}
            </div>
        `;

        $('.js-segments').html(contents + markup);
    }

    function createFooter(hours) {
        var contents = $('.js-footer').html();
        var output = '';

        output = `
        <div class="wrapper-segment mb-4">
            <h2 class="section-title">Tasks</h2>
            <div class="menu-row mb-2">
                <p><span class="yellow-colour">Home Page</span> <span class="pull-right">${hours}</span></p>
            </div>
        </div>
        `;

        $('.js-footer').html(output);
    }
});