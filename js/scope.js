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
                console.log(scopeArray);
                calculateTotalHours(scopeArray);
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
        for(var key in object) {
            if(object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    function arrayIsEmpty(array) {
        for (i = 0; i < array.length; i++) {
            if (objectIsEmpty(array[i])) {
                return true;
            }
        }
        return false;
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
            var subBulletPattern = /^(?!\n)\s+-.*/gm;
            var commentPattern = /^((Coding|coding)|(Mockup|mockup|Wireframe|wireframe|Designs|designs|Design|design)).*/gm;

            if(h2Pattern.test(contents)) { 
                var validPattern = h2Pattern.exec(contents);
                var h2 = validPattern[2]; // Title
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

                if (commentMatch[2] !== undefined) type = 'coding';
                if (commentMatch[3] !== undefined) type = 'design';

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
                    },
                    comments: commentObject,
                    content: lineObject,
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
    console.log(scopeArray);
    
    calculateTotalHours(scopeArray);

    function calculateTotalHours(input) {
        console.log(input);
        console.log(arrayIsEmpty(input));
        if (arrayIsEmpty(input)) {
            return;
        }

        $('.js-segments').html('');

        var designTotal = 0;
        var codingTotal = 0;

        for (var i = 0; i < input.length; i++) {
            createSegment(input[i].hours.design, input[i].hours.coding, input[i].title);
            
            designTotal += input[i].hours.design;
            codingTotal += input[i].hours.coding;
        }
        createSegment(designTotal, codingTotal, 'Project');
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
    
    function createSegment(designSegment, codingSegment, segmentTitle) {
        var contents = $('.js-segments').html();
        let markup = '';
    
        const segment = [
            { title: 'Total', colour: 'purple', icon: 'clock-o', hours: designSegment + codingSegment},
            { title: 'Design', colour: 'blue', icon: 'pencil', hours: designSegment },
            { title: 'Coding', colour: 'yellow', icon: 'code', hours: codingSegment }
        ];
    
        function renderSegment(segment) {
            return segment.map(segment => segment.hours ? `
                <div class="menu-row">
                    <p><i class="fa fa-${segment.icon} circle-bg ${segment.colour} text-center pull-left"></i> ${segment.title}</p>
                    <p><span class="${segment.colour}-colour">Hours</span> <span class="pull-right">${segment.hours}</span></p>
                </div>
                <hr>
            ` : '').join('');
        }
    
        markup += `
            <div class="wrapper-segment">
                <h2 class="section-title">${segmentTitle}</h2>
                ${renderSegment(segment)}
            </div>
        `;
    
        $('.js-segments').html(contents + markup);
    }
});