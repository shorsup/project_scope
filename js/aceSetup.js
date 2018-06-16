$(document).ready(function() {
    var editor = ace.edit("editor");
    editor.session.setMode("ace/mode/markdown");
    editor.setTheme("ace/theme/chrome");
    editor.session.setUseWrapMode(true);
    editor.setShowPrintMargin(false);
 
    ace.config.loadModule('ace/ext/language_tools', function () {
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true
        })
    })

    editor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        exec: function(editor) {
            toggleSnippetMenu();
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });
});