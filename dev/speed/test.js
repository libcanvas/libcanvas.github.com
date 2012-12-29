var ctx = atom.dom('canvas').first.getContext('2d-libcanvas');

ctx.width  = 400;
ctx.height = 300;

var img = new Image();
img.src = 'http://libcanvas.github.com/files/img/html5-logo-small.png';


var points = Array.range(0, 500).map(function () {
    return new LibCanvas.Point(
        Number.random(0, 350),
        Number.random(0, 250)
    );
});

function redraw () {
    ctx.clearAll();

    for (var i = 500; i--;) {
        var point = points[i];

        if (point.x > 350) point.x = 0;
        else point.x++;

        ctx.drawImage({ image: img, from: point });
    }
};

img.onload = function () {
    atom.frame.add(redraw);
}