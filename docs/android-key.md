# The Android key: step by step

The Android app (phone, tablet, Google TV) is built by GitHub, in the workflow *Build the Android app*. To sign it, GitHub needs your **upload key**. You make it once on your own computer and give it to GitHub as two **secrets**. Secrets cannot be read back, not even by you, and they never show up in logs.

What the workflow then makes:

| File | Where | Public? |
|---|---|---|
| `cabin-week.apk` | a release **android-v1.&lt;build&gt;** per build (for Downloader on the TV: `tripscouts.online/android`) | yes, that is fine |
| `cabin-week.aab` | artifact `cabin-week-google-play`, inside a 7z file with a password | **no** |

Anyone with a GitHub account can download an artifact of a public repository. That is why the `.aab` is in a 7z file whose password is your `ANDROID_KEYSTORE_PASSWORD`.

You need: a terminal, Java's `keytool`, and the GitHub CLI `gh` (or the GitHub website).

---

## Option A: a new key for TripScouts (recommended)

### 1. Install keytool (part of Java)

- **Linux (Ubuntu):**
  ```bash
  sudo apt install openjdk-21-jre-headless
  ```
- **Mac:** install Java from [adoptium.net](https://adoptium.net/) (Temurin, the .pkg), or `brew install openjdk`.
- **Windows:** install Java from [adoptium.net](https://adoptium.net/) (Temurin, the .msi, tick "Set JAVA_HOME" and "Add to PATH"). Use PowerShell.

Check:
```bash
keytool -help
```

### 2. Make the key

Run this in a folder outside any repository, for example your home folder:

```bash
keytool -genkeypair -v -keystore cabinweek.jks -alias cabinweek -keyalg RSA -keysize 2048 -validity 10000
```

- It asks for a **password**: choose a strong one and write it down. If it asks for a second password (for the key), press Enter or type the **same** one.
- Then it asks for your name, organisation, city and so on. This is not checked and is not shown in Google Play: "TripScouts" as the name and your country code are enough. Answer `yes` at the end.

You now have the file `cabinweek.jks`.

### 3. Check the key and the password

```bash
keytool -list -keystore cabinweek.jks -alias cabinweek
```

Type the password. You should see a line with `cabinweek, …, PrivateKeyEntry`. With `keystore password was incorrect`, start again at step 2.

### 4. Keep it safe

Put `cabinweek.jks` and the password in a safe place, for example a password manager (as an attachment) and a USB stick. **Never** put them in the repository, an email or a chat. Without this key you cannot update the app in Google Play (Google can reset it, but that takes a request).

### 5. Put the key in GitHub

**With the GitHub CLI (easiest, no copying):**

Install it once ([cli.github.com](https://cli.github.com/); Ubuntu: `sudo apt install gh`) and sign in:
```bash
gh auth login
```

Then, in the folder with `cabinweek.jks`:

- **Linux:**
  ```bash
  base64 -w0 cabinweek.jks | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/tripscouts
  ```
- **Mac:**
  ```bash
  base64 -i cabinweek.jks | tr -d '\n' | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/tripscouts
  ```
- **Windows (PowerShell):**
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("cabinweek.jks")) | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/tripscouts
  ```

And the password (`gh` asks for it, so it does not end up in your shell history):
```bash
gh secret set ANDROID_KEYSTORE_PASSWORD --repo w3nl/tripscouts
```

**Or on the website:** turn the key into one line of text and copy it (Linux: `base64 -w0 cabinweek.jks`; Mac: `base64 -i cabinweek.jks | tr -d '\n' | pbcopy`; Windows: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("cabinweek.jks")) | Set-Clipboard`). Then go to [github.com/w3nl/tripscouts/settings/secrets/actions](https://github.com/w3nl/tripscouts/settings/secrets/actions) → **New repository secret**:
- Name `ANDROID_KEYSTORE_BASE64`, value: the long line of text (2500 to 4000 characters, nothing else).
- Name `ANDROID_KEYSTORE_PASSWORD`, value: the password.

Check: the page [Settings → Secrets and variables → Actions](https://github.com/w3nl/tripscouts/settings/secrets/actions) lists both names.

### 6. Build

Merge a change to `main`, or start it yourself: **Actions** → *Build the Android app* → **Run workflow** → branch `main` → **Run workflow**. After a few minutes the run is green. The step *Fixed key* says "The key is fine." If something is wrong, that step says what (wrong password, wrong alias, broken text).

You can also run `npm run build:aab` from the repository root. It starts the same workflow, waits for it, downloads the protected artifact, and prompts for your key password to extract the `.aab` into `dist/android-aab-<run-id>/`. This requires the GitHub CLI (`gh`) to be installed and authenticated, the 7-Zip command (`7z`), and both GitHub secrets to be set.

### 7. Get the bundle for Google Play

If you used the manual Actions steps above, get the bundle this way:
1. **Actions** → *Build the Android app* → the latest green run on `main`.
2. At the bottom, under **Artifacts**, click `cabin-week-google-play`. You get a zip (the artifact stays 7 days; after that, run the workflow again).
3. Unzip it. Open `cabin-week-google-play.7z` with your **key password**:
   - Linux: `sudo apt install 7zip`, then
     ```bash
     7z x cabin-week-google-play.7z
     ```
   - Windows: [7-zip.org](https://www.7-zip.org/) → right-click → 7-Zip → Extract.
   - Mac: [Keka](https://www.keka.io/) or `brew install sevenzip`.
4. Upload `cabin-week.aab` in [Play Console](https://play.google.com/console) → TripScouts → Test and release → a track (e.g. Internal testing) → **Create new release**. The first upload also registers your upload key with Google (Play App Signing).

---

## Option B: reuse the Ardennen key

Possible: Google accepts the same upload key for several apps. You need the **file** `ardennen.jks` and its password (GitHub cannot give the secrets of the ardennen repository back).

1. Do step 5 above with `ardennen.jks` in place of `cabinweek.jks`, and its password.
2. Tell the workflow the alias is `ardennen`, with a **variable** (not a secret):
   ```bash
   gh variable set ANDROID_KEY_ALIAS --body ardennen --repo w3nl/tripscouts
   ```
   Or on the website: [Settings → Secrets and variables → Actions](https://github.com/w3nl/tripscouts/settings/variables/actions) → tab **Variables** → **New repository variable**: name `ANDROID_KEY_ALIAS`, value `ardennen`.
3. Continue with steps 6 and 7.

A separate key per app is tidier: if one key leaks, only one app is affected.

---

## Something went wrong?

| Message in the step *Fixed key* | What to do |
|---|---|
| `is not valid base64 text` | The secret contains something else than the key text (a file name, extra text, half the text). Do step 5 again, preferably with `gh`. |
| `password was incorrect` | `ANDROID_KEYSTORE_PASSWORD` does not match. Check with step 3, then set the secret again. |
| `alias does not exist` | The key has another alias. Check with `keytool -list -keystore cabinweek.jks` and set `ANDROID_KEY_ALIAS` (Option B, step 2). |
| No artifact `cabin-week-google-play` | The secrets are missing (the run shows a notice "No .aab for Google Play built"), or the artifact expired after 7 days. |
