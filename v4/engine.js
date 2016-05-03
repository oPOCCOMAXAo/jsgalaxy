var G = 1;
var body = [];
var MAX = 10;
var INTERVAL = 40;
var timer = null;
var MAX_DIST = 10.0; // максимально допустимое отдаление
var AVG_DIST = 7.0; // появление новых объектов
var INIT_DIST = 0.7; // радиус для одного круга
var T_CRIT = 10.0; // соединение
var M0 = 0.01; // начальная масса
var R0 = radius(M0, 0); // начальный радиус
var K = 0.85; // сколько скорости не теряется
var KT = 1 - K; // сколько скорости переходит в тепло и теряется
var dt = 1; // время обсчёта (в секундах) шага
var rmin = 0.0001; // минимально допустимое расстояние
var r2min = rmin * rmin;
var MAX_DIST2 = MAX_DIST * MAX_DIST;

var param;

addEventListener("message", function (e) {
    var data = e.data;
    switch (data.cmd) {
        case "init":
            MAX = data.max;
            INTERVAL = data.interval;
            dt = INTERVAL * 0.001;
            body = [];
            param = new Array(MAX);
            for (var i = 0; i < MAX; i++)
                param[i] = new Array(MAX);
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

function Body(x, y) {
    this.t = 0.0;          // температура
    this.m = M0;           // масса
    this.r = R0;            // радиус
    this.x = x;            // координата
    this.y = y;            // координата
    this.vx = -0.01 * x;   // скорость
    this.vy = -0.01 * y;   // скорость
}

function IJparam(i, j) {
    var dx, dy, r, r2, rr, sin, cos;
    dx = body[j].x - body[i].x;
    dy = body[j].y - body[i].y;
    r2 = dx * dx + dy * dy;
    if (r2 < r2min) r = r2min;
    r = Math.sqrt(r2);
    rr = 1.0 / r;
    cos = dx * rr;
    sin = dy * rr;
    param[i][j] = {
        dx: dx,
        dy: dy,
        r: r,
        r2: r2,
        rr: rr,
        rr2: 1.0 / r2,
        cos: cos,
        sin: sin
    };
}

function calcparam(indexes) {
    var i, j;
    if (indexes == null)
        for (i = 0; i < MAX; i++)
            for (j = i + 1; j < MAX; j++)
                IJparam(i, j);
    else
        for (i = 0, len = indexes.length; i < len; i++)
            for (j = 0; j < MAX; j++)
                if (indexes[i] != j)
                    IJparam(indexes[i], j);
}

function calcpos() {
    var ai, aj, r;
    for (var i = 0; i < MAX; i++)
        for (var j = i + 1; j < MAX; j++) {
            ai = G * body[i].m * param[i][j].rr2 * dt;
            aj = -G * body[j].m * param[i][j].rr2 * dt;
            body[i].vx += ai * param[i][j].cos;
            body[i].vy += ai * param[i][j].sin;
            // другой знак
            body[j].vx += aj * param[i][j].cos;
            body[j].vy += aj * param[i][j].sin;
        }
    for (i = 0; i < MAX; i++) {
        body[i].x += body[i].vx * dt;
        body[i].y += body[i].vy * dt;
        r = body[i].x * body[i].x + body[i].y * body[i].y;
        if (r > MAX_DIST2 || r < -MAX_DIST2) {
            body[i].m = 0;
            body[i].r = 0;
        }
    }
}

function calctouch() {
    var de, dm, ei, ej, v, sumr, u1 = {}, u2 = {}, u3 = {}, u4 = {};
    for (var i = 0; i < MAX; i++)
        for (var j = i + 1; j < MAX; j++) {
            if (body[i].m == 0 || body[j].m == 0) continue;
            sumr = body[j].r + body[i].r;
            if (param[i][j].r < sumr) {
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
                    // E = m v^2
                    ei = body[i].m * (body[i].vx * body[i].vx + body[i].vy * body[i].vy);
                    ej = body[j].m * (body[j].vx * body[j].vx + body[j].vy * body[j].vy);
                    body[i].t += ej * KT / body[i].m;
                    body[j].t += ei * KT / body[j].m;

                    v = (body[i].vx * param[i][j].dx + body[i].vy * param[i][j].dy) * param[i][j].rr2;
                    u1.x = param[i][j].dx * v;
                    u1.y = param[i][j].dy * v;
                    u2.x = body[i].vx - u1.x;
                    u2.y = body[i].vy - u1.y;
                    v = (body[j].vx * param[i][j].dx + body[j].vy * param[i][j].dy) * param[i][j].rr2;
                    u3.x = param[i][j].dx * v;
                    u3.y = param[i][j].dy * v;
                    u4.x = body[j].vx - u3.x;
                    u4.y = body[j].vy - u3.y;
                    body[i].vx = (u2.x + u3.x) * K;
                    body[i].vy = (u2.y + u3.y) * K;
                    body[j].vx = (u1.x + u4.x) * K;
                    body[j].vy = (u1.y + u4.y) * K;

                    sumr = 1.0 / sumr;
                    // u1 - точка касания
                    u1.x = (body[i].x * body[j].r + body[j].x * body[i].r) * sumr;
                    u1.y = (body[i].y * body[j].r + body[j].y * body[i].r) * sumr;
                    body[i].x = u1.x - (body[i].r + rmin) * param[i][j].cos;
                    body[i].y = u1.y - (body[i].r + rmin) * param[i][j].sin;
                    body[j].x = u1.x + (body[j].r + rmin) * param[i][j].cos;
                    body[j].y = u1.y + (body[j].r + rmin) * param[i][j].sin;
                    body[i].r = radius(body[i].m, body[i].t);
                    body[j].r = radius(body[j].m, body[j].t);
                }
                calcparam([i, j]);
            }
        }
}

function step() {
    // param
    calcparam();

    // touch
    calctouch();

    // accel and move
    calcpos();

    // remove
    for (var i = 0, len = MAX; i < len; i++)
        if (body[i].m == 0) {
            body[i] = body[len - 1];
            body.splice(len - 1, 1);
            len--;
        }
    addNewBody(MAX - body.length, AVG_DIST);

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