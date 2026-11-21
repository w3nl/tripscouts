# TripScouts on a Chromebook (Chrome OS)

There are three ways to install TripScouts. All use the existing game; there is no separate Chrome OS package or build workflow.

The game is also packaged as a Chrome extension for the Chrome Web Store, which works on a Chromebook too: see [chrome-web-store.md](chrome-web-store.md).

| Route | Needed | Updates |
|---|---|---|
| Web app (recommended) | Chrome and permission to install web apps | The website's service worker |
| Chrome extension | Chrome and access to the Chrome Web Store | The Chrome Web Store |
| Android app | A Chromebook with Google Play enabled and access to the game's testing track | Google Play, after a new bundle is published |

School or work administrators may block either installation route. The web game can still be played in a browser if the site is allowed.

## 1. Install from Chrome

1. Open [tripscouts.online](https://tripscouts.online/) in Chrome.
2. Wait for the title screen to load while online, so the service worker can cache the game.
3. Select the install icon in the address bar, or **Chrome menu → Cast, save, and share → Install page as app…** (wording may vary by Chrome version and language).
4. Confirm installation. TripScouts appears in the Chromebook launcher. Right-click its icon to pin it to the shelf.
5. Open the app from the launcher. It runs in its own window. After the initial cache has completed, the game works offline.

Use the normal window controls to maximise or close it. The game scales when the window is resized. Keyboard controls are the same as on a computer: arrows or A/D to walk, Space or up to jump, E or down to interact, and Escape for the game menu. Mouse/touchpad clicks work in menus; a touchscreen or controller can also be used.

When online, the web app checks for updates. Use the in-game update bar when offered. Closing the window keeps completed days and your saved hero; progress inside the current day is not saved.

## 2. Install the Chrome extension

Open [TripScouts in the Chrome Web Store](https://chromewebstore.google.com/detail/tripscouts/pcpdooenjphohflgmclkpachhfonjokc) in Chrome and select **Add to Chrome**. The extension adds a TripScouts button to the toolbar and opens the game in a browser tab. The game files are included, so it works offline after installation. Its progress is separate from the website and Android app.

## 3. Install the Android app through Google Play

This is the **same Android app** used on phones, tablets and Google TV, with package name `nl.w3nl.cabinweek`. A Chromebook must support Android apps and have the Play Store enabled. Not all Chromebooks do.

The app is currently in testing on Google Play:

1. Make sure the Google account used by the Chromebook's Play Store is on the tester list.
2. With that account, open the [test opt-in link](https://play.google.com/apps/testing/nl.w3nl.cabinweek) and join.
3. Open [TripScouts on Google Play](https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek) or search for it in the Chromebook's Play Store, then install.
4. Test keyboard input, mouse/touchpad menus, resizing and offline play before sharing Chromebook support more widely.

The game files are bundled in the app, so gameplay does not need an internet connection. The Android app and web app keep separate progress. Use **Progress** on the map and **Hero code** in the hero creator to transfer it between them.

## Publishing and compatibility checks

The existing **Build the Android app** workflow produces the APK and the protected signed AAB. Follow [publish-android.md](publish-android.md) to upload that AAB to the testing track. Merging code builds it but does **not** automatically publish it to Google Play.

The manifest is prepared for Chromebooks:

- Touchscreen, gamepad, TV and orientation hardware features are optional, so these declarations do not exclude non-touch laptops.
- `android.hardware.type.pc` is optional. On Chrome OS it requests native mouse/touchpad input without touch emulation; it does not restrict the app to PCs.
- `resizeableActivity="true"` allows resizing. The existing configuration-change handling preserves the WebView when the window changes size.
- There are no app-specific native libraries to restrict the bundle to ARM; the game uses the device's WebView.

In **Play Console → Device catalogue**, find the intended Chromebook models and check that the uploaded bundle supports them. If a model is excluded, inspect the stated reason and any manual device exclusions. Chromebook Android support, Android version, account access and administrator policy can still prevent installation.

**Google Play Games on PC is for Windows**, not Chromebook distribution. Do not enable it merely to support Chrome OS.

### Before claiming device support

On a real Google Play-enabled Chromebook:

- Install from the test track with an eligible account.
- Navigate menus with arrows and Enter, then walk, jump and interact using the keyboard.
- Click menus with a mouse/touchpad; check hero name typing.
- Resize and maximise the window during a level; it must stay playable without restarting the day.
- If available, test touch input and a paired controller.
- Complete a day, close and reopen the app, and confirm saved progress.
- Disconnect the network and start a level.
- Install a newer test release and verify progress is retained.

Browser tests can verify the PWA's offline behaviour and keyboard controls, but they do not certify the Android runtime or Play Store eligibility on Chrome OS.

## References

- [Google: install web apps on a Chromebook](https://support.google.com/chromebook/answer/9658361)
- [Android: Chrome OS manifest compatibility](https://developer.android.com/develop/devices/chromeos/learn/manifest)
- [Android: Chrome OS window management](https://developer.android.com/develop/devices/chromeos/learn/window-management)
