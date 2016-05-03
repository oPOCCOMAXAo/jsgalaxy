var G = 6.67E-2;
var body = [];
var MAX = 10;
var INTERVAL = 40;
var timer = null;
var MAX_DIST = 10.0; // максимально допустимое отдаление
var AVG_DIST = 7.0; // появление новых объектов
var INIT_DIST = 0.7; // радиус для одного круга
var T_CRIT = 100.0; // соединение
var M0 = 0.01; // начальная масса
var R0 = radius(M0, 0); // начальный радиус
var K = 0.95; // сколько скорости не теряется
var KT = 1 - K; // сколько скорости переходит в тепло и теряется
var dt = 1; // время обсчёта (в секундах) шага
var rmin = 0.0001; // минимально допустимое расстояние
var r2min = rmin * rmin;
var MAX_DIST2 = MAX_DIST * MAX_DIST;

function Body(x, y) {
    this.t = 0.0;          // температура
    this.m = M0;           // масса
    this.r = R0;            // радиус
    this.x = x;            // координата
    this.y = y;            // координата
    this.vx = -0.01 * x;   // скорость
    this.vy = -0.01 * y;   // скорость
}

addEventListener("message", function (e) {
    var data = e.data;
    switch (data.cmd) {
        case "init":
            MAX = data.max;
            INTERVAL = data.interval;
            dt = INTERVAL * 0.001;
            body = [];
            addInitBody(MAX, INIT_DIST * Math.sqrt(MAX));
            postMessage(body);
            break;
        case "start":
            if (timer == null)
                timer = setInterval(step, INTERVAL);
            break;
        case "pause":
            if (timer != null) {
                clearInterval(timer);
                timer = null;
            }
            break;
    }
});

function step() {
    var ai, aj, ax, ay, dx, dy, r, r2, rr, i, j, de, dm, u1 = {}, u2 = {}, u3 = {}, u4 = {};
    addNewBody(MAX - body.length, AVG_DIST);

    var len = body.length;

    // dist
    dist = new Array(len);
    for (i = 0; i < len; i++) {
        dist[i] = new Array(len);
        for (j = i + 1; j < len; j++) {
            dx = body[j].x - body[i].x;
            dy = body[j].y - body[i].y;
            r2 = dx * dx + dy * dy;
            if (r2 < r2min) r = r2min;
            r = Math.sqrt(r2);
            rr = 1.0 / r;
            ax = dx * rr;
            ay = dy * rr;
            dist[i][j] = {
                dx: dx,
                dy: dy,
                r: r,
                r2: r2,
                rr: rr,
                rr2: 1.0 / r2,
                sumr: body[j].r + body[i].r,
                cos: ax,
                sin: ay
            };
            if (isNaN(rr)) {
                debugger;
                console.log(dist, body);
            }
        }
    }

    // touch
    for (i = 0; i < len; i++)
        for (j = i + 1; j < len; j++) {
            if (body[i].m == 0 || body[j].m == 0) continue;
            if (dist[i][j].r < dist[i][j].sumr) {
                if (body[i].t + body[j].t >= T_CRIT) {
                    // неупругое
                    de = body[i].m * body[i].t + body[j].m * body[j].t;
                    dm = body[i].m + body[j].m;
                    body[i].vx = (body[i].m * body[i].vx + body[j].m * body[j].vx) / dm;
                    body[i].vy = (body[i].m * body[i].vy + body[j].m * body[j].vy) / dm;
                    body[i].x = (body[i].m * body[i].x + body[j].m * body[j].x) / dm;
                    body[i].y = (body[i].m * body[i].y + body[j].m * body[j].y) / dm;
                    body[j].m = 0;
                    body[i].m = dm;
                    body[i].t = de / dm;
                    body[i].r = radius(dm, body[i].t);
                } else {
                    // упругое
                    // ai = m v^2
                    ai = body[i].m * (body[i].vx * body[i].vx + body[i].vy * body[i].vy);
                    aj = body[j].m * (body[j].vx * body[j].vx + body[j].vy * body[j].vy);
                    body[i].t += aj * KT / body[i].m;
                    body[j].t += ai * KT / body[j].m;

                    dx = dist[i][j].dx;
                    dy = dist[i][j].dy;

                    var vr = (body[i].vx * dx + body[i].vy * dy) * dist[i][j].rr2;
                    u1.x = dx * vr;
                    u1.y = dy * vr;
                    u2.x = body[i].vx - u1.x;
                    u2.y = body[i].vy - u1.y;
                    vr = (body[j].vx * dx + body[j].vy * dy) * dist[i][j].rr2;
                    u3.x = dx * vr;
                    u3.y = dy * vr;
                    u4.x = body[j].vx - u3.x;
                    u4.y = body[j].vy - u3.y;
                    body[i].vx = (u2.x + u3.x) * K;
                    body[i].vy = (u2.y + u3.y) * K;
                    body[j].vx = (u1.x + u4.x) * K;
                    body[j].vy = (u1.y + u4.y) * K;

                    // r2 = 1 / (r1 + r2)
                    r2 = 1.0 / dist[i][j].sumr;
                    // u1 - точка касания
                    u1.x = (body[i].x * body[j].r + body[j].x * body[i].r) * r2;
                    u1.y = (body[i].y * body[j].r + body[j].y * body[i].r) * r2;
                    body[i].x = u1.x - (body[i].r + rmin) * dist[i][j].cos;
                    body[i].y = u1.y - (body[i].r + rmin) * dist[i][j].sin;
                    body[j].x = u1.x + (body[j].r + rmin) * dist[i][j].cos;
                    body[j].y = u1.y + (body[j].r + rmin) * dist[i][j].sin;
                    body[i].r = radius(body[i].m, body[i].t);
                    body[j].r = radius(body[j].m, body[j].t);
                }
                return;
            }
        }

    // accel
    for (i = 0; i < len; i++)
        for (j = i + 1; j < len; j++) {
            ai = G * body[i].m * dist[i][j].rr2 * dt;
            aj = -G * body[j].m * dist[i][j].rr2 * dt;
            body[i].vx += ai * dist[i][j].cos;
            body[i].vy += ai * dist[i][j].sin;
            // другой знак
            body[j].vx += aj * dist[i][j].cos;
            body[j].vy += aj * dist[i][j].sin;
        }

    // move
    for (i = 0; i < len; i++) {
        body[i].x += body[i].vx * dt;
        body[i].y += body[i].vy * dt;
        var t = body[i].x * body[i].x + body[i].y * body[i].y;
        if (t > MAX_DIST2 || t < -MAX_DIST2) {
            body[i].m = 0;
            body[i].r = 0;
        }
    }

    for (i = 0; i < len; i++)
        if (body[i].m == 0) {
            body[i] = body[len - 1];
            body.splice(len - 1, 1);
            len--;
        }

    postMessage(body);
}

function radius(m, t) {
    return Math.sqrt(m * 0.1 + t * 0.000001);
}

function addNewBody(n, dist) {
    while (n-- > 0) {
        var angle = Math.random() * 6.2829;
        var res = new Body(dist * Math.cos(angle), dist * Math.sin(angle));
        body.push(res);
    }
}

function addInitBody(n, dist) {
    while (n-- > 0) {
        var angle = Math.random() * 6.2829;
        var r = Math.random() * dist;
        var res = new Body(r * Math.cos(angle), r * Math.sin(angle));
        body.push(res);
    }
}