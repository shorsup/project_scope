$(document).ready(function() {
    var editor = ace.edit("editor");
    editor.session.setMode("ace/mode/markdown");
    editor.setTheme("ace/theme/chrome");
    editor.session.setUseWrapMode(true);
    editor.setShowPrintMargin(false);
 
    ace.config.loadModule('ace/ext/language_tools', function () {
        editor.setOptions({
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false
        })
    })
});

$(document).ready(function() {
    var notesEditor = ace.edit("notesEditor");
    notesEditor.session.setMode("ace/mode/markdown");
    notesEditor.setTheme("ace/theme/dracula");
    notesEditor.session.setUseWrapMode(true);
    notesEditor.setShowPrintMargin(false);
 
    ace.config.loadModule('ace/ext/language_tools', function () {
        notesEditor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true
        })
    })

    notesEditor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        exec: function(editor) {
            toggleSnippetMenu();
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });
});