/**
 *--------------------------------------------------------------------------
 *  _    _       _        _____ _ _            _  __   __
 * | |  | |     | |      / ____| (_)          | | \ \ / /
 * | |__| | ___ | | __ _| |    | |_  ___ _ __ | |_ \ V / 
 * |  __  |/ _ \| |/ _` | |    | | |/ _ \ '_ \| __| > <  
 * | |  | | (_) | | (_| | |____| | |  __/ | | | |_ / . \ 
 * |_|  |_|\___/|_|\__,_|\_____|_|_|\___|_| |_|\__/_/ \_\
 *--------------------------------------------------------------------------
 *
 * https://holaclientx.tech
 * https://github.com/HolaClient/X
 * https://discord.gg/CvqRH9TrYK
 * 
 * @author CR072 <crazymath072.tech>
 * @copyright 2022-2024 HolaClient
 * @version 1
 *
 *--------------------------------------------------------------------------
 * pterodactyl.js - So called wrapper module.
 *--------------------------------------------------------------------------
*/
const db = require('../handlers/database.js')
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
//servers
async function serversRefresh() {
    let pterodactyl = await db.get("pterodactyl", "settings")
    if (pterodactyl) {
        try {
            let a = 1;
            let b = 1;
            let c = [];
            while (a <= b) {
                let d = await fetch(`${pterodactyl.domain}/api/application/servers?per_page=100&page=${a}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${pterodactyl.app}`,
                    },
                });
                let e = await d.json();
                c.push(...e.data);
                b = e.meta.pagination.total_pages;
                a++;
            }
            await cacheDB.set("pterodactyl-servers", c);
            updateServers()
            return c
        } catch (error) {
            console.error(error)
            return
        }
    } else {
        return
    }
};
async function servers() {
    let a = await cacheDB.get("pterodactyl-servers")
    if (a) {
        return a
    } else {
        return await serversRefresh()
    }
}
//nodes
async function nodesRefresh() {
    let pterodactyl = await db.get("pterodactyl", "settings")
    if (pterodactyl) {
        try {
            let a = 1;
            let b = 1;
            let c = [];
            while (a <= b) {
                let d = await fetch(`${pterodactyl.domain}/api/application/nodes?include=allocations,location,servers&per_page=100&page=${a}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${pterodactyl.app}`,
                    },
                });
                let e = await d.json();
                let k = {}
                for (let i of e.data) {
                    k = i
                    let f = await fetch(`${pterodactyl.domain}/api/application/nodes/${i.attributes.id}/configuration`, {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${pterodactyl.app}`,
                        },
                    });
                    let g = await f.json()
                    let h = await fetch(`${i.attributes.scheme}://${i.attributes.fqdn}:${i.attributes.daemon_listen}/api/system`, {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${g.token}`,
                        },
                    });
                    let j = await h.json()
                    k.attributes["cpu"] = j
                }
                c.push(k);
                b = e.meta.pagination.total_pages;
                a++;
            }
            await cacheDB.set("pterodactyl-nodes", c);
            return c
        } catch (error) {
            console.error(error)
            return
        }
    } else {
        return
    }
}
async function nodes() {
    let a = await cacheDB.get("pterodactyl-nodes")
    if (a) {
        return a
    } else {
        return await nodesRefresh()
    }
}
//eggs
async function eggsRefresh() {
    let pterodactyl = await db.get("pterodactyl", "settings")
    if (pterodactyl) {
        try {
            let a = 1;
            let b = 1;
            let c = [];
            while (a <= b) {
                let d = await fetch(`${pterodactyl.domain}/api/application/nests?include=eggs&per_page=100&page=${a}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${pterodactyl.app}`,
                    },
                });
                let e = await d.json();
                for (let i of e.data) {
                    let f = await fetch(`${pterodactyl.domain}/api/application/nests/${i.attributes.id}/eggs?include=config,script,variables`, {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${pterodactyl.app}`,
                        },
                    });
                    let g = await f.json()
                    i.attributes.relationships.eggs = g
                    c.push(i)
                }
                b = e.meta.pagination.total_pages;
                a++;
            }
            await cacheDB.set("pterodactyl-eggs", c);
            return c
        } catch (error) {
            console.error(error)
            return
        }
    } else {
        return
    }
};
async function eggs() {
    let a = await cacheDB.get("pterodactyl-eggs")
    if (a) {
        return a
    } else {
        return await eggsRefresh()
    }
}
//misc
async function verify() {
    let a = true
    try {
        let pterodactyl = await db.get("pterodactyl", "settings")
        if (pterodactyl) {
            let b = await fetch(`${pterodactyl.domain}/api/application/locations`, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${pterodactyl.app}`,
                }
            });
            let c = await b.json()
            if (b.status !== 200) {
                a = false;
            }
            let d = await fetch(`${pterodactyl.domain}/api/client/permissions`, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${pterodactyl.acc}`,
                }
            });
            let e = await d.json()
            if (b.status !== 200) {
                a = false;
            }
        } else {
            a = false;
        }
        return a
    } catch (e) {
        console.error(e)
        return false
    }
}
async function refresh() {
    serversRefresh()
    nodesRefresh()
    eggsRefresh()
}
async function updateServers() {
    let a = await db.get("pterodactyl", "settings")
    let b = await servers()
    for (let i of b) {
        let c = await db.get("pterodactyl", "users") || []
        let d = c.find(j => j.id == i.attributes.user)
        if (!d) {
            const admins = await db.get("notifications", "admins") || [];
            admins.push({
                title: `Alert!`,
                message: `Server ${i.attributes.identifier} doesn't belong to any user registered in HolaClient-X.`,
                type: "alert",
                place: "cache-servers",
                date: Date.now()
            });
            await db.set("notifications", "admins", admins)
            return
        }
        let e = await db.get("servers", d.hc) || []
        e = e.filter(j => j.identifier !== i.attributes.identifier)
        i.attributes["queue"] = false
        e.push(i.attributes)
        await db.set("servers", d.hc, e)
    }
    return
}
refresh()
setInterval(() => {
    refresh()
}, 60000 * 5);
module.exports = {
    verify, refresh, servers, serversRefresh, nodes, nodesRefresh, eggs, eggsRefresh, updateServers
}
/**
 *--------------------------------------------------------------------------
 * End of file
 *--------------------------------------------------------------------------
*/