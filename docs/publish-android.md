# Publishing the Android app: step by step

From nothing to TripScouts in Google Play (phone, tablet and Google TV). Do part A once; part D for every new version.

The same bundle can also serve compatible Chromebooks with Google Play. No separate Chrome OS build or Google Play Games on PC enrolment is needed; check device eligibility and test the app as described in [chromebook.md](chromebook.md).

Commands are for Ubuntu (Linux). Mac and Windows: see [android-key.md](android-key.md).

| Part | What | How often |
|---|---|---|
| A | The signing key in GitHub | once |
| B | The app in Google Play Console | once |
| C | The first version, for testers | once |
| D | A new version | every update |
| E | Public in Google Play (optional) | once |

---

## A. The signing key in GitHub (once)

Full explanation: [android-key.md](android-key.md). In short:

1. Install the tools:
   ```bash
   sudo apt install openjdk-21-jre-headless gh 7zip
   ```
2. Make the key. Use **one** password, and the same one if it asks twice:
   ```bash
   keytool -genkeypair -v -keystore ~/cabinweek.jks -alias cabinweek -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Check it (you see `cabinweek, …, PrivateKeyEntry`):
   ```bash
   keytool -list -keystore ~/cabinweek.jks -alias cabinweek
   ```
4. Back up `~/cabinweek.jks` and the password (password manager and a USB stick).
5. Give it to GitHub:
   ```bash
   gh auth login
   ```
   ```bash
   base64 -w0 ~/cabinweek.jks | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/tripscouts
   ```
   ```bash
   gh secret set ANDROID_KEYSTORE_PASSWORD --repo w3nl/tripscouts
   ```

---

## B. The app in Google Play Console (once)

1. **Developer account:** [play.google.com/console](https://play.google.com/console). If you already have one (for another app), use that. A new account costs $25 once, and Google checks your identity (can take a few days).
2. **Create app:** **Home → Create app**:
   - App name: `TripScouts`
   - Default language: **English (United Kingdom) – en-GB**
   - App or game: **Game**; Free or paid: **Free**
   - Tick the declarations → **Create app**.
3. **Form factors:** the app is one Android app for phone, tablet and TV. Phone and tablet need nothing extra. For the TV: **Test and release → Advanced settings → Form factors → Add form factor → Android TV**. Tick that you follow the TV guidelines and save. Without this the app does not appear on the Google TV. *Optional:* the same page also offers **Google Play Games on PC** (Windows). Check Google's requirements first; it is not turned on for TripScouts yet.
4. **App content** (left menu **Policy → App content**). Fill in every item with the answers in [play-store/README.md](play-store/README.md#app-content-the-questionnaires):
   - Privacy policy: `https://tripscouts.online/privacy.html`
   - App access, Ads, Content rating, Target audience, Data safety, Government apps, Financial features, Health.
5. **Store listing:** **Grow users → Store presence → Main store listing**:
   - Name, short description and full description: copy from [play-store/README.md](play-store/README.md).
   - App icon: `icons/icon-512.png`. Feature graphic: `docs/play-store/feature-graphic.png`.
   - Phone screenshots: the eight `docs/play-store/screenshot-*.png`, in order. The same eight for tablet and Android TV, plus `docs/play-store/tv-banner.png` as TV banner.
   - **Save.** Then **Manage translations → Add translations → Dutch – nl-NL** and paste the Dutch texts.
6. **Store settings:** **Grow users → Store presence → Store settings**: category **Adventure**, an email address, website `https://tripscouts.online/`.

---

## C. The first version, for testers (once)

### C1. Build the bundle (.aab)

From the repository root, run `npm run build:aab`. It starts the `main` workflow, waits for it, downloads the protected artifact, and prompts for your key password. The `.aab` is saved in `dist/android-aab-<run-id>/`.

Alternatively, start the workflow manually: GitHub → **Actions** → **Build the Android app** → **Run workflow** → branch `main` → **Run workflow**. (A merge to `main` also starts it.) Wait until the run is green (about 5 minutes). The step *Fixed key* says "The key is fine". If it is red, see [android-key.md](android-key.md#something-went-wrong).

### C2. Get the .aab

The `.aab` is **not public**: it is only in the run, inside a 7z file with your key password.

1. Open the green run. At the bottom, under **Artifacts**, click **cabin-week-google-play**. You get `cabin-week-google-play.zip`. It stays there for 7 days; after that, run the workflow again.
2. Unpack it in your Downloads folder:
   ```bash
   cd ~/Downloads && unzip cabin-week-google-play.zip
   ```
   ```bash
   7z x cabin-week-google-play.7z
   ```
   7z asks for the password: your key password (`ANDROID_KEYSTORE_PASSWORD`).
3. You now have `~/Downloads/cabin-week.aab` (and `cabin-week-mapping.txt`). Do not share them; delete them after uploading.

   The release bundle is optimised with **R8** (smaller and faster, as Google Play recommends). Its mapping file is already inside the `.aab`, so Play shows readable crash reports by itself. Does Play Console still say there is no deobfuscation file? Then upload `cabin-week-mapping.txt` at **App bundle explorer → the version → Downloads → ReTrace mapping file**.

(The `.apk` on the releases **android-v1.&lt;build&gt;** is public and fine to share: that is the version for Downloader on the TV, always the newest at `tripscouts.online/android`. Google Play does not take an `.apk`.)

### C3. Upload to internal testing

1. Play Console → TripScouts → **Test and release → Testing → Internal testing**.
2. Tab **Testers** → **Create email list**: a name (e.g. "Family") and the Google accounts of your testers (up to 100) → **Save**. Tick the list → **Save**.
3. **Create new release**:
   - Play App Signing: **Continue** (Google keeps the real signing key; your key is the upload key).
   - **Upload** `cabin-week.aab`.
   - Release name: filled in by itself (the version number). Release notes: e.g. `First version.`
   - **Next** → **Save and publish**.
4. Back on **Internal testing → Testers**: copy the **Join on the web** link (opt-in link) and send it to the testers.

   The links for TripScouts:
   - **Join on the web** (opt-in, once per tester): https://play.google.com/apps/testing/nl.w3nl.cabinweek
   - **Join on Android** (the store page, after opting in): https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek

   Only Google accounts on the tester list can join; for others the links show "not found".

### C4. Install

- **Phone or tablet:** open the opt-in link with the tester's Google account → **Become a tester** → **Download it on Google Play** → **Install**.
- **Chromebook with Google Play:** join the test with the same account used by the Chromebook's Play Store, then install TripScouts there. See [chromebook.md](chromebook.md) if the device is unavailable.
- **Google TV:** the Google account on the TV must be a tester (it opened the opt-in link once). Then, on the phone with the same account: Play Store → TripScouts → **Install on more devices** → the TV. Or on the TV: Play Store → search **TripScouts**. Just after the first upload it can take an hour.

"Not available for this device" on the TV: Android TV is not on yet (B3), or the account on the TV is not a tester.

---

## D. A new version (every update)

1. Merge the change to `main` (the build starts by itself), or run **Build the Android app** by hand.
2. Get the `.aab` (C2).
3. Play Console → **Internal testing** → **Create new release** → upload.
4. **Release notes:** every pull request has a section *Release notes* with the text in en-GB and nl-NL. Copy the block of the merged pull request(s) into the release-notes field (combine them if there are several; max. 500 characters per language).
5. **Next** → **Save and publish**.

The version number goes up by itself (the GitHub build number), so Google always accepts the new bundle. Testers get the update automatically, usually within a day. Right away: Play Store → **Manage apps → Updates**.

---

## E. Public in Google Play (optional)

Internal testing is enough for family and friends. For everyone:

1. A **personal** developer account made after November 2023 first needs a **closed test** with at least **12 testers** who stay opted in for **14 days**: **Testing → Closed testing → Create track**, upload the same `.aab`, add the testers.
2. Then **Production → Create new release** → upload → **Send for review**. Google's review usually takes a few days.
3. Countries: **Production → Countries/regions → Add countries**.

---

## Good to know

- The package name `nl.w3nl.cabinweek` is fixed forever after the first upload.
- **Lost the key?** Play Console → **Test and release → App integrity → App signing → Request upload key reset**. Your app and players are safe: Google keeps the real signing key.
- Google raises the required Android version every year. The app targets Android 16 (API 36). If Play Console asks for higher, raise `compileSdk` and `targetSdk` in `android-tv/app/build.gradle.kts`.
- The store images can be made again with `npm run store`.
