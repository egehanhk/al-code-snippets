// Puts an item on first available trade and removed it shortly after
async function put_on_trade(index, q) {
    // Find available trade slot
    const trade_slot = Object.keys(character.slots).find(e => e.includes("trade") && character.slots[e] === null);

    if (!trade_slot) throw "no empty trade slots";

    parent.socket.emit("equip", {
        q: q,
        slot: trade_slot,
        num: index,
        price: 99999999999
    });


    // Wait for items to be put in trade slot
    let count = 0;
    while (character.slots[trade_slot] === null) {
        if (count++ > 100) {
            throw "unknown error";
        }

        // wait 100 ms
        await new Promise((resolve)=>setTimeout(resolve,100));
    }

    unequip(trade_slot);

    // Wait for items to be removed from trade slot
    count = 0;
    while (character.slots[trade_slot] !== null) {
        if (count++ > 100) {
            throw "unknown error";
        }

        // wait 100 ms
        await new Promise((resolve)=>setTimeout(resolve,100));
    }

    return;
}

async function fill_stacks() {
    // Find stackables in inventory
    const stackables = {};
    for (const i in character.items) {
        const item = character.items[i];
        if (item && G.items[item.name].s && item.q < G.items[item.name].s) {
            if (!(item.name in stackables)) stackables[item.name] = [];
            stackables[item.name].push({index: i, q: item.q});
        }
    }
    console.log(stackables);

    // Work through stackables to fill all stacks
    for (const name in stackables) {
        const entries = stackables[name];

        const max_stack = G.items[name].s;

        let last_entry = entries[entries.length-1];

        for (let i = 0; i < entries.length; i++) {
            const item = entries[i];
            if (item.index === last_entry.index) break;
            if (item.q < max_stack) {
                const missing = max_stack - item.q;

                const q = Math.min(missing, last_entry.q);
                
                await put_on_trade(last_entry.index, q);
                await new Promise((resolve)=>setTimeout(resolve,100));
                
                // Update last_entry and current item
                item.q += q;
                last_entry.q -= q;

                // Handle last entry becoming empty
                if (last_entry.q <= 0) {
                    entries.pop();
                    last_entry = entries[entries.length-1];
                    i--; // To make sure the current item is fully filled
                }
            }
        }
    }
}

fill_stacks();