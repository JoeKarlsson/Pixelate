# Pixelate

Turn a photo into big square pixels, then save it as a PNG. Live at https://pixelate.joekarlsson.com.

Everything happens in the browser: the photo is decoded as an image on your device and never uploaded. How the pixelating works is written up in [How to pixelate images with HTML5 and JavaScript](https://www.joekarlsson.com/blog/how-to-pixelate-images-with-html5-and-javascript/).

## Layout

- `site/` is the whole website (plain HTML, CSS and JS, no build step). `site/js/pixelate-math.js` holds the size math; `site/js/pixelate.js` wires up the page.
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
