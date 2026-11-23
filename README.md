# TripScouts

The Android package (`nl.w3nl.cabinweek`) and the save data keep an older internal name (`cabin-week`), so nothing breaks for players. The repository was called `w3nl/cabin-week` until November 2026; GitHub forwards the old address.

A platform game in the browser about two families, **the Hills and the Woods**, nine people in all. They want to go on holiday together, but they can't agree where. So you go ahead as their **trip scout**: try out every trip and tell them what you think. Choose a trip on the map of Europe (the Ardennes, the North Pole, Tirol, Norway, the Netherlands, Dalmatia, Småland, Scotland, the Ardèche or the Veneto) and play its week: eight days, **one level a day**.

Play as one of the nine, or **make your own hero** (name, height, skin, hair, coat, glasses, hat and scarf). You walk and jump through the forest, the cabin, the snow and a Christmas market. You find lost things, get through a gate halfway (bring something, pull levers, light lamps, race the bell or walk a lost animal home) and open a lock at the end: a code, a tune, colours, arrows, a word or a clock, with clues along the way. Every trip mixes them differently. Finish a day to unlock the next one.

**In English and Dutch** (Dutch browsers start in Dutch; choose a language in Settings, or add `?lang=nl` to the link).

## Play

- **Online:** [tripscouts.online](https://tripscouts.online/) (GitHub Pages).
- **Android app (test):** one app for **phones, tablets and Google TV** (touch, controller or TV remote). It is in a test on Google Play. Testers join once at [play.google.com/apps/testing/nl.w3nl.cabinweek](https://play.google.com/apps/testing/nl.w3nl.cabinweek) (with the Google account that is on the tester list), then install it from [TripScouts on Google Play](https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek). Publishing it: [docs/publish-android.md](docs/publish-android.md).
- **On your phone or tablet:** open the site and choose "Add to Home screen" (or the Android app, offered in the game). After that the game also works offline. iPhone and iPad: see [docs/iphone-ipad.md](docs/iphone-ipad.md).
- **On a Chromebook (Chrome OS):** install the website as an app from Chrome, or use the same Android app on a Chromebook with Google Play. Installation, tester access and compatibility checks: [docs/chromebook.md](docs/chromebook.md).
- **On Linux (Ubuntu):** available in the [Snap Store](https://snapcraft.io/tripscouts), currently on the **edge** channel: `sudo snap install tripscouts --edge`. A standalone snap is also in the [latest release](https://github.com/w3nl/tripscouts/releases/latest/download/tripscouts.snap). See [docs/linux.md](docs/linux.md).
- **On the TV (Google TV):** the Android app above, or a browser app, or casting. See [docs/google-tv.md](docs/google-tv.md).
- **Locally:**

```bash
npm install
```

```bash
npm start          # http://127.0.0.1:4180
```

### Controls

| | Computer | Phone |
|---|---|---|
| Walk | ← → (or A, D) | ◀ ▶ |
| Run | hold Shift (or Ctrl), or double-tap ← / → and hold | double-tap ◀ / ▶ and hold |
| Jump | Space or ↑ (or W) | ⤒ |
| Talk, read, use | E or ↓ (or Enter) | 💬 |
| Belly slide | walk + ↓ (or E) | walk + 💬 |
| Menu | Esc | Menu |

**With a controller** (PlayStation, Stadia, Xbox; USB or Bluetooth, on computer, tablet and phone): walk with the left stick or the D-pad, run with R1/L1 (or R2/L2), jump with ✕/A, talk with □/X or ○/B, Start for the menu. In menus, choose with the stick or the D-pad and press ✕/A; ○/B goes back. Press a button first after connecting, so the browser sees the controller.

Jump on wild boars, robot vacuums, snowmen, a lost penguin, arctic foxes, lemmings, mountain goats, little trolls, cross geese, seagulls and crabs, or belly-slide into them (you slide furthest in the snow). Watch out for brambles, Lego bricks and icicles. Chocolate gives you a heart back.

## The trips

Choose a trip on the **map of Europe** (🗺️ on the title screen). Every trip is a week of eight days, one level a day, with its own progress: you can start anywhere.

| Trip | Where | Days |
|---|---|---|
| 🌲 **Ardennes** | a cabin near Pinebrook | arrival, the old railway, a Christmas market in Luxembourg, Paul's birthday (with Lego), Christmas Day, the wildlife park, the last evening, going home |
| 🎅 **North Pole** | Santa's village | landing on the ice, the reindeer stables, Santa's workshop, building an igloo, the post office, northern lights, Christmas Eve, going home |
| ⛷️ **Tirol** | a chalet in Lindenalm | arrival, ski school, the cable car, the Christmas market in Innsbruck, the toboggan run, the mountain hut, fondue night, going home |
| 🌌 **Norway** | a red cabin by the fjord near Fjordvik | arrival, kicksled shopping, a husky safari, the stave church, the fishing village, the troll forest, northern lights, going home |

| 🌷 **Netherlands** | a little house by a windmill near Tulpendam | the Zaanse Schans, the windmills of Kinderdijk, Amsterdam by canal boat, Gouda by candlelight, skating in Giethoorn, the Hoge Veluwe, a Wadden island, going home |
| ☀️ **Dalmatia** (summer!) | Camp Lavanda on the Croatian coast | the camping, the Krka waterfalls, the walls of Dubrovnik, island hopping, the Plitvice lakes, Zadar and the sea organ, the rocky beach of Šibenik, going home. The sea is warm: you can swim |
| 🛶 **Småland** (summer!) | a red cottage by a lake near Lingonby, Sweden | arrival by the lake, fika in the village, the moose forest (bounce on a moose!), the glassworks, midsummer, canoeing on the lake, a car meet with Saabs, a Volvo and a Scania, going home |
| 🏰 **Scotland** (summer!) | the fictional Highland village of Glen Rowan | Glen Coe, Loch Ness, an old castle, a ceilidh, island-hopping, Edinburgh's Old Town, music in Glasgow, going home. Long summer daylight and changeable weather |
| 🌻 **Ardèche** (summer!) | Camping Les Cigales near the fictional village of Roquelune, France | the campsite by the river, canoeing to the Pont d'Arc, market day, the Chauvet Cave with its 36,000-year-old paintings, lavender and sunflowers, the grape harvest, an old village by the river, going home. Swim in the river, and watch out for wasps |
| 🎭 **Veneto** (summer!) | Camping Laguna near the fictional village of Portoverde, Italy | flamingos in the lagoon, Venice and its islands by vaporetto, Murano and Burano, a flamingo chick to bring home, Verona and its Arena, the Dolomites, a day at the Lido, going home |

Coming later: Iceland, Tuscany, Catalonia and Greece (ideas in [docs/ideas.md](docs/ideas.md)).

## Contributing

- [AGENTS.md](AGENTS.md): how the code works, the solutions, the pitfalls and the checklists.
- [docs/domain.md](docs/domain.md): the domain (tripscouts.online) and its DNS settings.
- [docs/linux.md](docs/linux.md): the Linux app (a snap), building it in GitHub Actions and publishing it in the Snap Store, step by step.
- [docs/chromebook.md](docs/chromebook.md): installing on Chrome OS as a web app or through Google Play, and checking Chromebook compatibility.
- [docs/publish-android.md](docs/publish-android.md): publishing the Android app in Google Play, and getting the `.aab`, step by step.
- [docs/android-key.md](docs/android-key.md): the signing key for the Android app, in detail.
- [docs/blueprint.md](docs/blueprint.md): the recipe for a game like this (in Dutch).
- [docs/agent-workflow.md](docs/agent-workflow.md): from idea to pull request with AI agents.

```bash
npx playwright install chromium   # only the first time
```

```bash
npm test                          # plays every day, plus controls, title, saving, phone and the app
```

TripScouts grew out of a game made for one family's Christmas week; this version has fictional names and places. Licence: GPL-3.0.
