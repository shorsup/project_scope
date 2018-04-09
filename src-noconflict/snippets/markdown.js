ace.define("ace/snippets/markdown",[], function(require, exports, module) {
"use strict";

exports.snippetText = "# Markdown\n\
\n\
# Includes octopress (http://octopress.org/) snippets\n\
\n\
snippet test\n\
	mitchell is the best person ever\n\
\n\
snippet ticker\n\
	- A 'sales ticker', which shows a popup for recent sales in the bottom left of the screen. This shows users that your site is putting through regular business, and so creates confidence. **(1hr)**\n\
\n\
snippet a new link\n\
	- A 'New' link, which takes you to a page that shows products sorted by arrival date. This is good for users who want to see which new products you have to offer. **(30m)**\n\
\n\
# The quote should appear only once in the text. It is inherently part of it.\n\
# See http://octopress.org/docs/plugins/pullquote/ for more info.\n\
\n\
snippet pullquote\n\
	{% pullquote %}\n\
	${1:text} {\" ${2:quote} \"} ${3:text}\n\
	{% endpullquote %}\n\
";
exports.scope = "markdown";

});
                (function() {
                    ace.require(["ace/snippets/markdown"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            