
		function init_cy(elements){
			var off_opacity = 0.4;//opacity of nodes not related to clicked
			
			var cola = {name: 'cola'};

			var cy = cytoscape({
				container: document.getElementById('cy'),
				style: [
					{
						selector: 'node',
						style: {
							'content': 'data(description)',
							'background-color': 'red'
						}
					},
					{
						selector: 'edge',
						style: {
							'opacity': 0.4
						}
					}
				],
				elements: elements,
				layout: cola,
				// initial viewport state:
				zoom: 1,
				pan: { x: 0, y: 0 },

				// interaction options:
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

			//automove
			am_opts = {
				nodesMatching: function(node){ return node.descendants() },
				reposition: 'drag'
			};
			//cy.automove(am_opts);
		
			cy.ready(function(event){
				cy.on('grab', 'node', function(event) {
					var node = event.target;
					var rule = cy.automove(am_opts);
					rule.apply();
				});
				
				cy.on('tapstart', 'node', function(event){
					var node_target = event.target;					
					var node_id = node_target.data('id');
					
					var node_info = {//info for panel
						id: node_id,
						term: node_target.data('term'),
						desc: node_target.data('description'),
						children: new Array()
					}
					
					cy.batch(function(){
						cy.nodes()
							.filter(function(node){return node != node_target})
							.each(function(node){
								//node.style({opacity: off_opacity});
								node.style({display: 'none'});
						});
					});
					
					node_target.style({display: 'element', 'background-color': 'red'});
					
					node_target
						.connectedEdges()
						.each(function(edge){
							if(edge.target() != node_target){
								node_info.children.push({
									term: edge.target().data('term'),
									description: edge.target().data('description')
								});
							}							
							edge.target().style({display: 'element', 'background-color': 'red'})
						});
					
					cy.edges()
						.filter(function(edge){return edge.target() == node_target})
						.each(function(edge){
							edge.source().style({display: 'element', 'background-color': 'blue'});
							
							node_info.parent_term = edge.source().data('term');
							node_info.parent_desc = edge.source().data('description');
						});
					
					//cy.pan({x: node_target.position('x'), y: node_target.position('y')});
					cy.zoom({
						level: 1,
						position: node_target.position()
					});
					
					$('#reset').click(function(event){
						cy.nodes().each(function(node){ node.style({display: 'element', 'background-color': 'red'})});
						cy.zoom(1);

						cy.layout(cola).run();
					});

					populate_panel(node_info);
					panel_tree(node_info);
				})
				console.log('ready');
			});			

			return cy;
		}

		function subgraph(terms, root, num_gen){
			var elems = [{group: 'nodes', data: {id: root, label: terms[root].label, term: terms[root].term}}];
			
			terms.lastparent = root;
			return add_kids(terms, elems, root, num_gen);
		}

		function add_kids(terms, elems, parent, num_gen){
			
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
