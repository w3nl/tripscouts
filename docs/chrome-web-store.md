# TripScouts in the Chrome Web Store

The Chrome extension is a small wrapper around the same game files as the website, like the Android and Linux apps:

- Install [TripScouts from the Chrome Web Store](https://chromewebstore.google.com/detail/tripscouts/pcpdooenjphohflgmclkpachhfonjokc).
- `chrome/background.js` opens the game in a tab when you click the TripScouts button in the toolbar (and once right after installing). If the game is already open, it brings that tab to the front.
- The game is **inside the extension**, so it works offline, also on a Chromebook. There is no service worker: it only runs on http(s), and the extension doesn't need one.
- It asks for **no permissions** and runs no code from elsewhere. Only the fonts come from Google Fonts; without internet the game uses the fallback fonts.
- Progress is saved in the extension, separate from the website. To bring it along, use 💾 *Progress* on the map and 💾 *Hero code* in the hero creator.
- The icons are in `chrome/chrome-icons/` (16, 32, 48 and 128 px), made by `npm run icons` from the TripScouts artwork.

## Building

```bash
npm run build:chrome
```

This makes `dist/tripscouts-chrome.zip` (to upload) and `dist/chrome/` (the same files unpacked). The version follows the game, like the Linux app: `GAME_VERSION` becomes `1.<GAME_VERSION>.0`. The Web Store only takes a higher version than the last upload, so raise `GAME_VERSION` before uploading again.

To try it first: open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked** and select `dist/chrome/`.

## Publishing, step by step

1. Sign in to the [Chrome Web Store developer dashboard](https://chromewebstore.google.com/devconsole) (a one-time registration fee applies).
2. **New item** → drop `dist/tripscouts-chrome.zip` where it says *Drop a ZIP or CRX file here*.
3. **Store listing:** the texts from [play-store/](play-store/) fit (English and Dutch), category *Games*. The images are in [chrome-store/](chrome-store/), made by `npm run store:chrome` (it leaves the Google Play images alone):
   - **Store icon:** `store-icon.png` (128×128: the artwork 96×96 with 16 px transparent space around it, as Google asks).
   - **Screenshots:** the five `screenshot-*.jpg` (1280×800, JPEG, so no alpha).
   - **Small promo tile:** `small-promo-tile.jpg` (440×280).
   - **Marquee promo tile** (optional): `marquee-promo-tile.jpg` (1400×560).
4. **Privacy:** single purpose "a platform game to play in a tab"; no permissions to justify; no data collected. Privacy policy: `https://tripscouts.online/privacy.html`.
5. **Distribution:** public, all regions. Submit for review.

For an update: build again with a higher `GAME_VERSION`, then **Package → Upload new package** on the item in the dashboard.
