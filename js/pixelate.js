//TODO
//image uploader
//create grid of instagram images

// Grab the Canvas and Drawing Context
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
//var play = false;

// Create an image element
var img = new Image();
var initialImageURL = 'http://i.imgur.com/F4dJfmU.jpg'

// When the window first loads - draw the initial demo image
// var something = (function() {
//     var executed = false;
//     return function () {
//         if (!executed) {
//             executed = true;
//             window.onload = draw(initialImageURL);
//         }
//     };
// }) ();

window.onload = draw(initialImageURL);
console.log("inital image drawn");

function draw (imgURL) {
    // Specify the src to load the image
    img.crossOrigin="anonymous";
    img.src = imgURL;

    img.onload = function() {
        canvas.height = img.height/4;
        canvas.width = img.width/4;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pixelate();
    };
}

function pixelate() {
    canvas.height = img.height/4;
    canvas.width = img.width/4;

    /// if in play mode use that value, else use slider value
    var size = (blocks.value) * 0.01,

        /// cache scaled width and height
        w = canvas.width * size,
        h = canvas.height * size;

    /// draw original image to the scaled size
    ctx.drawImage(img, 0, 0, w, h);
    
    /// then draw that scaled image thumb back to fill canvas
    /// As smoothing is off the result will be pixelated
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}

// event listeneners for slider
blocks.addEventListener('change', pixelate, false);

function submitImageURL() {
    var imgURL = document.getElementById("ImageURL").value;

    if (imgURL == null || imgURL == "") {
        alert("Image URL must be filled out");
        return false;
    }

    console.log("submit "  + imgURL);

    var img = new Image();
    img.onload = draw(imgURL);
    console.log("drawn" + imgURL);

}

/// poly-fill for requestAnmationFrame with fallback for older
/// browsers which do not support rAF.
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();