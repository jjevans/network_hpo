
function populate_panel(data){
	var id = data.id;
	var term = data.term;
	var desc = data.description;
	var parent_term = data.parent_term;
	var parent_desc = data.parent_desc;

	$('#term').val(term);
	$('#parent').val(parent_term);
	$('#desc').val(desc);
	
	return;
}