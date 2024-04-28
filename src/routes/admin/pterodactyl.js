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
 * pterodactyl.js - Pterodactyl settings handler.
 *--------------------------------------------------------------------------
*/
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
module.exports = async function () {
    const pterodactyl = await db.get("pterodactyl", "settings");

    app.get("/api/admin/pterodactyl/nodes", core.admin, async (req, res) => {
        try {
            const [a, b] = await Promise.all([db.get("pterodactyl", "nodes"),ptero.nodes()]);
            const c = [];
            for (let i of a) {
                const d = (b.find(node => node.attributes.id === i.id)).attributes
                if (d) {
                    d["deployments"] = i.deployments;
                    c.push(d);
                }
            }
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res), data: c }));
        } catch (error) {
            handle(error, "Minor", 30)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.post("/api/admin/pterodactyl/nodes", core.admin, async (req, res) => {
        try {
            const [a, b] = await Promise.all([ptero.nodes(), db.get("pterodactyl", "nodes")]);
            if (b.length >= 1) {
                a = a.filter(i => !b.map(i => i.id).includes(i.attributes.id));
            }
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res), data: a }));
        } catch (error) {
            handle(error, "Minor", 30)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.put("/api/admin/pterodactyl/nodes", core.admin, async (req, res) => {
        try {
            let a = await ptero.nodes()
            let b = await db.get("pterodactyl", "nodes") || []
            if (b.find(i => i.id == req.body.id) !== undefined) return res.end(JSON.stringify({ success: false, message: alert("EXISTS", req, res) }));
            let c = (a.find(c => c.attributes.id == req.body.id)).attributes
            if (c) {
                c["deployments"] = { name: req.body.name, role: req.body.role, fees: parseInt(req.body.fees) }
                b.push(c)
                await db.set("pterodactyl", "nodes", b)
            }
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res) }));
        } catch (error) {
            handle(error, "Minor", 30)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.delete("/api/admin/pterodactyl/nodes", core.admin, async (req, res) => {
        try {
            let a = await db.get("pterodactyl", "nodes") || []
            await db.set("pterodactyl", "nodes", a.filter(i => i.id !== req.body.id))
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res) }));
        } catch (error) {
            handle(error, "Minor", 30)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.get("/api/admin/pterodactyl/eggs", core.admin, async (req, res) => {
        try {
            let a = await db.get("pterodactyl", "eggs")
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res), data: a }));
        } catch (error) {
            handle(error, "Minor", 30)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.post("/api/admin/pterodactyl/eggs", core.admin, async (req, res) => {
        try {
            let a = await ptero.eggs();
            let b = await db.get("pterodactyl", "eggs") || [];
            if (b.length !== 0) {
                for (let i of a) {
                    let c = [];
                    for (let j of i.attributes.relationships.eggs.data) {
                        if (!b.map(k => k.id).includes(j.attributes.id)) c.push(j);
                    }
                    i.attributes.relationships.eggs.data = c;
                }
            }
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res), data: a }));
        } catch (error) {
            handle(error, "Minor", 30);
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.put("/api/admin/pterodactyl/eggs", core.admin, async (req, res) => {
        try {
            let a = await ptero.eggs()
            let b = await db.get("pterodactyl", "eggs") || []
            if (b.find(i => i.id == req.body.id) !== undefined) return res.end(JSON.stringify({ success: false, message: alert("EXISTS", req, res) }));
            let c = (a.find(c => c.attributes.id == req.body.nest)).attributes.relationships.eggs.data
            let d = (c.find(c => c.attributes.id == req.body.id)).attributes
            if (d) {
                d["deployments"] = { name: req.body.name, role: req.body.role, fees: parseInt(req.body.fees), icon: req.body.icon }
                b.push(d)
                await db.set("pterodactyl", "eggs", b)
            }
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res) }));
        } catch (error) {
            handle(error, "Minor", 30);
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    app.delete("/api/admin/pterodactyl/eggs", core.admin, async (req, res) => {
        try {
            let a = await db.get("pterodactyl", "eggs") || []
            await db.set("pterodactyl", "eggs", a.filter(i => i.id !== req.body.id))
            return res.end(JSON.stringify({ success: true, message: alert("SUCCESS", req, res) }));
        } catch (error) {
            handle(error, "Minor", 30);
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    async function handle(error, a, b) {
        try {
            const admins = await db.get("notifications", "admins") || [];
            const errors = await db.get("logs", "errors") || [];
            console.error(error)
            if (typeof admins == "array" && typeof errors == "array") {
                admins.push({
                    title: `${a} Error`,
                    message: `${error}`,
                    type: "error",
                    place: "admin-pterodactyl",
                    date: Date.now()
                });
                errors.push({ date: Date.now(), error: error, file: "routes/admin/pterodactyl.js", line: b });
                await db.set("notifications", "admins", admins);
                await db.set("logs", "errors", errors);
            }
            return
        } catch (error) {
            console.error(error)
            return
        }
    };
}
/**
 *--------------------------------------------------------------------------
 * End of the file.
 *--------------------------------------------------------------------------
*/