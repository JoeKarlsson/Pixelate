# Pixelate

Turn a photo into big square pixels, then save it as a PNG. Live at https://pixelate.joekarlsson.com.

![Pixelate: picking a selfie of me in sunglasses holding a pink soft-serve cone at a fair, then dragging the block size slider from 2px up to 90px and back down to 30px as the photo goes from sharp to big blocks of color](.github/readme/2026-11-recording.gif)

What Pixelate looked like in November 2026, recorded for [its page on joekarlsson.com](https://www.joekarlsson.com/work/pixelate/). The full-quality video is [2026-11-recording.mp4](.github/readme/2026-11-recording.mp4).

## Artist statement

Pixelate turns any photo into big square blocks, and the photo never leaves your phone or computer. Drag the slider and the picture gives up its detail a little at a time, until it's a grid of colors.

[Read the full statement](https://www.joekarlsson.com/work/pixelate/).

Everything happens in the browser: the photo is decoded as an image on your device and never uploaded. How the pixelating works is written up in [How to pixelate images with HTML5 and JavaScript](https://www.joekarlsson.com/blog/how-to-pixelate-images-with-html5-and-javascript/).

![The Pixelate page in pink on black: a Choose File button, a block size slider set to 24px and a Save PNG button, over the fair selfie turned into square blocks](.github/readme/2026-11-app.webp)

## Layout

- `site/` is the whole website (plain HTML, CSS and JS, no build step), with the artist statement on `site/about.html`. `site/js/pixelate-math.js` holds the size math; `site/js/pixelate.js` wires up the page.
- `tests/unit/` runs with `node --test`; `tests/e2e/` is Playwright (desktop Chrome, iPhone WebKit, Pixel Chrome) with axe.
- `scripts/make-images.mjs` renders the share card and PNG icons from `site/favicon.svg` and the example photo.

## Run it

```sh
npm install
npm run serve      # http://localhost:47391
npm test           # unit tests
npx playwright test
```

## Deploy

Pushing to `master` runs the tests and deploys `site/` to GitHub Pages with Actions. Bump `Expires` in `site/.well-known/security.txt` before it lapses; a unit test fails a month ahead.

Made by [Joe Karlsson](https://www.joekarlsson.com/). Code MIT.
