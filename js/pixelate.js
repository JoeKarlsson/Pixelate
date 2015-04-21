//Pixelate.js created by Joe Carlson Copyright 2015 - for non-commercial use only
// To Use: just plug in a website on the page and hit submit! Easy!
//Sample Images:
//
// https://i.imgur.com/DzxC2P2.jpg
//
// https://i.imgur.com/F4dJfmU.jpg
//
// https://i.imgur.com/nbM4Qhu.jpg
// Lil Bub
// http://i.imgur.com/4RBHmsi.jpg

// Grab the Canvas and Drawing Context
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Create an image element
var img = new Image();

//When the page first loads - draw the initial demo image
window.onload = firstDraw();

function firstDraw() {
    //preload the demo image
    var initialImageURL = 'https://i.imgur.com/3vfZPKL.jpg';
    draw(initialImageURL);
}

//takes any image URL and creates an un pixelated image /4 the orginal size of the image
function draw (imgURL) {
    // Specify the src to load the image
    img.crossOrigin="anonymous";
    img.src = imgURL;

    img.onload = function() {
        canvas.height = img.height/4;
        canvas.width = img.width/4;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log("image draw");
        pixelate();
    };
}

//
function pixelate() {
    //dynamically adjust canvas size to the size of the uploaded image
    canvas.height = img.height;
    canvas.width = img.width;

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


function submitImageURL() {
    var imgURL = document.getElementById("ImageURL").value;

    //veriy the form isn't black or null
    if (imgURL == null || imgURL == "") {
        alert("Image URL must be filled out");
        return false;
    }
    //verify that the address is secure
    if ( imgURL.search("/https:/") != -1 ) {
        alert("Image URL from https site (security reasons)");
        return false;  
    }

    //draw the submitted image onto the canvas
    draw(imgURL);
}

// event listeneners for slider
blocks.addEventListener('change', pixelate, false);

/// poly-fill for requestAnmationFrame with fallback for older
/// browsers which do not support rAF.
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();