window.addEventListener("DOMContentLoaded", init, false);
window.addEventListener("mousewheel", function (e) {
    scale *= e.wheelDeltaY > 0 ? 1.25 : 0.8
}, false);

var HEIGHT = window.innerHeight, WIDTH = window.innerWidth, PI2 = Math.PI * 2;
var d = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    v: [0, 0, 0],
    light: 10000
};
var canvas, context, engine, body = [], scale = (HEIGHT > WIDTH ? WIDTH : HEIGHT) / 4;

function init() {
    var t = document.location.search;
    if (t) {
        t = t.substring(1);
        t = parseInt(t);
        if (isNaN(t))
            t = 50;
    } else
        t = 50;

    canvas = document.createElement("canvas");
    with (canvas) {
        width = WIDTH;
        height = HEIGHT;
    }
    with (canvas.style) {
        position = 'absolute';
        left = 0;
        top = 0;
    }
    document.body.appendChild(canvas);
    context = canvas.getContext('2d');

    engine = new Worker("engine.js");
    engine.postMessage({
        cmd: "init",
        max: t,
        interval: 20
    });
    engine.postMessage({
        cmd: "start"
    });
    engine.addEventListener("message", onMessage, false);

    window.requestAnimationFrame(onRequestFrame);
}

function onMessage(e) {
    body = e.data;
}

function onRequestFrame() {
    window.requestAnimationFrame(onRequestFrame);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    for (var i = 0, len = body.length; i < len; i++) {
        if (d.r < 1) d.r = 1;
        context.beginPath();
        context.arc(body[i].x * scale + d.x, body[i].y * scale + d.y, body[i].r * scale, 0, PI2);
        context.closePath();
        d.v[0] = body[i].t * d.light;
        d.v[1] = d.v[0] * 0.14;
        d.v[2] = d.v[0] * 0.02;
        for (var j = 0; j < 3; j++) {
            d.v[j] = parseInt(d.v[j]) + 20;
            if (d.v[j] > 255) d.v[j] = 255
        }
        context.fillStyle = "RGB(" + d.v[0] + "," + d.v[1] + "," + d.v[2] + ")";
        context.fill();
    }
}