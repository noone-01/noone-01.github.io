// http://bitwiseshiftleft.github.io/sjcl/

// See also: 
//   http://paperjs.org/
//   http://camanjs.com/
//   http://fabricjs.com/


// Grrrrr
// http://code.visualstudio.com/updates/vFebruary#_languages-javascript

/**
 * Added this because WebStorm thinks that ImageData.data is a CanvasPixelArray when it's really a Uint8ClampedArray
 * @typedef {CanvasPixelArray} Uint8ClampedArray
 */

window.onload = function ()
{
    reset();

    let canvas = document.getElementById("myCanvas");
    canvas.addEventListener("mousedown", setP1);
    canvas.addEventListener("mousemove", canvasMouseMove);
    canvas.addEventListener("mouseup", setP2);
    canvas.style.cursor = "default";
};

/**
 * Load an image into the original-image element
 * @param {File} file
 */
function loadImage(file)
{
    if (file === undefined) return;

    document.getElementById("original-image").src = file.name;
}

function reset()
{
    // Load the original image
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    let img = document.getElementById("original-image");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Clear the overlay
    canvas = document.getElementById("overlay");
    clearCanvas(canvas);
    canvas.width = img.width;
    canvas.height = img.height;
}

/**
 *
 * @param {MouseEvent} e
 */
function setP1(e)
{
    // Left button only
    if (e.button !== 0) return;

    this.p1 = getMousePos(this, e);
    this.style.cursor = "crosshair";
    document.getElementById('p1').textContent = this.p1.toString();
}

function canvasMouseMove(e)
{
    let mousePos = getMousePos(this, e);
    document.getElementById('mouseCoords').textContent = mousePos.toString();

    if (!this.p1) return;

    let canvas = document.getElementById("overlay");
    canvas.style.cursor = "crosshair";
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let ul = new Point(Math.min(this.p1.x, mousePos.x), Math.min(this.p1.y, mousePos.y));
    let lr = new Point(Math.max(this.p1.x, mousePos.x), Math.max(this.p1.y, mousePos.y));

    if (document.getElementById("brushRect").checked)
    {
        ctx.strokeRect(ul.x, ul.y, lr.x - ul.x, lr.y - ul.y);
    }
    else if (document.getElementById("brushCircle").checked)
    {
        ctx.beginPath();
        ctx.arc(Math.floor((lr.x + ul.x) / 2),
            Math.floor((lr.y + ul.y) / 2),
            Math.floor(Point.distance(ul, lr) / 2),
            0,
            2 * Math.PI);
        ctx.stroke();
    }
}

function setP2(e)
{
    if (!this.p1) return;
    // Left button only
    if (e.button !== 0) return;

    this.p2 = getMousePos(this, e);
    document.getElementById('p2').textContent = this.p2.toString();

    let ul = new Point(Math.min(this.p1.x, this.p2.x), Math.min(this.p1.y, this.p2.y));
    let lr = new Point(Math.max(this.p1.x, this.p2.x), Math.max(this.p1.y, this.p2.y));

    let brush;
    if (document.getElementById("brushRect").checked)
        brush = new Rect(ul, lr);
    else if (document.getElementById("brushCircle").checked)
        brush = new Circle(new Point(Math.floor((lr.x + ul.x) / 2), Math.floor((lr.y + ul.y) / 2)), Math.floor(Point.distance(ul, lr) / 2));
    else
        throw new Error("wtf?");

    let effect;
    if (document.getElementById("effectTest").checked)
        effect = test;
    else if (document.getElementById("effectInvert").checked)
        effect = invert;
    else if (document.getElementById("effectGrayScale").checked)
        effect = grayScale;
    else if (document.getElementById("effectReverse").checked)
        effect = reverse;
    else if (document.getElementById("effectShuffle").checked)
        effect = shuffle;
    else if (document.getElementById("effectShuffle_stable").checked)
        effect = shuffle_stable;
    else if (document.getElementById("effectSort").checked)
        effect = sort;
    else if (document.getElementById("effectZeroAlpha").checked)
        effect = zeroAlpha;
    else if (document.getElementById("effectFullAlpha").checked)
        effect = fullAlpha;
    else if (document.getElementById("effectEncrypt").checked)
        effect = encrypt;
    else if (document.getElementById("effectShowDiffs").checked)
        effect = showDiffs;
    else
        throw new Error("wtf?");

    modifyImageData(this, effect, brush);

    document.getElementById('p1Prev').textContent = this.p1.toString();
    document.getElementById('p2Prev').textContent = this.p2.toString();
    document.getElementById('p1').textContent = "";
    document.getElementById('p2').textContent = "";

    this.p1 = null;
    this.p2 = null;
    this.style.cursor = "default";
    clearCanvas(document.getElementById("overlay"));
}

/*********************/
/* Utility Functions */
/*********************/

function getMousePos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect(); // THIS SOMETIMES RETURNS FLOATS IN IE!!!!!!!
    return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

function clearCanvas(canvas)
{
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function modifyImageData(canvas, modFunc, brush)
{
    if (document.getElementById("brushRect").checked)
        brush = brush || new Rect(new Point(0, 0), new Point(canvas.width, canvas.height));
    else if (document.getElementById("brushCircle").checked)
        brush = brush || new Circle(new Point(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)), Math.floor(canvas.width / 2));
    else
        throw new Error("wtf?");

    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    modFunc(imageData, brush);

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Assign the r/g/b values from a Pixel object to the specified offset
 * @param data
 * @param {number} offset
 * @param {Pixel} newPixel
 */
function setPixel(data, offset, newPixel)
{
    data[offset/**/] = newPixel.r;
    data[offset + 1] = newPixel.g;
    data[offset + 2] = newPixel.b;
    data[offset + 3] = newPixel.a;
}

/**
 * Swap the pixel values at two given offsets (offsets should be divisible by 4)
 * @param {Uint8ClampedArray} data
 * @param {number} offsetA
 * @param {number} offsetB
 */
function swapPixels(data, offsetA, offsetB)
{
    let temp = [];

    temp[0] = data[offsetB/**/]; // Red
    temp[1] = data[offsetB + 1]; // Green
    temp[2] = data[offsetB + 2]; // Blue
    temp[3] = data[offsetB + 3]; // Alpha

    data[offsetB/**/] = data[offsetA/**/];
    data[offsetB + 1] = data[offsetA + 1];
    data[offsetB + 2] = data[offsetA + 2];
    data[offsetB + 3] = data[offsetA + 3];

    data[offsetA/**/] = temp[0];
    data[offsetA + 1] = temp[1];
    data[offsetA + 2] = temp[2];
    data[offsetA + 3] = temp[3];
}


/**
 *
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {Point} p
 */
function calcAdjacencyDifference(data, width, p)
{
    let px = Pixel.fromPoint(data, width, p);
    let adjacentPixels = [];
    /* The 8 adjacent pixels in a box around p:
        123
        4p5
        678
     */
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x-1, p.y-1)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x, p.y-1)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x+1, p.y-1)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x-1, p.y)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x+1, p.y)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x-1, p.y+1)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x, p.y+1)));
    adjacentPixels.push(Pixel.fromPoint(data, width, new Point(p.x+1, p.y+1)));

    let totalDiff = 0;
    for(let i = 0; i < adjacentPixels.length; i++)
    {
        let px1 = adjacentPixels[i];
        if(!px1) continue;

        totalDiff += Math.abs(px.r - px1.r);
        totalDiff += Math.abs(px.g - px1.g);
        totalDiff += Math.abs(px.b - px1.b);
        // totalDiff += Math.abs(px.a - px1.a);
    }

    return totalDiff;
}

/********************************/
/* Image Manipulation Functions */
/********************************/

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function test(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;

    // Calculate the difference for each pixel
    // TODO: If this works at all, it will only be for rectangles
    let xlen = brush.lr.x - brush.ul.x;
    let ylen = brush.lr.y - brush.ul.y;

    let diffs = [];
    for (let y = 0; y < ylen; y++)  // TODO: fix awkward array indices
    {
        diffs[y] = [];
        for (let x = 0; x < xlen; x++)
        {
            diffs[y][x] = calcAdjacencyDifference(data, width, new Point(brush.ul.x + x, brush.ul.y + y));
        }
    }

    // Calculate the total difference for each row and column
    let colDiffs = [];
    for (let y = 0; y < ylen; y++)
    {
        colDiffs[y] = 0;
        for (let x = 0; x < xlen; x++)
        {
            colDiffs[y] += diffs[y][x];
        }
    }

    let rowDiffs = [];
    for (let x = 0; x < xlen; x++)
    {
        rowDiffs[x] = 0;
        for (let y = 0; y < ylen; y++)
        {
            rowDiffs[x] += diffs[y][x];
        }
    }

    // Normalize
    let minCol = Math.min.apply(null, colDiffs);
    for(let i = 0; i < colDiffs.length; i++)
    {
        colDiffs[i] -= minCol;
    }

    let minRow = Math.min.apply(null, rowDiffs);
    for(let i = 0; i < rowDiffs.length; i++)
    {
        rowDiffs[i] -= minRow;
    }

    // Find the change from the previous row
    let colDelta = [];
    for(let i = 1; i < colDiffs.length; i++)
    {
        colDelta[i] = Math.abs(colDiffs[i] - colDiffs[i - 1]);
    }

    let rowDelta = [];
    for(let i = 1; i < rowDiffs.length; i++)
    {
        rowDelta[i] = Math.abs(rowDiffs[i] - rowDiffs[i - 1]);
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function showDiffs(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let originalData = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        let diff = calcAdjacencyDifference(originalData, width, point);
        data[i/**/] = diff/3; // red
        data[i + 1] = diff/3; // green
        data[i + 2] = diff/3; // blue
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function invert(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        data[i/**/] = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function grayScale(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        let grayscale =
            data[i/**/] * .3 +
            data[i + 1] * .59 +
            data[i + 2] * .11;

        data[i/**/] = grayscale; // red
        data[i + 1] = grayscale; // green
        data[i + 2] = grayscale; // blue
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function reverse(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;

    // Old Method
    // for (let i = 0; i < data.length / 2; i += 4)
    // {
    //     let point = Point.fromOffset(i, width);
    //     if (!brush.contains(point))
    //         continue;
    //
    //     swapPixels(data, i, data.length - i - 4); // This only works for the entire canvas, not partial selections
    // }

    // New Method
    let points = brush.getPoints();
    for (let i = 0; i < points.length / 2; i++)
    {
        let p1 = points[i];
        let p2 = points[points.length - i - 1];

        swapPixels(data, p1.getOffset(width), p2.getOffset(width));
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function shuffle(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        let randPoint = brush.getRandomPoint();

        swapPixels(data, i, randPoint.getOffset(width));
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function shuffle_stable(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;

    // Use a key if one is specified
    let keyStr = document.getElementById('key').value;

    //noinspection JSUnresolvedFunction,JSPotentiallyInvalidConstructorUsage
    let rng = keyStr === '' ? Math.random : new Math.seedrandom(keyStr);

    // for (let i = 0; i < data.length; i += 4)
    // {
    //     let point = Point.fromOffset(i, width);
    //     if (!brush.contains(point))
    //         continue;
    //
    //     let randPoint = brush.getRandomPoint(rng);
    //
    //     // This probably isn't the best way to implement this
    //     // Actually, it leaves kind of an interesting "foggy" effect.  You can make out parts of the original image
    //     // let allowMultiSwaps = false;
    //     // let swappedPoints = new Set();
    //     // if(allowMultiSwaps || !(swappedPoints.has(point.toString()) || swappedPoints.has(randPoint.toString())))
    //     // {
    //     //     swapPixels(data, i, randPoint.getOffset(width));
    //     //     swappedPoints.add(point.toString());
    //     //     swappedPoints.add(randPoint.toString());
    //     // }
    //     swapPixels(data, i, randPoint.getOffset(width));
    // }

    let points = brush.getPoints();
    while (points.length > 1)
    {
        let p1 = points.splice(Math.floor(points.length * rng()), 1)[0];
        let p2 = points.splice(Math.floor(points.length * rng()), 1)[0];

        swapPixels(data, p1.getOffset(width), p2.getOffset(width));
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function sort(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let toSort = [];
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        toSort.push(new Pixel(data, i));
    }

    let sorted = toSort.slice();
    sorted.sort(function (a, b)
    {
        return a.getComparisonValue() - b.getComparisonValue();
    });

    for (let i = 0; i < toSort.length; i++)
    {
        setPixel(data, toSort[i].offset, sorted[i]);
    }
}

function zeroAlpha(imageData, brush)
{
    setAlpha(imageData, brush, 1);
}

function fullAlpha(imageData, brush)
{
    setAlpha(imageData, brush, 255);
}

function setAlpha(imageData, brush, alpha)
{
    let data = imageData.data;
    let width = imageData.width;
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        data[i + 3] = alpha;
    }
}

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function encrypt(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let keyStr = document.getElementById('key').value;

    //noinspection JSUnresolvedFunction,JSPotentiallyInvalidConstructorUsage
    let prng = new Math.seedrandom(keyStr);
    for (let i = 0; i < data.length; i += 4)
    {
        let point = Point.fromOffset(i, width);
        if (!brush.contains(point))
            continue;

        data[i/**/] = data[i/**/] ^ (255 * prng());
        data[i + 1] = data[i + 1] ^ (255 * prng());
        data[i + 2] = data[i + 2] ^ (255 * prng());
        // data[i + 3] = data[i + 3] ^ (255 * prng()); // Including transparency causes dead pixels for some reason
    }


    // let str = StringView.bytesToBase64(data);
    // let encString = sjcl.encrypt(keyStr, str);
    // let encObj = sjcl.json.decode(encString);
    // let encB64 = sjcl.codec.base64.fromBits(encObj.ct);
    // let encData = StringView.base64ToBytes(encB64);
    //
    // // ok, now what?
    // for (let i = 0; i < encData.length; i++)
    // {
    //     data[i] = encData[i];
    // }
}


// *******
// Classes
// *******

class Point {
    // *******
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    /**
     * Get the byte array offset of the Point for a given width
     * @param {number} width
     * @returns {number}
     */
    getOffset(width)
    {
        return (this.x + this.y * width) * 4;
    }

    toString()
    {
        return '(' + this.x + ',' + this.y + ')';
    }

    /**
     * Get the distance between two Points
     * @param {Point} p1
     * @param {Point} p2
     * @returns {number}
     */
    static distance(p1, p2)
    {
        return Math.floor(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
    }

    /**
     * Create a new Point from an offset and width
     * @param {number} offset
     * @param {number} width
     * @returns {Point}
     */
    static fromOffset(offset, width)
    {
        let newPoint = new Point();
        newPoint.x = offset / 4 % width;
        newPoint.y = Math.floor(offset / 4 / width);

        return newPoint;
    }
}


/**
 *
 * @param {Point} ul
 * @param {Point} lr
 * @constructor
 */
function Rect(ul, lr)
{
    this.ul = ul;
    this.lr = lr;

    /**
     * Tests whether or not the passed point is contained within the rectangle.
     * @param {Point} point
     * @returns {boolean}
     */
    this.contains = function contains(point)
    {
        return (
            point.x >= this.ul.x
            && point.x < this.lr.x
            && point.y >= this.ul.y
            && point.y < this.lr.y
        );
    };

    /**
     * Get an array of all the points contained in the rectangle
     * @returns {Point[]}
     */
    this.getPoints = function getPoints()
    {
        let points = [];
        for (let y = this.ul.y; y < this.lr.y; y++)
        {
            for (let x = this.ul.x; x < this.lr.x; x++)
            {
                points.push(new Point(x, y));
            }
        }

        return points;
    };

    /**
     * Return a single random point contained within the rectangle
     * @param rng
     * @returns {Point}
     */
    this.getRandomPoint = function getRandomPoint(rng)
    {
        rng = rng || Math.random;
        let point = new Point();
        point.x = Math.floor(rng() * (this.lr.x - this.ul.x)) + this.ul.x;
        point.y = Math.floor(rng() * (this.lr.y - this.ul.y)) + this.ul.y;

        return point;
    };

    this.toString = function toString()
    {
        return '{ul:' + this.ul.toString() + ', lr:' + this.lr.toString() + '}';
    }
}

/**
 *
 * @param {Point} center
 * @param {number} radius
 * @constructor
 */
function Circle(center, radius)
{
    this.center = center;
    this.radius = radius;

    /**
     * Tests whether or not the passed point is contained within the circle.
     * @param {Point} point
     * @returns {boolean}
     */
    this.contains = function contains(point)
    {
        return Math.pow(this.center.x - point.x, 2) + Math.pow(this.center.y - point.y, 2) < Math.pow(this.radius, 2);
    };

    /**
     * Get an array of all the points contained in the circle
     *
     * Uses this algorithm: https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
     * Also: http://stackoverflow.com/questions/10878209/midpoint-circle-algorithm-for-filled-circles
     *
     * @returns {Point[]}
     */
    this.getPoints = function getPoints()
    {
        function plot4points(points, x0, y0, x, y)
        {
            horizontalLine(points, x0 - x, y0 + y, x0 + x);
            if (x !== 0 && y !== 0)
                horizontalLine(points, x0 - x, y0 - y, x0 + x);
        }

        function horizontalLine(points, x0, y0, x1)
        {
            for (let x = x0; x <= x1; ++x)
            {
                points.push(new Point(x, y0));
            }
        }

        let points = [];
        let error = -this.radius;
        let x = this.radius;
        let y = 0;
        let x0 = this.center.x;
        let y0 = this.center.y;

        while (x >= y)
        {
            let lastY = y;

            error += y;
            ++y;
            error += y;

            plot4points(points, x0, y0, x, lastY);

            if (error >= 0)
            {
                if (x != lastY)
                { //noinspection JSSuspiciousNameCombination
                    plot4points(points, x0, y0, lastY, x);
                }

                error -= x;
                --x;
                error -= x;
            }
        }

        // Sort the array of points
        points.sort(function (a, b)
        {
            if (a.y === b.y)
                return a.x - b.x;
            else
                return a.y - b.y;
        });

        return points;
    };

    /**
     * Return a single random point contained within the circle
     * @param rng
     * @returns {Point}
     */
    this.getRandomPoint = function getRandomPoint(rng)
    {
        rng = rng || Math.random;
        // Ok, I cheated: http://stackoverflow.com/a/5838991
        let point = new Point();
        let a = rng();
        let b = rng();
        if (b < a)
        {
            let temp = b;
            b = a;
            a = temp;
        }

        point.x = Math.floor(b * this.radius * Math.cos(Math.PI * 2 * a / b)) + this.center.x;
        point.y = Math.floor(b * this.radius * Math.sin(Math.PI * 2 * a / b)) + this.center.y;

        return point;
    };

    this.toString = function toString()
    {
        return '{center:' + this.center.toString() + ', radius:' + this.radius.toString() + '}';
    }
}

class Pixel {
    /**
     *
     * @param {Uint8ClampedArray} data
     * @param {number} offset
     * @constructor
     */
    constructor(data, offset)
    {
        this.offset = offset;

        this.r = data[offset/**/]; // Red
        this.g = data[offset + 1]; // Green
        this.b = data[offset + 2]; // Blue
        this.a = data[offset + 3]; // Alpha

    }

    getComparisonValue()
    {
        return (this.r + this.g + this.b) * this.a;
    }

    /**
     * @param {Uint8ClampedArray} data
     * @param {number} width
     * @param {Point} p
     */
    static fromPoint(data, width, p)
    {
        let offset = p.getOffset(width);
        if(offset >= 0 && offset < data.length)
        {
            return new Pixel(data, offset);
        }
        else
        {
            return null;
        }
    }
}


// More notes on performance: https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

// ????? Is this right?
// http://stackoverflow.com/questions/2573212/why-is-setting-html5s-canvaspixelarray-values-ridiculously-slow-and-how-can-i-d
// function perfTest()
// {
//     let iterations = 1000;
//     let canvas = document.getElementById("myCanvas");
//     let ctx = canvas.getContext("2d");
//     let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//
//     let aStart = Date.now();
//     for (let j = 0; j < iterations; j++)
//     {
//         for (let i = 0; i < imageData.data.length; i += 4)
//         {
//             imageData.data[i] = 255 * Math.random();
//             imageData.data[i + 1] = 255 * Math.random();
//             imageData.data[i + 2] = 255 * Math.random();
//             imageData.data[i + 3] = 255 * Math.random();
//         }
//         ctx.putImageData(imageData, 0, 0);
//     }
//     let aStop = Date.now();
//
//     let bStart = Date.now();
//     let data = imageData.data;
//     for (let j = 0; j < iterations; j++)
//     {
//         for (let i = 0; i < data.length; i += 4)
//         {
//             data[i] = data[i] ^ 255;
//             data[i + 1] = 255 * Math.random();
//             data[i + 2] = 255 * Math.random();
//             data[i + 3] = 255 * Math.random();
//         }
//         ctx.putImageData(imageData, 0, 0);
//     }
//     let bStop = Date.now();
//
//     console.log('Time A: ' + (aStop - aStart));
//     console.log('Time B: ' + (bStop - bStart));
//     // Spoiler alert: B is about 25% faster
// }