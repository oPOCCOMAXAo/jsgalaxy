function init(){
	var t = document.location.search;
	if(t){
		t = t.substring(1);
		t = parseInt(t);
		if(t == NaN)
			t = 200;
	}else{
		t = 200;
	}
	n = t;
	ro = 1;
	gamma = 0.03;
	scale = 10;
	tmax = Math.sqrt(n) / 50;
	k = len / tmax;
	d = {
		x: w / 2,
		y: h / 2,
		v: new Array(3),
		light: 0.03,
		hm: 100000000,
		vm: 10
	};
	star = new Array(n);
    document.title = n;
    for (i = 0; i < n; i++)
        star[i] = new Star();
}
function Star() {
	var t = ft(normder(-scale * tmax * 3, scale * tmax * 3));
	this.x = t.x;
	this.y = t.y;
    r = Math.sqrt(this.x * this.x + this.y * this.y);
    this.vx = Math.sqrt(d.hm * gamma / r) / r;
    this.vy = -this.vx * this.x;
    this.vx *= this.y;
    this.m = scale * Math.exp(parseInt(Math.random() * Math.random() * 10) + 0.01);
}
function ft(t){
	var sign = t < 0 ? -1 : 1;
	return {x: k*t*Math.cos(sign*t), y: k*t*Math.sin(sign*t)};
}
function normder(min, max){
	var res = 0;
	var q = 20;
	for(var i = 0; i < q; i++)
		res += Math.random();
	res /= q;
	return res * (max - min) + min;
}
function step() {
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            if (i != j) {
                r = dist(i, j);
				if (r < d.vm) r = d.vm;
                ax = gamma * star[j].m / r / r;
                ay = ax * dy / r;
                ax = ax * dx / r;
                star[i].vx += ax;
                star[i].vy += ay
            }
    for (i = 0; i < n; i++) {
        r = Math.sqrt(star[i].x * star[i].x + star[i].y * star[i].y);
        if (r < d.vm) r = d.vm;
        ax = gamma * d.hm / r / r;
        ay = -ax * star[i].y / r;
        ax *= -star[i].x / r;
        star[i].vx += ax;
        star[i].vy += ay
    }
    for (i = 0; i < n; i++) {
        star[i].x += star[i].vx;
        star[i].y += star[i].vy;
        if (star[i].x / scale < 0 - d.x * 5) star[i].m = 0;
        if (star[i].y / scale < 0 - d.y * 5) star[i].m = 0;
        if (star[i].x / scale > d.x * 5) star[i].m = 0;
        if (star[i].y / scale > d.y * 5) star[i].m = 0
    }
	touch();
}
function dist(ii, jj) {
    dx = star[jj].x - star[ii].x;
    dy = star[jj].y - star[ii].y;
    return Math.sqrt(dx * dx + dy * dy);
}
function m2r(mm) {
    return ro * Math.exp(Math.log(mm) / 3);
}
function touch() {
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            if (i != j && dist(i, j) < m2r(star[i].m) + m2r(star[j].m)) {
                star[i].vx = (star[i].m * star[i].vx + star[j].m * star[j].vx) / (star[i].m + star[j].m + 1);
                star[i].vy = (star[i].m * star[i].vy + star[j].m * star[j].vy) / (star[i].m + star[j].m + 1);
                star[i].x = (star[i].m * star[i].x + star[j].m * star[j].x) / (star[i].m + star[j].m + 1);
                star[i].y = (star[i].m * star[i].y + star[j].m * star[j].y) / (star[i].m + star[j].m + 1);
                star[i].m = star[i].m + star[j].m;
                star[j].m = 0;
            }
    for (i = 0; i < n; i++)
        if (star[i].m == 0) {
            star[i] = star[n - 1];
			star.splice(n - 1, 1);
            n--;
            document.title = n;
        }
}
