// http://bitwiseshiftleft.github.io/sjcl/

// See also: 
//   http://paperjs.org/
//   http://camanjs.com/
//   http://fabricjs.com/


// Test Images:
// http://sipi.usc.edu/database/

// /**
//  * Added this because WebStorm thinks that ImageData.data is a CanvasPixelArray when it's really a Uint8ClampedArray
//  * @typedef {CanvasPixelArray} Uint8ClampedArray
//  */

/**
 * Added this because WebStorm thinks that ImageData.data is a CanvasPixelArray when it's really a Uint8ClampedArray
 * @typedef {Uint8ClampedArray} CanvasPixelArray
 */

/**
 * @typedef {UIEvent} TouchEvent
 * @property {Boolean} altKey - A Boolean value indicating whether or not the alt key was down when the touch event was fired.
 * @property {TouchList} changedTouches - A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one.
 * @property {Boolean} ctrlKey - A Boolean value indicating whether or not the control key was down when the touch event was fired.
 * @property {Boolean} metaKey - A Boolean value indicating whether or not the meta key was down when the touch event was fired.
 * @property {Boolean} shiftKey - A Boolean value indicating whether or not the shift key was down when the touch event was fired.
 * @property {TouchList} targetTouches - A TouchList of all the Touch objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event.
 * @property {TouchList} touches - A TouchList of all the Touch objects representing all current points of contact with the surface, regardless of target or changed status.
 */

/**
 * @typedef {Touch[]} TouchList
 * @method {Touch} identifiedTouch
 * @method {Touch} item
 */

/**
 * @typedef {Object} Touch
 * @property {number} identifier - Returns a unique identifier for this Touch object. A given touch point (say, by a finger) will have the same identifier for the duration of its movement around the surface. This lets you ensure that you're tracking the same touch all the time.
 * @property {number} screenX - Returns the X coordinate of the touch point relative to the left edge of the screen.
 * @property {number} screenY - Returns the Y coordinate of the touch point relative to the top edge of the screen.
 * @property {number} clientX - Returns the X coordinate of the touch point relative to the left edge of the browser viewport, not including any scroll offset.
 * @property {number} clientY - Returns the Y coordinate of the touch point relative to the top edge of the browser viewport, not including any scroll offset.
 * @property {number} pageX - Returns the X coordinate of the touch point relative to the left edge of the document. Unlike clientX, this value includes the horizontal scroll offset, if any.
 * @property {number} pageY - Returns the Y coordinate of the touch point relative to the top of the document. Unlike clientY, this value includes the vertical scroll offset, if any.
 * @property {Element} target - Returns the Element on which the touch point started when it was first placed on the surface, even if the touch point has since moved outside the interactive area of that element or even been removed from the document.

 * @property {number} radiusX - Returns the X radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenX.
 * @property {number} radiusY - Returns the Y radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenY.
 * @property {number} rotationAngle - Returns the angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface.
 * @property {number} force - Returns the amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure).
 */

// TODO: Turns out that JPEG encoding works on block sizes of 8 and loses lots of color info when pixels are finely shuffled
// TODO: Attempt to shuffle while keeping blocks together so that (hopefully) less info is lost on encoding
// TODO: For Instagram, see if resizing to 1080x1080 (1080x1350?) has an effect.  Maybe, hopefully, IG won't reencode the image then
// TODO: Upper left pixel is the most important...what happens if I shuffle the rest of them?
// https://www.quora.com/How-do-I-upload-full-resolution-pictures-from-a-DSLR-to-Instagram
// https://www.endgame.com/blog/instegogram-leveraging-instagram-c2-image-steganography
const IG_MIN_SIZE = 320;
const IG_MAX_SIZE = 1080;

const IG_MAX_HEIGHT_VERTICAL = 1350;

// const BACKGROUND_RGBA = new RGBA(0, 0, 0, 255);
const BACKGROUND_COLOR = "black";

// Started with an image of 277
// 240 = DM size
// 320 = Post size
// 600x600 popup?
// 640 = old max
// 1080 = new max

// https://colorlib.com/wp/size-of-the-instagram-picture/
// Square Image: 1080px in width by 1080px in height
// Vertical Image:  1080px in width by 1350px in height
// Horizontal Image: 1080px in width by 566px in height


// https://help.instagram.com/1631821640426723
// When you share a photo that has a width between 320 and 1080 pixels, we keep that photo at its original resolution as
// long as the photo's aspect ratio is between 1.91:1 and 4:5 (a height between 566 and 1350 pixels with a width of 1080 pixels).
// If the aspect ratio of your photo isn't supported, it will be cropped to fit a supported ratio.
// If you share a photo at a lower resolution, we enlarge it to a width of 320 pixels.
// If you share a photo at a higher resolution, we size it down to a width of 1080 pixels.

// https://www.facebook.com/help/266520536764594
// How can I make sure that my photos display in the highest possible quality?
// 720px, 960px or 2048px wide
// < 100k
// JPEG with an sRGB color profile

// https://www.reddit.com/r/Android/comments/219suw/instagram_for_android_has_significantly_lower/

// http://photo.net/learn/jpeg/
// http://www.impulseadventure.com/photo/jpeg-huffman-coding.html
// http://web.ece.ucdavis.edu/cerl/ReliableJPEG/Cung/jpeg.html
// http://dsp.stackexchange.com/questions/2010/what-is-the-least-jpg-compressible-pattern-camera-shooting-piece-of-cloth-sca
// https://www.researchgate.net/figure/264860353_fig2_Fig-2-Example-screenshots-of-JPEG-Scrambling-tool-web-interface
// http://www.slideshare.net/touradj_ebrahimi/privacy-protection-of-visual-information

// https://www.imagemagick.org/Usage/transform/#encipher

window.onload = function ()
{
    reset();

    let canvas = document.getElementById("myCanvas");

    canvas.addEventListener("mousedown", canvas_MouseDown);
    canvas.addEventListener("mousemove", canvas_MouseMove);
    canvas.addEventListener("mouseup", canvas_MouseUp);

    canvas.addEventListener("touchstart", canvas_TouchStart);
    canvas.addEventListener("touchmove", canvas_TouchMove);
    canvas.addEventListener("touchcancel", canvas_TouchCancel);
    canvas.addEventListener("touchend", canvas_TouchEnd);

    canvas.style.cursor = "default";
};

/**
 * Load an image into the original-image element
 * @param {File} file
 */
function loadImage(file)
{
    if (file === undefined) return;

    let reader = new FileReader();
    reader.onload = function()
    {
        document.getElementById("original-image").src = reader.result;
    };
    reader.readAsDataURL(file);
}

function downloadFunction()
{
    let canvas = document.getElementById("myCanvas");
    let button = document.getElementById("download");
    button.href = canvas.toDataURL("image/jpeg", 1.0);

    if(document.getElementById("original-image_src").files[0])
        button.download = document.getElementById("original-image_src").files[0].name;
    else
        button.download = getFilename(document.getElementById("original-image").src);

    return true;
}

function getFilename(url)
{
    return url.split('/').pop().split('#')[0].split('?')[0];
}

function testConversion()
{
    // Perform jpg conversion and write the result back to the canvas
    let canvas = document.getElementById("myCanvas");
    let img = new Image();
    img.onload = function(){imgToCanvas(img, canvas);};
    img.src = canvas.toDataURL("image/jpeg", 1.0);
}

function reset()
{
    // Load the original image
    let canvas = document.getElementById("myCanvas");
    let img = document.getElementById("original-image");
    imgToCanvas(img, canvas);

    // Clear the overlay
    let olCanvas = document.getElementById("overlay");
    clearCanvas(olCanvas);
    olCanvas.width = canvas.width;
    olCanvas.height = canvas.height;

    // Clear misc stuff
    document.getElementById("error").textContent = "";
    let extractedCanvas = document.getElementById("extractedCanvas");
    clearCanvas(extractedCanvas);
    extractedCanvas.width = 0;
    extractedCanvas.height = 0;
}

/**
 *
 * @param {MouseEvent} e
 */
function canvas_MouseDown(e)
{
    // Left button only
    if (e.button !== 0) return;

    setP1(this, getCursorPos(this, e));
}

/**
 *
 * @param {TouchEvent} e
 */
function canvas_TouchStart(e)
{
    e.preventDefault();

    // Only handle the first touch (?)
    if(e.touches.length > 1) return;

    setP1(this, getCursorPos(this, e.changedTouches[0]));
}

/**
 *
 * @param canvas
 * @param {Point} point
 */
function setP1(canvas, point)
{
    canvas.p1 = point;
    canvas.style.cursor = "crosshair";
    document.getElementById('p1Input').value = canvas.p1.toString();
}

/**
 *
 * @param {MouseEvent} e
 */
function canvas_MouseMove(e)
{
    dragTo(this, getCursorPos(this, e));
}

/**
 *
 * @param {TouchEvent} e
 */
function canvas_TouchMove(e)
{
    e.preventDefault();

    // Only handle the first touch (?)
    if(e.touches[0] != e.changedTouches[0]) return;

    dragTo(this, getCursorPos(this, e.changedTouches[0]));
}

/**
 *
 * @param canvas
 * @param {Point} point
 */
function dragTo(canvas, point)
{
    document.getElementById('mouseCoords').textContent = point.toString();

    if (!canvas.p1) return;

    let olCanvas = document.getElementById("overlay");
    olCanvas.style.cursor = "crosshair";
    let ctx = olCanvas.getContext("2d");
    ctx.clearRect(0, 0, olCanvas.width, olCanvas.height);

    let ul = new Point(Math.min(canvas.p1.x, point.x), Math.min(canvas.p1.y, point.y));
    let lr = new Point(Math.max(canvas.p1.x, point.x), Math.max(canvas.p1.y, point.y));

    let brush;
    if (document.getElementById("brushRect").checked)
    {
        brush = new Rect(ul, lr);
    }
    else if (document.getElementById("brushCircle").checked)
    {
        brush = new Circle(
            new Point(Math.floor((lr.x + ul.x) / 2), Math.floor((lr.y + ul.y) / 2)),
            Math.floor(Point.distance(ul, lr) / 2));
    }
    brush.draw(ctx);
}

/**
 *
 * @param {TouchEvent} e
 */
function canvas_TouchCancel(e)
{
    e.preventDefault();
}

/**
 *
 * @param {MouseEvent} e
 * @this HTMLCanvasElement
 */
function canvas_MouseUp(e)
{
    // Left button only
    if (e.button !== 0) return;

    setP2(this, getCursorPos(this, e));
}

/**
 *
 * @param {TouchEvent} e
 */
function canvas_TouchEnd(e)
{
    e.preventDefault();

    // Only handle the first touch (?)
    if(e.touches.length > 0) return;

    setP2(this, getCursorPos(this, e.changedTouches[0]));
}

/**
 *
 * @param canvas
 * @param {Point} point
 */
function setP2(canvas, point)
{
    if (!canvas.p1) return;

    canvas.p2 = point;
    document.getElementById('p2Input').value = canvas.p2.toString();

    let ul = new Point(Math.min(canvas.p1.x, canvas.p2.x), Math.min(canvas.p1.y, canvas.p2.y));
    let lr = new Point(Math.max(canvas.p1.x, canvas.p2.x), Math.max(canvas.p1.y, canvas.p2.y));
    paintArea(canvas, ul, lr);

    document.getElementById('p1Prev').textContent = canvas.p1.toString();
    document.getElementById('p2Prev').textContent = canvas.p2.toString();
    document.getElementById('p1Input').value = "";
    document.getElementById('p2Input').value = "";

    canvas.p1 = null;
    canvas.p2 = null;
    canvas.style.cursor = "default";
    clearCanvas(document.getElementById("overlay"));
}

function manualInput()
{
    let canvas = document.getElementById('myCanvas');
    let input1 = document.getElementById('p1Input').value;
    let input2 = document.getElementById('p2Input').value;

    // Error handling? (lol)
    try
    {
        let p1 = Point.fromString(input1);
        let p2 = Point.fromString(input2);
        // If no input, then use the previous values
        if(p1 === null && p2 === null)
        {
            p1 = Point.fromString(document.getElementById('p1Prev').textContent);
            p2 = Point.fromString(document.getElementById('p2Prev').textContent);
        }

        let ul = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
        let lr = new Point(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));

        paintArea(canvas, ul, lr);
    }
    catch(ex)
    {
        console.log(ex);
    }
}

/**
 *
 * @param canvas
 * @param {Point} ul
 * @param {Point} lr
 */
function paintArea(canvas, ul, lr)
{
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
    else if (document.getElementById("effectShuffle_blocks").checked)
        effect = shuffle_blocks;
    else if (document.getElementById("effectInner_Shuffle_blocks").checked)
        effect = inner_shuffle_blocks;
    else if (document.getElementById("effectSort").checked)
        effect = sort;
    else if (document.getElementById("effectExtract").checked)
        effect = extract;
    else if (document.getElementById("effectZeroAlpha").checked)
        effect = zeroAlpha;
    else if (document.getElementById("effectFullAlpha").checked)
        effect = fullAlpha;
    else if (document.getElementById("effectEncrypt").checked)
        effect = encrypt;
    else if (document.getElementById("effectEncrypt_blocks").checked)
        effect = encrypt_blocks;
    else if (document.getElementById("effectShowDiffs").checked)
        effect = showDiffs;
    else
        throw new Error("wtf?");

    modifyImageData(canvas, effect, brush);
}

/*********************/
/* Utility Functions */
/*********************/

/**
 * Returns num clamped to the range [min, max]
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(num, min, max)
{
    return Math.max(min, Math.min(num, max));
}

/**
 * Returns the average values of an array of RGBA
 * @param {RGBA[]} arr
 * @returns {RGBA}
 */
function blendRGBA(arr)
{
    let result = new RGBA(0, 0, 0, 0);
    for (let i = 0; i < arr.length; i++)
    {
        let rgba = arr[i];
        result.r += rgba.r;
        result.g += rgba.g;
        result.b += rgba.b;
        result.a += rgba.a;
    }

    result.r /= arr.length;
    result.g /= arr.length;
    result.b /= arr.length;
    result.a /= arr.length;

    return result;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
/**
 * Returns an integer between min and max (inclusive) using the passed prng function
 * @param min
 * @param max
 * @param prng
 * @returns {number}
 */
function getRandomIntInclusive(min, max, prng) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(prng() * (max - min + 1)) + min;
}


/**
 * Convert an x,y value to a bytearray offset of the specified width
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @returns {number}
 */
function xyToOffset(x, y, width)
{
    return (x + y * width) * 4;
}

/**
 * Draw the passed image to the center of the canvas, cropped to IG dimensions (kind of)
 * @param img
 * @param canvas
 */
function imgToCanvas(img, canvas)
{
    // TODO: Taking this out for testing...fix later
    // Crop to IG size/shape (square, 1080 max)
    let biggestEdge = Math.max(img.width, img.height);
    // let canvasWidth = Math.min(biggestEdge, IG_MAX_SIZE);
    // let canvasHeight = Math.min(biggestEdge, IG_MAX_SIZE);

    let canvasWidth = biggestEdge;
    let canvasHeight = biggestEdge;

    // Expand to a multiple of 16
    if(canvasWidth % 16 > 0)
        canvasWidth = canvasWidth + 16 - (canvasWidth % 16);
    if(canvasHeight % 16 > 0)
        canvasHeight = canvasHeight + 16 - (canvasHeight % 16);

    // let canvasWidth = 640;
    // let canvasHeight = 640;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let ctx = canvas.getContext("2d");

    // Fill the background
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the image in the center of the canvas
    ctx.drawImage(img, Math.floor((canvasWidth - img.width) / 2), Math.floor((canvasHeight - img.height) / 2));
}

/**
 * Return a Point at the x,y coordinates of the mouse within the canvas
 * @param canvas
 * @param evt
 * @returns {Point}
 */
function getCursorPos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect(); // THIS SOMETIMES RETURNS FLOATS IN IE!!!!!!!  (and Firefox, apparently)
    return new Point(Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top));
}

/**
 * Clear the passed canvas
 * @param canvas
 */
function clearCanvas(canvas)
{
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 *
 * @param canvas
 * @param {Function} modFunc
 * @param brush
 */
function modifyImageData(canvas, modFunc, brush)
{
    //noinspection JSUnresolvedVariable
    let start = performance.now();

    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (document.getElementById("brushRect").checked)
        brush = brush || new Rect(new Point(0, 0), new Point(canvas.width, canvas.height));
    else if (document.getElementById("brushCircle").checked)
        brush = brush || new Circle(new Point(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)), Math.floor(canvas.width / 2));
    else
        throw new Error("wtf?");


    let iterations = parseInt(document.getElementById('iterations').value);
    for(let i = 0; i < iterations; i++)
    {
        modFunc(imageData, brush);
    }
    ctx.putImageData(imageData, 0, 0);

    //noinspection JSUnresolvedVariable
    let stop = performance.now();

    document.getElementById("timeTaken").textContent = (stop - start).toFixed(2) + "ms";
}

/**
 * Assign the r/g/b/a values from a Pixel object to the specified offset
 * @param {Uint8ClampedArray} data
 * @param {number} offset
 * @param {Pixel} newPixel
 */
function setPixel(data, offset, newPixel)
{
    setRGBA(data, offset, newPixel.r, newPixel.g, newPixel.b, newPixel.a);
}

/**
 * Assign the passed r/g/b/a values to the specified offset
 * @param {Uint8ClampedArray} data
 * @param {number} offset
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
function setRGBA(data, offset, r, g, b, a)
{
    data[offset/**/] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = a;
}

/**
 * Assign the r/g/b/a values from a Pixel object to a block of pixels
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} offset
 * @param {Pixel} newPixel
 * @param {number} blockWidth
 */
function setBlockPixel(data, width, offset, newPixel, blockWidth)
{
    setBlockRGBA(data, width, offset, newPixel.r, newPixel.g, newPixel.b, newPixel.a, blockWidth);
}

/**
 * Assign the passed r/g/b/a values to a block of pixels
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} offset
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 * @param {number} blockWidth
 */
function setBlockRGBA(data, width, offset, r, g, b, a, blockWidth)
{
    for(let i = 0; i < blockWidth; i++)
    {
        for(let j = 0; j < blockWidth; j++)
        {
            let blockOffset = xyToOffset(i, j, width);
            setRGBA(data, offset + blockOffset, r, g, b, a);
        }
    }
}

/**
 * Return the average RGBA of a block of pixels
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} offset
 * @param {number} blockWidth
 * @returns {RGBA}
 */
function getBlockMean(data, width, offset, blockWidth)
{
    let rgba = new RGBA(0, 0, 0, 0); // TODO: This can be merged with blendRGBA()
    let count = blockWidth * blockWidth;
    for(let i = 0; i < blockWidth; i++)
    {
        for(let j = 0; j < blockWidth; j++)
        {
            let curPx = new Pixel(data, offset + xyToOffset(i, j, width));
            rgba.r += curPx.r;
            rgba.g += curPx.g;
            rgba.b += curPx.b;
            // rgba.a += curPx.a;
        }
    }
    rgba.r /= count;
    rgba.g /= count;
    rgba.b /= count;

    return rgba;
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
 * @param {number} offsetA
 * @param {number} offsetB
 * @param {number} blockSize
 */
function swapBlocks(data, width, offsetA, offsetB, blockSize)
{
    for(let i = 0; i < blockSize; i++)
    {
        for(let j = 0; j < blockSize; j++)
        {
            let blockOffset = ((i + j * width) * 4);
            swapPixels(data, offsetA + blockOffset, offsetB + blockOffset);
        }
    }
}

/**
 *
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {Point} blockP1
 * @param {Point} blockP2
 * @param rng
 * @param {number} blockSize
 */
function swapShuffleBlocks(data, width, blockP1, blockP2, rng, blockSize)
{
    let b1 = new Rect(blockP1, new Point(blockP1.x + blockSize, blockP1.y + blockSize));
    let b2 = new Rect(blockP2, new Point(blockP2.x + blockSize, blockP2.y + blockSize));
    let points1 = b1.getPoints();
    points1.shift(); // Don't include the first point

    let points2 = b2.getPoints();
    points2.shift(); // Don't include the first point

    while (points1.length > 0)
    {
        let p1 = popRandom(points1, rng);
        let p2 = popRandom(points2, rng);

        swapPixels(data, p1.getOffset(width), p2.getOffset(width));
    }
}

/**
 *
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {Point} blockULPoint
 * @param rng
 * @param {number} blockSize
 */
function innerShuffleBlock(data, width, blockULPoint, rng, blockSize)
{
    let block = new Rect(blockULPoint, new Point(blockULPoint.x + blockSize, blockULPoint.y + blockSize));
    let points = block.getPoints();

    while (points.length > 0)
    {
        let p1 = popRandom(points, rng);
        let p2 = popRandom(points, rng);

        swapPixels(data, p1.getOffset(width), p2.getOffset(width));
    }
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

function calcError()
{
    // Interesting...apparently pixel values may differ slightly even using the same source image
    // http://stackoverflow.com/questions/23565889/jpeg-images-have-different-pixel-values-across-multiple-devices
    // So I guess we need to ignore differences under a certain threshold.  2 per channel (6) seems to work.
    const THRESHOLD = 6;

    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    let olCanvas = document.getElementById("overlay");
    let olCtx = olCanvas.getContext("2d");
    let olImgData = olCtx.getImageData(0, 0, olCanvas.width, olCanvas.height);

    let tempCanvas = document.createElement("canvas");
    imgToCanvas(document.getElementById("original-image"), tempCanvas);
    let tempCtx = tempCanvas.getContext("2d");

    let imageData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imageData2 = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data1 = imageData1.data;
    let data2 = imageData2.data;
    let totalErr = 0;

    // assuming they're the same size...
    for(let i = 0; i < data2.length; i = i + 4)
    {
        let err =
            Math.abs(data1[i] - data2[i]) +
            Math.abs(data1[i+1] - data2[i+1]) +
            Math.abs(data1[i+2] - data2[i+2]);

        if(err > THRESHOLD)
        {
            totalErr = totalErr + err;
            // Show the error on the overlay
            olImgData.data[i]   = 255 - data2[i];
            olImgData.data[i+1] = 255 - data2[i+1];
            olImgData.data[i+2] = 255 - data2[i+2];
            olImgData.data[i+3] = Math.min(err / 765 * 255 + 128, 255);
        }
    }
    document.getElementById("error").textContent = (totalErr / 1000000).toString();
    olCtx.putImageData(olImgData, 0, 0);
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

/********************************/
/* Image Manipulation Functions */
/********************************/

/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function extract(imageData, brush)
{
    // const r = 255;
    // const g = 255;
    // const b = 255;
    // const a = 255;
    const extractedBlockWidth = 8;

    let data = imageData.data;
    let width = imageData.width;
    let blockSize = parseInt(document.getElementById('blockSize').value);

    brush = alignBrush(brush, width, imageData.height, blockSize);
    shuffle_stable(imageData, brush);

    let brushWidth = brush.getWidth();
    let brushHeight = brush.getHeight();

    let extractedCanvas = document.getElementById("extractedCanvas");
    extractedCanvas.width = brushWidth * extractedBlockWidth;
    extractedCanvas.height = brushHeight * extractedBlockWidth;

    let extractedCtx = extractedCanvas.getContext("2d");
    let extractedImageData = extractedCtx.getImageData(0, 0, extractedCanvas.width, extractedCanvas.height);
    let extractedWidth = extractedImageData.width;
    let extractedData = extractedImageData.data;

    let points = brush.getPoints();
    for(let i = 0; i < points.length; i++)
    {
        let point = points[i];
        let px = new Pixel(data, point.getOffset(width));
        let extractedCanvasOffset = xyToOffset(i % brushWidth, Math.floor(i / brushWidth), extractedWidth) * extractedBlockWidth;

        // Draw a border around the pixel
        // setRGBA(extractedData, extractedCanvasOffset                                   , r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(1, 0, extractedWidth), r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(2, 0, extractedWidth), r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(0, 1, extractedWidth), r, g, b, a);
        // setPixel(extractedData, extractedCanvasOffset+ xyToOffset(1, 1, extractedWidth), px);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(2, 1, extractedWidth), r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(0, 2, extractedWidth), r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(1, 2, extractedWidth), r, g, b, a);
        // setRGBA(extractedData, extractedCanvasOffset + xyToOffset(2, 2, extractedWidth), r, g, b, a);

        // Draw a block of pixels with the same rgba
        setBlockPixel(extractedData, extractedWidth, extractedCanvasOffset, px, extractedBlockWidth);
    }

    extractedCtx.putImageData(extractedImageData, 0, 0);
}

function intract(imageData, brush)
{
    const EXTRACTED_BLOCK_WIDTH = 8;

    let data = imageData.data;
    let width = imageData.width;
    let blockSize = parseInt(document.getElementById('blockSize').value);

    brush = alignBrush(brush, width, imageData.height, blockSize);

    let brushWidth = brush.getWidth();
    let brushHeight = brush.getHeight();

    let extractedCanvas = document.getElementById("extractedCanvas");
    extractedCanvas.width = brushWidth / EXTRACTED_BLOCK_WIDTH;
    extractedCanvas.height = brushHeight / EXTRACTED_BLOCK_WIDTH;

    let extractedCtx = extractedCanvas.getContext("2d");
    let extractedImageData = extractedCtx.getImageData(0, 0, extractedCanvas.width, extractedCanvas.height);
    let extractedData = extractedImageData.data;

    let points = brush.getPoints(EXTRACTED_BLOCK_WIDTH);
    for(let i = 0; i < points.length; i++)
    {
        let point = points[i];
        let extractedCanvasOffset = i * 4;

        let rgba = getBlockMean(data, width, point.getOffset(width), EXTRACTED_BLOCK_WIDTH);

        setRGBA(extractedData, extractedCanvasOffset, rgba.r, rgba.g, rgba.b, rgba.a);
    }

    extractedCtx.putImageData(extractedImageData, 0, 0);
}

function test(imageData, brush)
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

        let ycbcr = new YCBCR(data[i/**/], data[i + 1], data[i + 2]);
        ycbcr.y = ycbcr.y ^ Math.round((255 * prng()));
        // ycbcr.cb = ycbcr.cb ^ (255 * prng());
        // ycbcr.cr = ycbcr.cr ^ (255 * prng());
        let rgb = ycbcr.rgb();

        data[i/**/] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
    }
}

// /**
//  *
//  * @param imageData {ImageData}
//  * @param {Rect} brush
//  */
// function test(imageData, brush)
// {
//     let data = imageData.data;
//     let width = imageData.width;
//
//     // Calculate the difference for each pixel
//     // TODO: If this works at all, it will only be for rectangles
//     let xlen = brush.lr.x - brush.ul.x;
//     let ylen = brush.lr.y - brush.ul.y;
//
//     let diffs = [];
//     for (let y = 0; y < ylen; y++)  // TODO: fix awkward array indices
//     {
//         diffs[y] = [];
//         for (let x = 0; x < xlen; x++)
//         {
//             diffs[y][x] = calcAdjacencyDifference(data, width, new Point(brush.ul.x + x, brush.ul.y + y));
//         }
//     }
//
//     // Calculate the total difference for each row and column
//     let colDiffs = [];
//     for (let y = 0; y < ylen; y++)
//     {
//         colDiffs[y] = 0;
//         for (let x = 0; x < xlen; x++)
//         {
//             colDiffs[y] += diffs[y][x];
//         }
//     }
//
//     let rowDiffs = [];
//     for (let x = 0; x < xlen; x++)
//     {
//         rowDiffs[x] = 0;
//         for (let y = 0; y < ylen; y++)
//         {
//             rowDiffs[x] += diffs[y][x];
//         }
//     }
//
//     // Normalize
//     // let minCol = Math.min.apply(null, colDiffs);
//     // for(let i = 0; i < colDiffs.length; i++)
//     // {
//     //     colDiffs[i] -= minCol;
//     // }
//     //
//     // let minRow = Math.min.apply(null, rowDiffs);
//     // for(let i = 0; i < rowDiffs.length; i++)
//     // {
//     //     rowDiffs[i] -= minRow;
//     // }
//
//     // Find the change from the adjacent rows
//     let colDeltas = [];
//     let colDeltas1 = [];
//     for(let i = 0; i < colDiffs.length; i++)
//     {
//         colDeltas[i] = Math.abs(colDiffs[i] - colDiffs[i - 1]) || 0;
//         colDeltas1[i] = Math.abs(colDiffs[i] - colDiffs[i + 1]) || 0;
//     }
//
//     let rowDeltas = [];
//     let rowDeltas1 = [];
//     for(let i = 0; i < rowDiffs.length; i++)
//     {
//         rowDeltas[i] = Math.abs(rowDiffs[i] - rowDiffs[i - 1]) || 0;
//         rowDeltas1[i] = Math.abs(rowDiffs[i] - rowDiffs[i + 1]) || 0;
//     }
//
//     // I don't know what I'm doing
//     let colULValues = [];
//     let colLRValues = [];
//     for(let i = 0; i < colDiffs.length; i++)
//     {
//         colULValues[i] = colDeltas[i] - colDeltas1[i];
//         colLRValues[i] = -colULValues[i];
//     }
//
//     let rowULValues = [];
//     let rowLRValues = [];
//     for(let i = 0; i < colDiffs.length; i++)
//     {
//         rowULValues[i] = colDeltas[i] - colDeltas1[i];
//         rowLRValues[i] = -rowULValues[i];
//     }
//
//     // Make a guess
//     let ulGuess = new Point(indexOfMax(rowULValues) + brush.ul.x, indexOfMax(colULValues) + brush.ul.y);
//     let lrGuess = new Point(indexOfMax(rowLRValues) + brush.ul.x, indexOfMax(colLRValues) + brush.ul.y);
//
//     document.getElementById("p1Guess").textContent = ulGuess.toString();
//     document.getElementById("p2Guess").textContent = lrGuess.toString();
//
//     let brushGuess = new Rect(ulGuess, lrGuess);
//     let ctx = document.getElementById("overlay").getContext("2d");
//     brushGuess.draw(ctx);
// }

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
function shuffle_blocks(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let height = data.length / width / 4;
    let blockSize = parseInt(document.getElementById('blockSize').value);

    // Use a key if one is specified
    let keyStr = document.getElementById('key').value;

    //noinspection JSUnresolvedFunction,JSPotentiallyInvalidConstructorUsage
    let rng = keyStr === '' ? Math.random : new Math.seedrandom(keyStr);

    let newBrush = alignBrush(brush, width, height, blockSize);

    let points = newBrush.getPoints(blockSize);
    while (points.length > 1)
    {
        let p1 = popRandom(points, rng);
        let p2 = popRandom(points, rng);

        let p1offset = p1.getOffset(width);
        let p2offset = p2.getOffset(width);

        swapBlocks(data, width, p1offset, p2offset, blockSize);

        // swapShuffleBlocks(data, width, p1, p2, rng, blockSize);
    }
}

/**
 * Returns a new brush based on the input brush aligned to the nearest block boundaries
 * @param brush
 * @param {number} width
 * @param {number} height
 * @param {number} blockSize
 * @returns {Rect}
 */
function alignBrush(brush, width, height, blockSize)
{
    // Round the brush area to the nearest block boundary
    let ul = new Point(blockSize * Math.round(brush.ul.x / blockSize), blockSize * Math.round(brush.ul.y / blockSize));
    let lr = new Point(blockSize * Math.round(brush.lr.x / blockSize), blockSize * Math.round(brush.lr.y / blockSize));

    // Make sure the lr block doesn't cross over the image boundary
    // TODO: This means that the right/lower edges won't be shuffled.  Not ideal, but preserves the image
    if (lr.x > width)
    {
        lr.x = lr.x - blockSize;
    }

    if (lr.y > height)
    {
        lr.y = lr.y - blockSize;
    }

    return new Rect(ul, lr);
}
/**
 *
 * @param imageData {ImageData}
 * @param brush
 */
function inner_shuffle_blocks(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let height = data.length / width / 4;
    let blockSize = parseInt(document.getElementById('blockSize').value);

    // Use a key if one is specified
    let keyStr = document.getElementById('key').value;

    //noinspection JSUnresolvedFunction,JSPotentiallyInvalidConstructorUsage
    let rng = keyStr === '' ? Math.random : new Math.seedrandom(keyStr);
    let newBrush = alignBrush(brush, width, height, blockSize);

    let points = newBrush.getPoints(blockSize);
    for (let i = 0; i < points.length; i++)
    {
        let point = points[i];
        innerShuffleBlock(data, width, point, rng, blockSize);
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



    // Test different methods...
    // method1(brush, rng, data, width);
    method2(brush, rng, data, width);
    // method3(brush, rng, data, width);
    // method4(brush, rng, data, width);
    // method5(brush, rng, data, width);
}

// function method1(brush, rng, data, width)
// {
//     let points = brush.getPoints();
//     while (points.length > 1)
//     {
//         let p1 = points.splice(Math.floor(points.length * rng()), 1)[0];
//         let p2 = points.splice(Math.floor(points.length * rng()), 1)[0];
//
//         swapPixels(data, p1.getOffset(width), p2.getOffset(width));
//     }
// }

function method2(brush, rng, data, width)
{
    let points = brush.getPoints();
    while (points.length > 1)
    {
        let p1 = popRandom(points, rng);
        let p2 = popRandom(points, rng);

        swapPixels(data, p1.getOffset(width), p2.getOffset(width));
    }
}

// function method3(brush, rng, data, width)
// {
//     let points = brush.getPoints();
//     shuffleArray(points, rng);
//     for(let i = 0; i < points.length; i = i + 2)
//     {
//         swapPixels(data, points[i].getOffset(width), points[i+1].getOffset(width))
//     }
// }
//
// function method4(brush, rng, data, width)
// {
//     let points = brush.getPoints();
//     shuffleArray2(points, rng);
//     for(let i = 0; i < points.length; i = i + 2)
//     {
//         swapPixels(data, points[i].getOffset(width), points[i+1].getOffset(width))
//     }
// }
//
// function method5(brush, rng, data, width)
// {
//     let view = new Uint32Array(data.buffer, brush.ul.getOffset(width));
//     shuffleArray2(view, rng);
// }


// /**
//  * Shuffles array in place. ES6 version
//  * @param {Array|Uint32Array} a items The array containing the items.
//  * @param rng the RNG function
//  */
// function shuffleArray(a, rng) {
//     for (let i = a.length; i; i--) {
//         let j = Math.floor(rng() * i);
//         [a[i - 1], a[j]] = [a[j], a[i - 1]];
//     }
// }
//
// function shuffleArray2(array, rng) {
//     let counter = array.length;
//
//     // While there are elements in the array
//     while (counter > 0) {
//         // Pick a random index
//         let index = Math.floor(rng() * counter);
//
//         // Decrease counter by 1
//         counter--;
//
//         // And swap the last element with it
//         let temp = array[counter];
//         array[counter] = array[index];
//         array[index] = temp;
//     }
//
//     return array;
// }

function popRandom(arr, rng)
{
    let max = arr.length;
    let i = Math.floor(max * rng());
    let temp = arr[max - 1];
    arr[max - 1] = arr[i];
    arr[i] = temp;
    return arr.pop();
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

// Well crap: http://stackoverflow.com/questions/5883220/canvas-putimagedata-color-loss-with-no-low-alpha?rq=1
// http://stackoverflow.com/questions/23497925/how-can-i-stop-the-alpha-premultiplication-with-canvas-imagedata
// https://www.reddit.com/r/javascript/comments/2ti79o/canvas_putimagedata_and_getimagedata_alter_data/
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

        data[i/**/] = data[i/**/] ^ (256 * prng());
        data[i + 1] = data[i + 1] ^ (256 * prng());
        data[i + 2] = data[i + 2] ^ (256 * prng());
        // data[i + 3] = data[i + 3] ^ (256 * prng()); // Including transparency causes dead pixels for some reason
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

/**
 *
 * @param {ImageData} imageData
 * @param brush
 */
function encrypt_blocks(imageData, brush)
{
    let data = imageData.data;
    let width = imageData.width;
    let height = data.length / width / 4;
    let blockSize = parseInt(document.getElementById('blockSize').value);

    let keyStr = document.getElementById('key').value;

    //noinspection JSUnresolvedFunction,JSPotentiallyInvalidConstructorUsage
    let prng = new Math.seedrandom(keyStr);

    let newBrush = alignBrush(brush, width, height, blockSize);

    let points = newBrush.getPoints(blockSize);
    for (let i = 0; i < points.length; i++)
    {
        encryptBlock(data, width, points[i], prng, blockSize);
    }
}

/**
 *
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {Point} blockULPoint
 * @param rng
 * @param {number} blockSize
 */
function encryptBlock(data, width, blockULPoint, rng, blockSize)
{
    let block = new Rect(blockULPoint, new Point(blockULPoint.x + blockSize, blockULPoint.y + blockSize));
    let points = block.getPoints();

    let randomNums = [];
    randomNums.push(256 * rng());
    randomNums.push(256 * rng());
    randomNums.push(256 * rng());
    for (let i = 0; i < points.length; i ++)
    {
        let point = points[i];
        let pixel = Pixel.fromPoint(data, width, point);

        pixel.r = pixel.r ^ randomNums[0];
        pixel.g = pixel.g ^ randomNums[1];
        pixel.b = pixel.b ^ randomNums[2];

        setPixel(data, pixel.offset, pixel);
    }
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

    /**
     *
     * @param {string} str
     * @returns {Point}
     */
    static fromString(str)
    {
        let matches = str.match(/(\d+),\s*(\d+)/);
        if(matches && matches.length == 3)
        {
            return new Point(parseInt(matches[1]), parseInt(matches[2]));
        }
        else
            return null;
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

    this.getWidth = function getWidth(){ return this.lr.x - this.ul.x };
    this.getHeight = function getHeight(){ return this.lr.y - this.ul.y };

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
    this.getPoints = function getPoints(blockSize)
    {
        blockSize = blockSize || 1;
        let points = [];
        for (let y = this.ul.y; y < this.lr.y; y = y + blockSize)
        {
            for (let x = this.ul.x; x < this.lr.x; x = x + blockSize)
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
        point.x = Math.floor(rng() * (this.getWidth())) + this.ul.x;
        point.y = Math.floor(rng() * (this.getHeight())) + this.ul.y;

        return point;
    };

    /**
     * Draw this shape using the passed context
     * @param {CanvasRenderingContext2D} ctx
     */
    this.draw = function draw(ctx)
    {
        ctx.strokeRect(this.ul.x, this.ul.y, this.getWidth(), this.getHeight());
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

    /**
     * Draw this shape using the passed context
     * @param {CanvasRenderingContext2D} ctx
     */
    this.draw = function draw(ctx)
    {
        ctx.beginPath();
        ctx.arc(this.center.x,
            this.center.y,
            this.radius,
            0,
            2 * Math.PI);
        ctx.stroke();
    };

    this.toString = function toString()
    {
        return '{center:' + this.center.toString() + ', radius:' + this.radius.toString() + '}';
    }
}

class RGBA
{
    constructor(r, g, b, a)
    {
        this.r = r; // Red
        this.g = g; // Green
        this.b = b; // Blue
        this.a = a; // Alpha
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
     * @returns {Pixel}
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

// From the docs
function YCBCR(r, g, b) {
    this.y  = Math.min(Math.max(0, Math.round(/*0 +*/ (0.299 * r)  + (0.587 * g)  + (0.114 *  b))), 255);
    this.cb = Math.min(Math.max(0, Math.round(128 -   (0.1687 * r) - (0.3313 * g) + (0.5 *    b))), 255);
    this.cr = Math.min(Math.max(0, Math.round(128 +   (0.5 * r)    - (0.4187 * g) - (0.0813 * b))), 255);
}

YCBCR.prototype.rgb = function rgbPrecise() {
    let r = Math.min(Math.max(0, Math.round(this.y + 1.402  * (this.cr - 128))), 255);
    let g = Math.min(Math.max(0, Math.round(this.y - 0.3441 * (this.cb - 128) - 0.7141 * (this.cr - 128))), 255);
    let b = Math.min(Math.max(0, Math.round(this.y + 1.772  * (this.cb - 128))), 255);

    return [r, g, b];
};



// https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
// function YCBCR(r, g, b) {
//     this.y  = /*0 + */(0.299 * r) + (0.587 * g)  +  (0.114 * b);
//     this.cb = 128 - (0.168736 * r) - (0.331264 * g) + (0.5 * b);
//     this.cr = 128 + (0.5 * r) - (0.418688 * g) - (0.081312 * b);
// }
//
// YCBCR.prototype.rgb = function rgbPrecise() {
//     let r = this.y + 1.402 * (this.cr - 128);
//     let g = this.y - 0.344136 * (this.cb - 128) - 0.714136 * (this.cr - 128);
//     let b = this.y + 1.772 * (this.cb - 128);
//
//     return [r, g, b]
// };

// from some site...
// function YCBCR(r, g, b) {
//     this.y  = ( .299 * r + .587 * g  +  0.114 * b) + 0;
//     this.cb = ( -.169 * r + -.331 * g +  0.500 * b) + 128;
//     this.cr = ( .500 * r + -.419 * g +  -0.081 * b) + 128;
// }
//
// YCBCR.prototype.rgb = function rgbPrecise() {
//     var y = this.y, cb = this.cb, cr = this.cr;
//
//     var r = 0;
//     var g = 0;
//     var b = 0;
//
//     var r = 1 * y +  0 * (cb-128)      +  1.4 * (cr-128);
//     var g = 1 * y +  -.343 * (cb-128)  +  -.711 * (cr-128);
//     var b = 1 * y +  1.765 * (cb-128)  +  0 * (cr-128);
//
//     return [r, g, b]
// };
