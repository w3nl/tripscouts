# Domain: tripscouts.online

The game lives at **https://tripscouts.online/** (it was called Cabin Week and lived at cabinweek.online; see "Moving from cabinweek.online" below). GitHub Pages publishes it (workflow *Publish the game*, `pages.yml`). Until the domain is set up it is at `https://w3nl.github.io/tripscouts/`.

Nothing in the code needs to change: all paths are relative (`./`, `sw.js`, `manifest.webmanifest`), and the Android app has the game built in. A `CNAME` file is not needed: when publishing with GitHub Actions, GitHub keeps the domain in **Settings → Pages → Custom domain**.

## First time: turn on Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.** The next push to `main` publishes the game.

## DNS at the registrar

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `w3nl.github.io` |

Remove old A, AAAA or CNAME records for `@` and `www` (such as a parking page of the registrar).

A GitHub Pages site has only one custom domain. For every other domain you own (`cabinweek.online`, `cabin-week.online`), set up a **redirect (301)** to `https://tripscouts.online/` at its registrar; do not point A records at GitHub for it.

## In GitHub

1. **Settings → Pages → Custom domain:** `tripscouts.online` → *Save*. GitHub checks the DNS (this can take a while).
2. Once the certificate is there (minutes to a day): tick **Enforce HTTPS**.
3. Recommended: verify the domain in your **account settings → Pages → Add a domain** (a TXT record), so nobody else can attach it to their own GitHub site.

## Good to know

- **Saved progress belongs to the address.** Players who played on cabinweek.online start again at day 1 on tripscouts.online, unless they bring their progress along with a save code (💾 Progress on the map, 💾 Hero code in the hero creator). The Android app keeps its progress: the game is built into the app.
- **Google Play:** use `https://tripscouts.online/privacy.html` as the privacy policy and `https://tripscouts.online/` as the website.
- **If the domain expires,** remove it under *Custom domain*; the game is then back at `w3nl.github.io/tripscouts`.

## Moving from cabinweek.online

Do these in this order, so the game never goes offline:

1. **DNS for tripscouts.online:** add the records above at the registrar of tripscouts.online.
2. **GitHub:** Settings → Pages → Custom domain: change `cabinweek.online` to `tripscouts.online` → *Save*. Wait for the certificate, then tick **Enforce HTTPS**. (The `CNAME` file in the repository says `tripscouts.online` too, but with GitHub Actions the setting is what counts.)
3. **cabinweek.online:** at its registrar, replace its A/AAAA records by a **301 redirect** to `https://tripscouts.online/`, so old links and installed web apps still find the game. Keep the domain for at least a year.
4. **Google Play:** update the website and the privacy policy URL to `https://tripscouts.online/privacy.html` (see [play-store/README.md](play-store/README.md)): in **Policy → App content → Privacy policy** and in the main store listing. Play checks the URL, and while `cabinweek.online` has no valid certificate or redirect it reports *does not link to a valid privacy policy page* and blocks updates.
5. **The games overview** (w3nl/games) and anywhere else that links to cabinweek.online.

## Renaming the repository (cabin-week → tripscouts)

The repository was renamed from `w3nl/cabin-week` to `w3nl/tripscouts` in November 2026. GitHub forwards the old web addresses, `git` remotes and API calls to the new name, so old links keep working. What to do, in this order:

1. **Set the custom domain first** (see "In GitHub" above). Without it, the site moves from `w3nl.github.io/cabin-week` to `w3nl.github.io/tripscouts`, and GitHub does *not* forward the old Pages address.
2. **Rename:** Settings → General → *Repository name* → `tripscouts` → *Rename*.
3. **Merge the pull request** that changes the links in the game (source code, licence, privacy page) to `w3nl/tripscouts`. Merge it *after* the rename: before, the new links would point to a repository that doesn't exist yet.
4. **Your own clone:** `git remote set-url origin https://github.com/w3nl/tripscouts.git` (it works without this, but the forwarding is meant as a stopgap).
5. **Claude and other apps:** if an app has access to selected repositories only (the Claude GitHub App, Settings → Applications), check that `w3nl/tripscouts` is still in its list.
6. **The games overview** (`w3nl/games`) links to the code: update `w3nl/cabin-week` to `w3nl/tripscouts` there too.

What stays the same: the secrets and variables (`ANDROID_KEYSTORE_*`), the workflows, issues, pull requests, stars, the `google-tv` release and its `cabin-week.apk` (the old download link is forwarded), the Android package `nl.w3nl.cabinweek` and everyone's saved progress.
