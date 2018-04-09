function run() {
    var editor = ace.edit("editor");
    var input = editor.getValue();
    // var text = document.getElementById('textinput').value,
    target = document.getElementById('targetDiv'),
    converter = new showdown.Converter(),
    html = converter.makeHtml(input);
    
    target.innerHTML = html;
}