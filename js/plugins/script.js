function run() {
    var editor = ace.edit("editor");
    var input = editor.getValue();
    target = document.getElementById('targetDiv'),
    converter = new showdown.Converter(),
    converter.setOption('simplifiedAutoLink', true),
    converter.setOption('openLinksInNewWindow', true),
    converter.setOption('emoji', true),
    html = converter.makeHtml(input);
    
    target.innerHTML = html;
}