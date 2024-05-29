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
 * settings.js - Server settings handler.
 *--------------------------------------------------------------------------
*/
const users = require("../../cache/users")
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
module.exports = async function () {
    const admins = await db.get("notifications", "admins") || [];
    const errors = await db.get("logs", "errors") || [];

    app.get("/api/servers/transfer", core.auth, async (req, res) => {
        try {
            let a = await users.getAll();
            let b = []
            a.forEach(i => {
                b.push({
                    id: i.hcx.id,
                    nickname: i.hcx.nickname,
                    avatar: i.hcx.avatar
                })
            });
            return core.json(req, res, true, "SUCCESS", b)
        } catch (error) {
            console.error(error)
            return
        }
    });

    app.post("/api/servers/transfer/:id", core.auth, async (req, res) => {
        try {
            let a = req.params.id;
            await core.server(req, res, a);
            let b = req.session.userinfo.id;
            let c = req?.body;
            if (!c || !c.user) return core.json(req, res, true, "404")
            let [d, f, g, h] = await Promise.all([
                db.get("servers", b) || [],
                db.get("users", c.user),
                db.get("requests", b) || {},
                db.get("requests", c.user) || {}
            ]);
            let e = d.find(i => i.identifier === a)
            if (!f || !e) return core.json(req, res, true, "404")
            let request = {
                user: c.user,
                from: b,
                type: "server",
                server: c.server
            };
            let j = `req_${Date.now()}-${crypt.gen10(12)}`
            g["sent"] = g.sent || {}
            g.sent[j] = request
            h["incoming"] = h.incoming || {}
            h.incoming[j] = request
            await db.set("requests", c.user, h)
            await db.set("requests", b, g)
            core.log(`${req.session.userinfo.username} sent a request to ${c?.user} to transferred their server: ${c?.name}'s ownership.`);
            return core.json(req, res, true, "REQUESTED")
        } catch (error) {
            handle(error, "Minor", 39)
            return res.end(JSON.stringify({ success: false, message: alert("ERROR", req, res) + error }));
        }
    });

    async function handle(error, a, b) {
        console.error(error)
        admins.push({
            title: `${a} Error`,
            message: `${error}`,
            type: "error",
            place: "servers-settings",
            date: Date.now()
        });
        errors.push({ date: Date.now(), error: error, file: "routes/servers/settings.js", line: b });
        await db.set("notifications", "admins", admins);
        await db.set("logs", "errors", errors);
        return
    }
}