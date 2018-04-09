$(document).ready(function() {
    var editor = ace.edit("editor");
    editor.session.setMode("ace/mode/markdown");
    editor.setTheme("ace/theme/solarized_dark");
    editor.session.setUseWrapMode(true);
 
    ace.config.loadModule('ace/ext/language_tools', function () {
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            setUseWrapMode: true
        })
    })

    editor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        exec: function(editor) {
            editor.insert("Something cool");
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });
});