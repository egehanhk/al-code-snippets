window.kill_count = {};
window.start_time = new Date();

game.on("death", (data) => {
    if (parent.entities[data.id] && parent.entities[data.id].mtype) {
        const mtype = parent.entities[data.id].mtype;
        if (!window.kill_count[mtype]) window.kill_count[mtype] = 0;
        window.kill_count[mtype]++;
    }
});

setInterval(() => {
    const elapsed_time = hsince(window.start_time); // hours since start
    for (const mtype in window.kill_count) {
        const kill_count = window.kill_count[mtype];
        const kph = kill_count / elapsed_time;
        game_log(mtype + " per hour: " + kph.toFixed(2), "orange");
    }
}, 10000);