window.addEventListener("DOMContentLoaded", init, false);
window.addEventListener("mousewheel", checkMouseWheel, false);
window.addEventListener("DOMMouseScroll", checkMouseWheel, false);
window.addEventListener("mousedown", onMouseDown, false);
window.addEventListener("mouseup", onMouseUp, false);

var HEIGHT = window.innerHeight, WIDTH = window.innerWidth, PI2 = Math.PI * 2;
var d = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    v: [0, 0, 0],
    light: 500
};
var pos = {
    x: 0,
    y: 0
};
var mouse = {
    x: 0,
    y: 0
};
var canvas, context, engine, body = [], scale = (HEIGHT > WIDTH ? WIDTH : HEIGHT) / 4;

function init() {
    var t = document.location.search;
    if (t) {
        t = t.substring(1);
        t = parseInt(t);
        if (isNaN(t))
            t = 100;
    } else
        t = 100;

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
        context.arc((body[i].x + pos.x) * scale + d.x, (body[i].y + pos.y) * scale + d.y, body[i].r * scale, 0, PI2);
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

function checkMouseWheel(e) {
    window.removeEventListener("mousewheel", checkMouseWheel, false);
    window.removeEventListener("DOMMouseScroll", checkMouseWheel, false);
    if (e.type == "DOMMouseScroll")
        window.addEventListener("DOMMouseScroll", onMouseWheelFF, false);
    else
        window.addEventListener("mousewheel", onMouseWheel, false);
}

function onMouseWheel(e) {
    scale *= e.wheelDeltaY > 0 ? 1.25 : 0.8
}

function onMouseWheelFF(e) {
    scale *= e.detail < 0 ? 1.25 : 0.8
}

function onMouseDown(e) {
    window.addEventListener("mousemove", onMouseMove, false);
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}
function onMouseUp(e) {
    window.removeEventListener("mousemove", onMouseMove);
}
function onMouseMove(e) {
    pos.x += (e.clientX - mouse.x) / scale;
    pos.y += (e.clientY - mouse.y) / scale;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}
