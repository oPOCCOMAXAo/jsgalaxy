var context, canvas, zx, zy, h = window.innerHeight, w = window.innerWidth, len = h > w ? w : h, ahref, autoss, framen = 0;
/*w = 640;
h = 480;*/
var n, ro, gamma, scale, d, star, PI2 = Math.PI * 2, tmax, k;
function main() {
	canvas = document.createElement('canvas');
	canvas.height = h;
	canvas.width = w;
	canvas.id = 'hwnd';
	canvas.style.position = 'absolute';
	canvas.style.top = '0';
	canvas.style.left = '0';
	document.body.innerHTML = '';
	document.body.appendChild(canvas);
	document.body.style.background = '#000';
	context = canvas.getContext('2d');
	document.ontouchstart = touchStart;
	document.ontouchend = touchEnd;
	document.onkeydown = keyPress;
	document.onmousedown = mouseDown;
	document.onmouseup = mouseUp;	
	context.strokeStyle = '#ffa';
	context.fillStyle = '#ff5';
	ahref = document.createElement("a");
	ahref.download = 'file.png';
	ahref.rel = 'nofollow';
	autoss = false;
	init();
	setInterval(auto, 40);
}
function touchStart(e){
	var t = e.touches[0];
	document.ontouchmove = touchMove;
	zx = t.clientX;
	zy = t.clientY;
	return false;
}
function touchMove(e){
	var t = e.touches[0];
	var x = t.clientX;
	var y = t.clientY;
	move(x - zx, y - zy);
	zx = x;
	zy = y;
	return false;
}
function touchEnd(e){
	document.ontouchmove = null;
	return false;
}
function keyPress(e){
	var dir = e.which;
	switch(dir){
		case 39:case 76:case 68:case 100: dir = 1; break; // Right
		case 38:case 75:case 87:case 119: dir = 2; break; // Up
    	case 37:case 72:case 65:case 97: dir = 3; break; // Left
    	case 40:case 74:case 83:case 115: dir = 4; break; // Down
		default: return true;
	}
	doAction(dir);
	return false;
}
function mouseDown(e){
	zx = e.clientX;
	zy = e.clientY;
	document.onmousemove = mouseMove;
	return false;
}
function mouseMove(e){
	var x = e.clientX;
	var y = e.clientY;
	move(x - zx, y - zy);
	zx = x;
	zy = y;
	return false;
}
function mouseUp(e){
	document.onmousemove = null;
	return false;
}
function getDirection(dx, dy){
	var l, r, u, d;
	if(dx < 0) l = 1;
	else r = 1;
	if(dy < 0) u = 1;
	else d = 1;
	dx *= l ? -1 : 1;
	dy *= u ? -1 : 1;
	if(dx == dy) return 0;
	if(dx > dy) {u = d = 0;}
	else {l = r = 0;}
	return r ? 1 : u ? 2 : l ? 3 : 4; // r u l d
}
function doAction(act){
	switch(act){
		case 1: rightClick(); break;
		case 2: upClick(); break;
		case 3: leftClick(); break;
		case 4: downClick();
	}
}
function test(){
	for(var a in CanvasRenderingContext2D){
		document.write(a.toString());
	}
}
function downClick(){
	// для скриншота - раскомментируйте
	// autoss = confirm('Сохранять каждый кадр?');
}
function leftClick(){
}
function upClick(){
}
function rightClick(){
}
function move(dx, dy){
	dx /= 2;
	dy /= 2;
	var dir = {x: dx / Math.abs(dx), y: dy / Math.abs(dy)};
	for(var i = 0; i <= dx; i++){
		if(dir.x == 1) {rightClick();}
		else {leftClick();}
	}
	for(var i = 0; i <= dy; i++){
		if(dir.y == 1) {downClick();}
		else {upClick();}	
	}
}
function auto(){
    step();
	clear();
    for (i = 0; i < n; i++) pr(i);
	if(autoss)screenshot();
}
function pr(i) {
    d.r = m2r(star[i].m) / scale;
    if (d.r < 1) d.r = 1;
	context.beginPath();
	context.arc(star[i].x / scale + d.x, star[i].y / scale + d.y, d.r, 0, PI2);
	context.closePath();
    d.v[0] = Math.sqrt(star[i].vx * star[i].vx + star[i].vy * star[i].vy) / d.light;
    d.v[1] = d.v[0] / 7;
    d.v[2] = d.v[0] / 49;
    for (j = 0; j < 3; j++) {
        d.v[j] += 40;
        d.v[j] = parseInt(d.v[j]);
        if (d.v[j] > 255) d.v[j] = 255
    }
    context.fillStyle = "RGB(" + d.v[0] + "," + d.v[1] + "," + d.v[2] + ")";
	context.fill();
}
function clear() {
	context.fillStyle = "#000";
	context.fillRect(0, 0, w, h);
	//context.clearRect(0, 0, w, h);
}
function screenshot(){
	var c = new Date();
	var s = (framen++).toString();
	s = '000000'.substring(0, 6 - s.length) + s;
	ahref.href = canvas.toDataURL("image/png");
	ahref.download = 'file' + s + '.png';
	ahref.click();
};
