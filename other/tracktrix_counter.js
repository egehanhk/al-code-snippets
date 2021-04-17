const mtype = "ent";

const get_monster_count = (mtype) => {
    return new Promise((resolve) => {
        parent.socket.removeListener("tracker");
        parent.socket.once("tracker", function(data) {
            parent.smart_eval('socket.on("tracker", function(a) {tracker = a;render_tracker()})');
            resolve([data.monsters[mtype], data.monsters_diff[mtype]]);
        });
        parent.socket.emit("tracker");
    }) 
}

const monster_count = [];

setInterval(() => {
    get_monster_count(mtype).then(data => {
        monster_count.push(data);
        const a = monster_count[0];
        const b = monster_count[monster_count.length-1];
        const kill_diff = b[0]-a[0];
        const score_diff = kill_diff + b[1]-a[1];
        if (kill_diff !== 0) {
            parent.add_chat("score/kill", score_diff/kill_diff, "orange", Date.now());
        }
    });
}, 10000);