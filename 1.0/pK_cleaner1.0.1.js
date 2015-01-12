"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.get_handler || !popKorn.check_includes || !popKorn.get_script_nodes)
	throw new Error('popKorn core object is not correct.');

(function(){
	window.func = popKorn.get_handler();
	var bug = popKorn.check_includes()
	window.nodes = popKorn.get_script_nodes()
	delete popKorn.cook;
	delete popKorn.include_more;
	delete popKorn.add_module;
	delete popKorn.get_modules;
	delete popKorn.wrap_handler;
	delete popKorn.get_handler;
	delete popKorn.check_includes;
	delete popKorn.get_script_nodes;
	for (var i=0; i < nodes.length; i++)
		nodes[i].parentNode.removeChild(nodes[i]);
	delete window.nodes;
	delete window.popKorn;
	if (!bug) func();
	delete window.func;
	window.global_methods_names_list.delete_me = function() {
		if (0 === window.global_methods_names_list.save_it_for_me) {
			for (var i=0; i < window.global_methods_names_list.length; i++)
				delete window[window.global_methods_names_list[i]];
			delete window.global_methods_names_list.delete_me;
			delete window.global_methods_names_list.save_it_for_me;
			delete window.global_methods_names_list;
		} else {
			window.global_methods_names_list.save_it_for_me--;
		}
	};
	window.global_methods_names_list.delete_me();
	if (bug) throw bug;
})();