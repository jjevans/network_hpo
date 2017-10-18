		var node_color = "red";
		var highlight_color = "blue";
		var edge_opacity = 0.4;//opacity of edges
		var node_bg_opacity = 0.4;//opacity of nodes not related to clicked
		var node_fg_opacity = 1;//nodes related to clicked
		var fg_class = "foreground";
		var lbl_fld_bg = "term";
		var lbl_init = "data("+lbl_fld_bg+")";//id, term, description, label fields for node label
		var lbl_fld_fg = "description";
		var dbltap_timelen = 300;//time needed between click to call them doubleclick
		var nodes_to_fit;

		var cola_layout = {
			name: 'cola',
			randomize: false,
			avoidOverlap: true,
			nodeDimensionsIncludeLabels: false,
			handleDisconnected: true,
			fit: false
			//fit: true,
			//nodeSpacing: function( node ){ return 2; },
			/*ready: function(){
				cy.fit();
			},
			stop: function(){
				cy.fit();
			}*/
		};

		function init_cy(elements){

			var cy = cytoscape({
				container: document.getElementById('cy'),
				style: [
					{
						selector: 'node',
						style: {
							'content': lbl_init,
							//'content': 'data(id)',
							'background-color': node_color
						}
					},
					{
						selector: 'edge',
						style: {
							'opacity': edge_opacity
						}
					}],
				elements: elements,
				layout: cola_layout,
				zoom: 1,
				pan: { x: 0, y: 0 },

				minZoom: 1e-50,
				maxZoom: 1e50,
				zoomingEnabled: true,
				userZoomingEnabled: true,
				panningEnabled: true,
				userPanningEnabled: true,
				boxSelectionEnabled: false,
				selectionType: 'single',
				touchTapThreshold: 8,
				desktopTapThreshold: 4,
				autolock: false,
				autoungrabify: false,
				autounselectify: false,
				wheelSensitivity: 1
			});	



			cy.ready(function(event){
				/*cy.on('grab', 'node', function(event) {
					var node = event.target;
					var rule = cy.automove(am_opts);
					rule.apply();
				});*/
				var tappedBefore;
				var tappedTimeout;
	
				cy.on('tapstart', 'node', function(event){
					var node_target = event.target;
					var node_id = node_target.data('id');
					
					var node_info = {//info for panel
						id: node_id,
						term: node_target.data('term'),
						desc: node_target.data('description'),
						children: new Array()
					}
				
					//ondoubleclick, stackoverflow
					var tappedNow = event.cyTarget;
					if(tappedTimeout && tappedBefore){
					    clearTimeout(tappedTimeout);
					}
					if(tappedBefore === tappedNow){
						event.node = node_info;
						process_cy(event);
						tappedBefore = null;
					}
					else{
						tappedTimeout = setTimeout(function(){ tappedBefore = null; }, dbltap_timelen);
						tappedBefore = tappedNow;
					}

					$('#reset').click(function(event){
						cy.$('.'+fg_class).removeClass(fg_class);
						//cy.nodes().each(function(node){ node.style({display: 'element', 'background-color': node_color})});
						cy.nodes().each(function(node){ node.style({label: node.data(lbl_fld_bg), opacity: node_fg_opacity, 'background-color': node_color}) });
						cy.zoom(1);

						cy.layout(cola_layout).run();
					});
					
					populate_panel(node_info);
					panel_tree(node_info);
				});
				
				console.log('ready');
			});

			return cy;
		}

		function process_cy(event){
			var node_target = event.target;
			var node_info = event.node;
			////var node_pos_x = new Array();//all node pos for zoom, pan
			////var node_pos_y = new Array();
			nodes_to_fit = new Array();
	
			cy.batch(function(){
				cy.nodes()
				.filter(function(node){return node != node_target})
				.each(function(d){
					d.style({label: d.data(lbl_fld_bg), opacity: node_bg_opacity, 'background-color': node_color});
					d.removeClass(fg_class);

					//node.style({display: 'none'});
				});
			});

			//node_target.style({label: node.data(lbl_fld_fg), opacity: node_fg_opacity, 'background-color': node_color});
			node_target.addClass(fg_class);
			//node_target.style({display: 'element', 'background-color': node_color});
			////node_pos_x.push(node.target.position('x'));
			////node_pos_y.push(node.target.position('y'));
			nodes_to_fit.push(node_target);

			node_target
			.connectedEdges()
				.each(function(edge){
					if(edge.target() != node_target){
						node_info.children.push({
						term: edge.target().data('term'),
						description: edge.target().data('description')});
					}
					edge.target().style({'background-color': node_color});
					edge.target().addClass(fg_class);
					//edge.target().style({display: 'element', 'background-color': node_color})

					////node_pos_x.push(edge.target().position('x'));
					////node_pos_y.push(edge.target().position('y'));
					nodes_to_fit.push(edge.target());
				});
					
			cy.edges()
				.filter(function(edge){return edge.target() == node_target})
				.each(function(edge){
					edge.source().style({'background-color': highlight_color});
					//edge.source().style({opacity: node_fg_opacity, 'background-color': highlight_color});
					//edge.source().style({display: 'element', 'background-color': highlight_color});
					edge.source().addClass(fg_class);
					node_info.parent_term = edge.source().data('term');
					node_info.parent_desc = edge.source().data('description');
				});
	
			//pan to center of displayed nodes
			////var node_pos_tmp = node_pos_x.sort();
			////var leftmost = node_pos_tmp[0];
			////var rightmost = node_pos_tmp[-1];
			////var pan_avg_x = Math.abs(rightmost-leftmost);
			
			////node_pos_tmp = node_pos_y.sort();
			////var upper = node_pos_tmp[0];
			////var lower = node_pos_tmp[-1];
			////var pan_avg_y = Math.abs(upper-lower);
			////cy.pan({x: pan_avg_x, y: pan_avg_y});
			
			//cy.fit(nodes_to_fit, 0);
			//cy.pan({x: node_target.position('x'), y: node_target.position('y')});
//			cy.zoom({
//				level: 1,
//				position: node_target.position()
//			});
		
			//change label from hpo term to description
			//cy.$('.'+fg_class).each(function(node){
			//	node.style({label: node.data('description')});
			//});
			
			cy.$('.'+fg_class).each(function(d){
				d.style({label: d.data(lbl_fld_fg), opacity: node_fg_opacity});
			});
			
			cola_layout.nodeDimensionsIncludeLabels = true;
			cy.layout(cola_layout).run();
			cola_layout.nodeDimensionsIncludeLabels = false;//set back			
		}

		function subgraph(terms, root, num_gen){
			var elems = [{group: 'nodes', data: {id: root, label: terms[root].label, term: terms[root].term}}];
			
			terms.lastparent = root;
			return add_kids(terms, elems, root, num_gen);
		}

		function add_kids(terms, elems, parent, num_gen){
			console.log('node: '+parent);
	
			terms[parent].children.forEach(function(kid){
				node = {group: 'nodes', data: {id: kid, term: terms[kid].term, label: terms[kid].label, description: terms[kid].description, classes: parent}};
				edge = {group: 'edges', data: {source: parent, target: kid}};
				elems.push(node, edge);
	
				if(typeof num_gen === 'undefined' || (typeof num_gen === 'number' && num_gen > 0)){
					if(typeof num_gen === 'number'){
						num_gen--;
					}
					elems = add_kids(terms, elems, kid, num_gen);
				}
			});
			//return {nodes: nodes, edges: edges};
			
			return elems;
		}
