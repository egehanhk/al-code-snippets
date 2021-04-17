function list_achievements() {
    if (!parent.tracker.max) {
        game_log("Please open the tracktrix once");
        return;
    }

    const kills = parent.tracker.max.monsters;

    const achievements = {};

    for (const mtype in kills) {
        if (!(mtype in G.monsters) || !G.monsters[mtype].achievements) continue;

        const kill_count = kills[mtype][0];

        for (const achievement of G.monsters[mtype].achievements) {
            const needed = achievement[0];
            const type = achievement[1];
            const reward = achievement[2];
            const amount = achievement[3];
            if (kill_count < needed) break;

            if (type !== "stat") continue;

            if (!achievements[reward]) achievements[reward] = 0;
            achievements[reward] += amount;
        }
    }

    return achievements;
}

show_json(list_achievements());