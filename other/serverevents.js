// To connect to servers and read event data
class ServerEvents {
    constructor(include_pvp = false) {
        this.servers = {};

        this.include_pvp = include_pvp;

        this.request_servers();

        this.init_time = new Date();
    }

    request_servers() {
        parent.api_call("get_servers", {}, {
            callback: this.read_servers.bind(this)
        });
    }

    read_servers(response) {
        if (response && response[0]) {
            this.servers = {};
            for (const i in response[0].message) {
                const server_data = response[0].message[i];

                if (server_data.gameplay === "normal") {
                    if (!this.include_pvp && server_data.pvp) continue;

                    const server = {
                        region: server_data.region,
                        id: server_data.name,
                        name: server_data.region + server_data.name,
                        ip: server_data.ip,
                        port: server_data.port,
                        rewrite: "/in/" + server_data.region + "/" + server_data.name + "/",
                        socket: new ServerEventSocket(server_data.region + server_data.name, server_data.ip, server_data.port)
                    };

                    this.servers[server.name] = server;
                }
            }
        }
    }

    get_current_server_name() {
        return parent.server_region + parent.server_identifier;
    }

    // Returns an array of mobs sorted by time to spawn or hp/max_hp if already spawned
    // Options includes mtypes (array), max_spawn_time (max time till mob spawns in ms)
    get_mobs(options = {}) {
        this.last_mobs_list = [];
        if (!options.max_spawn_time) options.max_spawn_time = 0;
        if (!options.mtypes) options.mtypes = Object.keys(G.monsters);

        for (const server_name in this.servers) {
            // Check server filter
            if (options.servers && !options.servers.includes(server_name)) continue;

            const socket = this.servers[server_name].socket;
            const event_mobs = socket.event_mobs;

            if (event_mobs) {
                for (const mtype in event_mobs) {
                    const mob = event_mobs[mtype];

                    if (!options.mtypes.includes(mtype)) continue;

                    mob.mtype = mtype;
                    mob.server = server_name;

                    if (mob.updated_at) {
                        mob.stale_time_ms = new Date() - mob.updated_at;
                    }

                    // Use live data if mob is on this server and nearby
                    if (mob.server === this.get_current_server_name()) {
                        const mobs = Object.values(parent.entities).filter(e => e.mtype === mtype);
                        if (mobs.length > 0) {
                            mob.hp = mobs[0].hp; // Just use the first mob, might have to change if more than one mobs is live0
                        }
                    }

                    if (mob.live || new Date(mob.spawn) - new Date() < options.max_spawn_time) {
                        this.last_mobs_list.push(mob);
                    }
                }
            }
        }

        this.last_mobs_list.sort((a,b) => {
            const get_value = (mob) => {
                if (mob.live) return mob.hp / mob.max_hp;
                return new Date(mob.spawn) - new Date(); // ms till spawn
            }
            return get_value(a) - get_value(b);
        });

        return this.last_mobs_list;
    }

    // Change server to a server_name
    change_server(server_name) {
        if (!this.servers[server_name]) return;
        change_server(this.servers[server_name].region, this.servers[server_name].id);
    }
}

// Open socket to a specific server
class ServerEventSocket {
    constructor(server_name, ip, port) {
        this.server_name = server_name;
        this.ip = ip;
        this.port = port;

        this.socket = undefined;
        this.event_mobs = {};

        this.last_piped_at = new Date();

        this.init_socket();
    }

    init_socket() {
        if (this.socket) {
            if (!this.socket_welcomed) {
                game_log("Another server connection in progress. Please wait.", "gray");
                return;
            }
            this.socket.destroy();
        }
        this.socket = parent.io(`wss://${this.ip}:${this.port}`, {
            secure: true,
            transports: ["websocket"]
        });

        game_log(`socket connection to ${this.server_name}.`, "gray");
        this.socket_ready = false;
        this.socket_welcomed = false;

        this.socket.emit = function (packet) {
            // console.log(packet);
        };

        this.socket.onevent = this.update_event_mobs.bind(this);

        this.socket.on("welcome", function (data) {
            console.log("welcomed!!", data.S);
            this.socket_welcomed = true;
        });
    }

    update_event_mobs(packet) {
        if (packet && packet.data) {
            const data = packet.data;
            if (Array.isArray(data) && data.some(i => i === 'server_info')) { // server_info
                this.event_mobs = data[1];
                this.last_piped_at = new Date();
                for (const key in this.event_mobs) {
                    if (!(key in G.monsters)) continue; // Skip non-monster entries
                    const mob = this.event_mobs[key];
                    mob.updated_at = this.last_piped_at;
                }
            }
        }
    }

    get_event_mobs() {
        if (this.last_piped_at - new Date() > 30 * 1000) {
            this.event_mobs = undefined;
            console.log(`No data for awhile..${this.server_name}`);
        }
        return this.event_mobs;
    }
}

window.se = new ServerEvents();

setTimeout(() => {
    if (ssince(window.se.init_time) < 30) return; // Give ServerEvents a few seconds to gather all spawn data (optional)
    const options = {
        mtypes: ["franky"],
        /*max_spawn_time: 60*1000 // 60 seconds, if you also want mobs that are about to spawn*/
    }
    const targeted_franky = window.se.get_mobs(options).filter(e => e.target);

    show_json(targeted_franky);
    if (targeted_franky[0]) {
        game_log("Jumping to franky server in 10 seconds", "orange");
        setTimeout(()=>{
            window.se.change_server(targeted_franky[0].server);
        }, 10000);
    }
}, 5000);