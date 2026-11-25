# ASCII bouquet 💐

**Live:** https://mhmdabouaamo.github.io/Bouquet/

An animated bouquet of lilies, roses, tulips, gerberas, baby's breath and eucalyptus, drawn entirely out of text characters. A hidden message gathers inside the petals as the flowers bloom, a flash of light sweeps through, and a caption types itself out underneath.

No libraries, no build step: plain HTML, CSS and JavaScript.

## Run it

- Open `index.html` in any browser, or
- In VS Code, install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.

## Make your own

Edit `config.js`:

```js
const GIFT = {
  msg: 'Happy birthday',            // inside the petals (short)
  caption: 'Happy birthday, Sara',  // typed under the bouquet
  theme: 'pastel'                   // classic | pastel | sunset | moonlight
};
```

Set `msg: ''` to open playground mode, which has a theme picker, a message box, Re-bloom and Save PNG.

You can also change the message from the link itself, without touching the code:

```
https://mhmdabouaamo.github.io/Bouquet/#m=Happy%20birthday&c=Happy%20birthday%2C%20Sara&t=sunset
```

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `Bouquet`) and push these files to it.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute your bouquet is live at `https://mhmdabouaamo.github.io/Bouquet/`.

## How it works

1. Each frame, the flowers are drawn with ordinary canvas shapes (petals, gradients, lighting and shadows from a lamp at the top left) onto a tiny hidden canvas, 200 × 152 pixels. Each pixel there is one character cell.
2. Each cell's brightness picks a character from `.,:;-~=+*cslixozXO#%@`. Dark cells get light characters and bright cells get dense ones. Bright petal cells can show letters from the message instead.
3. Each row of characters is drawn in white in a single call, then the color image is painted over it with `source-in` so every character takes its cell's color. Drawing a whole row at once keeps about 30,000 characters smooth on a phone.

## Interaction

- Move or tap near the flowers and they lean away.
- Tap to send a ripple of light through the characters.
- Petals drift down once the bouquet has fully bloomed.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure |
| `style.css` | Layout and caption styling |
| `config.js` | Your message and theme |
| `bouquet.js` | Flowers, lighting, animation and the ASCII renderer |
