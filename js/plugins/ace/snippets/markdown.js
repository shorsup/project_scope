ace.define("ace/snippets/markdown",[], function(require, exports, module) {
"use strict";

exports.snippetText = "# Markdown\n\
\n\
# Includes octopress (http://octopress.org/) snippets\n\
\n\
snippet test\n\
	mitchell is the best person ever\n\
\n\
snippet n_ban\n\
	- The ${1:name} banner is set up as an advert and assigned to this advert group: ${2:home_group}\n\
\n\
snippet n_ban_m\n\
	- The ${1:name} banners are set up as adverts and assigned to two separate advert groups, one for desktop and one for mobile: ${1:desktop_group} and ${2:mobile_group}\n\
\n\
snippet n_stat_men\n\
	- This has been set up as a static menu which can be edited from the cPanel here: ${1:link}\n\
\n\
snippet n_ad\n\
	- This ${1:name} has been set up as an advert and assigned to the following advert group: ${2:advert_group}\n\
\n\
snippet n_ad_m\n\
	- These has been set up as adverts and assigned to the following advert group: ${1:advert_group}\n\
\n\
snippet n_ex_ad_m\n\
	- This example ${1:type} advert has been set up for the ${2:category name} category using the ad group ${3:advert_group}. The advert can be edited here: ${4:link}\n\
	- To set up the ad groups for the remaining ${5:example} categories use this naming convention - ${6:naming convention}. Once the ad groups have been set up you can then create and assign the relevant ${1:type} advert.\n\
\n\
snippet n_ad_cont\n\
	- This has been set up as an advert. You can edit the image, content and link here: ${1:link}\n\
\n\
snippet n_nav\n\
	- The main product navigation menu is automatically populated by your Product Category structure. This can be edited here: ${1:link}\n\
\n\
snippet n_cz\n\
	- This has been set up as a content zone and can be edited here: ${1:link}\n\
\n\
snippet n_ft_ad\n\
	- The products have been set up as Featured Product adverts and assigned to an advert group called: ${1:advert_group}\n\
\n\
snippet n_blg\n\
	- Blog thumbnails are automatically populated by your Blog Posts and are sorted by most recent posts.\n\
\n\
snippet n_cpf\n\
	- These have been set up as additional product fields and can be updated in the cpanel under the heading: ${1:heading} \n\
\n\
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