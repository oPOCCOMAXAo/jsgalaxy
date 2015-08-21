var System = new Object();
System.uses = [];
System.result = 1;
System.console = new Object();
System.console.show = function(){System.console.fnode.style.display='block';}
System.console.hide = function(){System.console.fnode.style.display='none';}
System.console.clear = function(){System.console.fnode.innerHTML='';}
System.console.log = function(s){System.console.fnode.innerHTML+=s;}
System.init = function() {
    var e = document.getElementsByTagName('script');
    for (var i = 0; i < e.length; i++) {
        System.uses[e.src] = 1;
    }
    System.console.fnode = document.createElement('div');
    e=System.console.fnode.style;
    e.id='systemconsole';
    e.display='none';
    e.width='100%';
    e.height='100px';
    if(document.body.firstChild)document.body.insertBefore(System.console.fnode,document.body.firstChild);
    else document.body.appendChild(System.console.fnode);
};
System.include = function(path) {
    if (System.uses[path])return;
    if (document.location.protocol.indexOf('file') == -1) {
        var s = document.location.protocol + document.location.host + document.location.pathname;
        var transport = new XMLHttpRequest()
        transport.open('GET', s + path.replace(/\./g, '/') + '.js', false);
        transport.send(null);
        s = transport.responseText;
        eval(s);
    }
    else {
        var scr = document.createElement('script');
        scr.src = path;
        document.head.appendChild(scr);
    }
    System.uses[path] = 1;
}
document.addEventListener("DOMContentLoaded",function(){System.init();setTimeout(main,1000);},false);
