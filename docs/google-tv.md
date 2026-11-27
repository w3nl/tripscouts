# TripScouts on the TV (Google TV Streamer)

There are four ways to play on the TV. All four work with the remote (arrows, OK and Back) and with a controller (PlayStation, Stadia, Xbox).

| | What | Needed |
|---|---|---|
| 1 | The game in a browser app on the Google TV | The site online (GitHub Pages) and a browser app |
| 2 | Casting from a laptop, phone or tablet | Chrome or the Google Home app |
| 3 | The **TripScouts** app on the home screen | The Downloader app (once) |
| 4 | The same app from Google Play, with automatic updates | A Google Play developer account |

## Controls on the TV

| | Remote | Controller |
|---|---|---|
| Choose in a menu | arrows | stick or D-pad |
| Press | OK | ✕ / A |
| Walk | ← → | stick or D-pad |
| Run | double-tap ← / → and hold | hold L1/R1 or L2/R2, or double-tap and hold |
| Jump | ↑ | ✕ / A |
| Talk, read, use | OK or ↓ | □ / X or ○ / B |
| Belly slide | walk + ↓ (or OK) | walk + ↓ (or □ / ○) |
| Back or to the menu | Back | ○ / B (menus), Start (game) |

In every menu the gold outline is on a button right away, so you always see where you are.

## Pairing a controller with the Google TV

1. Settings → **Remotes & Accessories** → **Pair accessory**.
2. **PS4 controller:** hold **Share** and the **PS button** until the light flashes quickly. Pick it in the list.
3. **Stadia controller:** only works over Bluetooth after switching it to Bluetooth mode (on Google's Stadia page, with a USB cable and Chrome on a computer). Then hold **Y** and the **Stadia button** until the light flashes orange.

## 1. In a browser app

1. Put the game online: see [domain.md](domain.md). It is at `https://tripscouts.online/`.
2. Install a browser from the Play Store on the Google TV, for example **TV Bro**.
3. Open `tripscouts.online` and play with the remote or a controller.

Whether a controller works in such a browser depends on the browser. If not, use the remote, or the app (3).

## 2. Casting

- **From a laptop:** open the game in Chrome, choose **⋮ → Cast → Cast tab** and the Google TV. You play on the laptop and watch on the TV, with a small delay.
- **From an Android phone or tablet:** open the **Google Home app**, choose the Google TV and **Cast my screen**. Then open the game.
- **iPhone and iPad** cannot cast to a Google TV directly; use way 1 or 3.

## 3. The app on the Google TV

The workflow *Build the Android app* (`google-tv.yml`) builds **one Android app** with the whole game inside on every change. It is the same app for phone, tablet, Google TV and compatible Chromebooks (on the TV it has its own tile on the home screen); this page only covers the TV part. For Chrome OS, see [chromebook.md](chromebook.md). It works offline. On `main` every build becomes its own release, **android-v1.&lt;build&gt;** (the same number as the app's version), with `cabin-week.apk`. Releases in this repository are immutable (they can't be changed once published), so the app is never replaced in an old release. The short, fixed address for the newest one is:

`tripscouts.online/android`

That page (`android/index.html` on the site) asks GitHub for the newest Android release and sends you to its `.apk`. If that doesn't work, it opens the list of releases: pick the newest *Android app*. (Until November 2026 the app was in one release, **google-tv**, that was updated every time. That release is no longer updated.)

**Once on the Google TV:**

1. Turn on developer options: Settings → System → About → tap **Android TV OS build** **7 times**.
2. Install **Downloader** (by AFTVnews) from the Play Store.
3. Settings → Apps → **Security & restrictions** → **Unknown sources** → turn on **Downloader**.

**Install or update:** open Downloader, type the address above, choose **Go** and then **Install**.

**Updating:** without a fixed key GitHub signs every version with a different key, so remove the old app first (your progress goes too). To install over the old one, make a fixed key once and store it as repository secrets.

### A fixed (upload) key

The key signs the app. With it, an update installs over the old app, and Google Play accepts the bundle. See **[android-key.md](android-key.md)** for every step: making the key, putting it in GitHub, and getting the bundle.

**How the app works:** `android-tv/` is a small Android app (Java) with one WebView. The game is in the app (`assets/game`, put there by the workflow) and is loaded from `https://appassets.androidplatform.net/…`, so saving works. The remote sends ordinary arrow keys and Enter. A controller is passed on by the app as `window.__nativePad` (standard layout), at most once per frame with a counter per button, so a quick tap always counts. The Back button calls `window.tvBack()`; on the title screen it closes the app.

## 4. Through Google Play (internal test)

**The complete checklist is in [publish-android.md](publish-android.md).** Below is a summary.

Google Play wants an **app bundle (`.aab`)** signed with a fixed **upload key** (above). With the secrets in place, the workflow builds `cabin-week.aab`. It is **not public**: it is only in the workflow artifact `cabin-week-google-play`, as a 7z file with your `ANDROID_KEYSTORE_PASSWORD` as password (see [android-key.md](android-key.md)). Only the `.apk` is on the public release.

### Once: Google Play Console

1. **Create app:** name "TripScouts", default language English (United Kingdom) – en-GB (add Dutch as a translation), type **Game**, **free**.
2. **Turn on Android TV:** Test and release → Advanced settings → Form factors → add **Android TV**. Without this the app does not show up in the Play Store on the Google TV.
3. **The required questions** (content rating, target audience, data safety, privacy policy `https://tripscouts.online/privacy.html`): all answers, texts and images are in [play-store/](play-store/README.md).
4. **Play App Signing** is on by default: Google keeps the real signing key; you upload with your upload key.

### Upload a version and share it

1. Test and release → **Internal testing** → **Testers**: make an email list with the Google accounts of your testers (up to 100).
2. **Create new release** → upload `cabin-week.aab` (from the artifact) → save → **Publish**. An internal test is usually available within minutes.
3. Copy the **opt-in link** and share it. Everyone opens it once and taps "Become a tester".
4. A new version: upload the new `.aab` in a new release. The version number goes up by itself (the GitHub build number).

### Install on the Google TV Streamer

1. Check that the release is also available for **Android TV** (Internal testing → Releases). Just turned on? It can take an hour.
2. The Google account on the TV (**Settings → Accounts & sign-in**) must be on the tester list and have chosen **Become a tester**.
3. Remove an app installed earlier with Downloader: Google Play signs with a different key.
4. Install: from the phone (Play Store → TripScouts → **Install on more devices** → the Google TV Streamer), from the computer (play.google.com → **Install** → the TV), or on the TV (Play Store → search "TripScouts").
5. Move the tile to the home screen: **Apps → Your apps**, hold OK on the tile → **Move** or **Add to favourites**.

**"Not available for this device"** almost always means: Android TV is not turned on in Play Console yet, or the TV is signed in with an account that is not a tester.

Good to know:
- The package name (`nl.w3nl.cabinweek`) is fixed forever after the first upload.
- Google Play raises the required Android version every year. The app targets Android 16 (API 36). If Play Console asks for higher, raise `compileSdk` and `targetSdk` in `android-tv/app/build.gradle.kts`.
- A public (production) release has extra requirements for new personal accounts, such as a closed test with at least 12 testers for 14 days first.
