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
 * biller.js - Global billing gateways handler.
 *--------------------------------------------------------------------------
*/
const biller = require('../../utils/billing')
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
module.exports = async function () {
    app.get("/api/payments/gateways", core.auth, async (req, res) => {
        try {
            let a = await db.get("core", "billers") || []
            let b = await db.get("addons", "active") || []
            let c = []
            for (let i of a) {
                let d = b.find(j => j.name == i)
                c.push(d)
            }
            return core.json(req, res, true, "SUCCESS", c)
        } catch (error) {
            console.error(error);
            return core.json(req, res, false, "ERROR", error);
        }
    });
    app.get("/api/payments/invoices", core.admin, async (req, res) => {
        try {
            let a = await db.get("billing", "invoices") || []
            return core.json(req, res, true, "SUCCESS", a)
        } catch (error) {
            console.error(error);
            return core.json(req, res, false, "ERROR", error);
        }
    });
    app.post("/api/payments/buy/:id", core.auth, async (req, res) => {
        try {
            let a = await db.get("addons", "active") || []
            let b = a.find(i => i.name == req.body.gateway)
            if (!b || b == undefined) return core.json(req, res, false, "INVALID")
            let c = require(`../../addons/${b.name}/remote.js`);
            let d = await db.get("products", "products") || []
            let e = d.find(i => i.id == product)
            if (!e || e == undefined) return core.json(req, res, false, "INVALID")
            let f = c.invoice(await uuid(), e)
            console.log(f)
        } catch (error) {
            console.error(error);
            return core.json(req, res, false, "ERROR", error);
        }
    });
    app.get("/admin/billing/gateways/:id", core.admin, async (req, res) => {
        try {
            let a = await db.get("core", "billers") || []
            let b = await db.get("addons", "active") || []
            let c = []
            for (let i of a) {
                let d = b.find(j => j.name == i)
                c.push(d)
            }
            let e = c.find(i => i == req.params.id)
            const appearance = await db.get("settings", "appearance") || {};
            const template = appearance.themes && appearance.themes.admin || "default";
            core.html(req, res, `./resources/views/admin/${template}/billing/gateways/[id].ejs`, e)
        } catch (error) {
            console.error(error)
            return core.json(req, res, false, "ERROR", error);
        }
    });
    app.get("/admin/billing/invoices/:id", core.admin, async (req, res) => {
        try {
            let a = await db.get("billing", "invoices") || []
            let b = a.find(i => i.id == req.params.id)

            const appearance = await db.get("settings", "appearance") || {};
            const template = appearance.themes && appearance.themes.admin || "default";
            core.html(req, res, `./resources/views/admin/${template}/billing/invoices/[id].ejs`, b)
        } catch (error) {
            console.error(error)
            return core.json(req, res, false, "ERROR", error);
        }
    });
}