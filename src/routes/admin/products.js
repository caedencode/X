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
 * products.js - Admin side products handler.
 *--------------------------------------------------------------------------
*/
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
module.exports = async function () {
    app.get("/api/admin/products", core.admin, async (req, res) => {
        try {
            let a = await db.get("products", "categories") || []
            let b = await db.get("products", "list") || []
            for (let i of a) {
                let c = b.filter(j => j.category == i.name.toLowerCase())
                i["products"] = c.length
            }
            return core.json(req, res, true, "SUCCESS", {products: b, categories: a});
        } catch (error) {
            handle(error, "Minor", 29)
            return core.json(req, res, false, "ERROR", error)
        }
    });

    app.post("/api/admin/products", core.admin, async (req, res) => {
        try {
            let a = await db.get("products", "list") || []
            let b = await db.get("core", "lastproduct") ?? 0
            let c = req.body
            if (!c.name || !c.type || !c.coins || !c.credits || !c.icon) return core.json(req, res, false, "MISSING")
            c["id"] = parseInt(b) + 1
            let d = a.find(i => i.id == c.id)
            if (d !== undefined) c.id = a.length + 1
            a.push(c)
            await db.set("core", "lastproduct", c.id);
            await db.set("products", "list", a);
            return core.json(req, res, true, "SUCCESS");
        } catch (error) {
            handle(error, "Minor", 38);
            return core.json(req, res, false, "ERROR", error);
        }
    });

    app.patch("/api/admin/products", core.admin, async (req, res) => {
        try {
            let a = await db.get("products", "list") || []
            let c = req.body
            let b = a.findIndex(i => i.id == c.id)
            if (b === -1) return core.json(req, res, false, "INVALID")
            if (!c.name || !c.type || !c.coins || !c.credits || !c.icon) return core.json(req, res, false, "MISSING")
            a[b] = c
            await db.set("products", "list", a);
            return core.json(req, res, true, "SUCCESS");
        } catch (error) {
            handle(error, "Minor", 38);
            return core.json(req, res, false, "ERROR", error);
        }
    });

    app.delete("/api/admin/products", core.admin, async (req, res) => {
        try {
            let a = await db.get("products", "list") || []
            let c = req.body
            c["id"] = parseInt(c.id)
            let b = a.findIndex(i => i.id == c.id)
            if (b == -1) return core.json(req, res, false, "INVALID")
            a = a.filter(i => i.id !== req.body.id);
            await db.set("products", "list", a);
            return core.json(req, res, true, "SUCCESS");
        } catch (error) {
            handle(error, "Minor", 38);
            return core.json(req, res, false, "ERROR", error);
        }
    });

    app.get("/admin/products/view/:id", core.admin, async (req, res) => {
        try {
            let a = await db.get("products", "list") || []
            let b = a.find(i => i.id == req.params.id)
            if (!b || b == undefined) return res.end(fallback.error404())
            const appearance = await db.get("settings", "appearance") || {};
            const template = appearance.themes && appearance.themes.admin || "default";
            return core.html(req, res, `./resources/views/admin/${template}/products/[id].ejs`, b)
        } catch (error) {
            handle(error, "Minor", 29)
            return core.json(req, res, false, "ERROR", error)
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