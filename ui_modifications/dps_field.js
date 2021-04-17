// Add dps to target window
function add_dps_gui() {
    if (parent.dps_gui_added) return;
    parent.dps_gui_added = true;

    const full_function_text = parent.render_monster.toString();
    
    // Search for the correct position to add dps
    let insert_index = 0;
    const search_sequence = ['name:"HP"', '});'];
    for (const to_search of search_sequence) {
        insert_index = full_function_text.indexOf(to_search, insert_index);
        
        if (insert_index === -1) {
            game_log(`ERROR: unable to find ${to_search} in parent.render_monster`, "red");
            return;
        }

        // Add the length of the search string to get index of next character
        insert_index += to_search.length;
    }

    // Add dps for monster
    const modified_function_text = full_function_text.slice(0, insert_index) +
    `if(!monster.hp_array){monster.hp_array=[]}
    const last_index=Math.floor(Date.now()/1000)%5;
    if(!monster.hp_array[last_index]||Date.now()-monster.hp_array[last_index].ms>2000){
	    let prev_entry;
	    if(monster.hp_array[last_index]){prev_entry=last_index}
	    else if(monster.hp_array[(last_index-1+5)%5]){prev_entry=(last_index-1+5)%5}
	    if(prev_entry!==undefined){monster.dps=to_pretty_num((monster.hp_array[prev_entry].hp-monster.hp)/(Date.now()-monster.hp_array[prev_entry].ms)*1000)}
	    monster.hp_array[last_index]={hp:monster.hp,ms:Date.now()};
    }` // Calculate DPS
    +
    'monster.dps&&(html+=info_line({name:"DPS",color:"#db890d",value:monster.dps}));' // DPS entry
    +
    full_function_text.slice(insert_index);

    // Eval the function string in parent scope
    parent.eval("this.render_monster = " + modified_function_text);
}