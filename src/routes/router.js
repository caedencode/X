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
 * router.js - Endpoints handler.
 *--------------------------------------------------------------------------
*/
/**
 *--------------------------------------------------------------------------
 * Message from the Creator
 *--------------------------------------------------------------------------
 * This crap file took me hours to figuire out how it is suppose to work,
 * but now that I got it working, It's pretty easy to understand and use.
 * If you have any questions or need help with anything please don't fucking
 * ask me. I am done with this shit.
 *--------------------------------------------------------------------------
*/
/**
 *--------------------------------------------------------------------------
 * Loading modules
 *--------------------------------------------------------------------------
*/
const page = modules.page;
/**
 *--------------------------------------------------------------------------
 * Bunch of codes...
 *--------------------------------------------------------------------------
*/
module.exports = async function () {
    const appearance = await db.get("settings", "appearance") || {};
    const permissions = await db.get("settings", "permissions") || {};
    const blacklist = await db.get("punishments", "blacklist") || {};
    /**
     *--------------------------------------------------------------------------
     * Loading static endpoints
     *--------------------------------------------------------------------------
    */
    app.use('/assets', (req, res, next) => { express.static(path.join(__dirname, '..', '..', 'public'))(req, res, next) });
    app.use('/cdn', (req, res, next) => { express.static(path.join(__dirname, '..', '..', 'storage', 'cdn'))(req, res, next) });
    app.use('/robots.txt', (req, res, next) => {fs.readFile(path.join(__dirname, '..', '..', 'public', 'robots.txt'), 'utf8', (err, data) => {if (err) {res.end(err);} else {res.end(data);}});});
    app.use(async (req, res, next) => {req.session.userinfo = await db.get("users", 1);next();});//developmental line
    app.use((req, res, next) => {
        if (blacklist.countries && blacklist.countries.length > 0 && blacklist.countries.includes(geoip.lookup(req.ip)?.country)) {
            res.status(403)
            return res.end(fallback.errorBlacklisted())
        }
        return next();
    });
    /**
    *--------------------------------------------------------------------------
    * Handleing the root route
    *--------------------------------------------------------------------------
    */
    app.all("*", async (req, res) => {
        if (process.env.APP_MAINTENANCE == "true") return page.error("maintenance", req, res);
        if (blacklist && blacklist.ip && blacklist.ip.includes(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['x-client-ip'] || req.headers['x-forwarded'] || req.socket.remoteAddress)) return page.error("blacklisted", req, res)
        try {
            if (!(req.url).startsWith("/api")) await render();
            async function render() {
                const a = permissions.auth?.routes || require('../../app/config/permissions.json').auth.routes;
                const b = permissions.landing?.routes || require('../../app/config/permissions.json').landing.routes;
                const c = permissions.layouts?.routes || require('../../app/config/permissions.json').layouts.routes;
                const d = permissions.admin?.routes || require('../../app/config/permissions.json').admin.routes;
                const e = [
                    { name: "auth", routes: a },
                    { name: "landing", routes: b },
                    { name: "layouts", routes: c },
                    { name: "admin", routes: d }
                ];
                const f = await Promise.all(e.map(async ({ name, routes }) => {
                    let l
                    if (req.url == "/") {l = "/"} else if (req.url.endsWith("/")) {l = req.url.slice(0, -1)} else {l = req.url};
                    const g = routes.find(h => h.route == l);
                    if (g) {
                        await r(name, g);
                        return true;
                    }
                    return false;
                }));
                if (!f.includes(true)) return
            }
            async function r(f, i) {
                if (i.requireAuth && !req.session.userinfo) {
                    res.setHeader('Location', '/login');
                    res.writeHead(302);
                    res.end();
                }
                if (req.session.userinfo && req.session.userinfo.permissions && i && i.permission > req.session.userinfo.permissions.level) return res.end(fallback.error401());
                return await page.render(`./resources/views/${f}/${appearance.themes && appearance.themes[f] || "default"}/${i.path}`, req, res);
            }
            return page.render(`./resources/views/errors/404.ejs`, req, res);
        } catch (e) {
            console.error(e);
            res.end(fallback.error500(e));
        }
    });
}
/**
*--------------------------------------------------------------------------
* End of the file
*--------------------------------------------------------------------------
*/