# Blueprint: een platformspel in de browser, met elk thema

Dit is het recept achter *TripScouts* (eerst *Cabin Week*): een platformspel (lopen, springen, zoeken, opdrachten, codes kraken) voor een familie, een vakantie of een feest. Het speelt op de computer, de telefoon, de tablet en de tv, met toetsenbord, aanraakscherm, controller of afstandsbediening. Het bouwt voort op de escaperooms *Hello, IT* ([w3nl/it](https://github.com/w3nl/it)), *Villa Kakelbont* ([w3nl/pippi](https://github.com/w3nl/pippi)), *Sinterklaas* ([w3nl/sinterklaas](https://github.com/w3nl/sinterklaas)) en *Het Geheim van de Albertsmaheert* ([w3nl/albertsmaheert](https://github.com/w3nl/albertsmaheert)). Hun lessen staan hieronder, samen met wat dit project zelf leerde.

Met dit recept maak je hetzelfde soort spel met een ander thema: een andere familie, een andere plek, een ander feest. Het projecteigen deel van *TripScouts* (bestanden, oplossingen, toon) staat in [AGENTS.md](../AGENTS.md); kopieer de opzet daarvan.

**Inhoud**
1. Het idee
2. Wat je de eigenaar vraagt (intake)
3. Techniek
4. Hoe de code in elkaar zit
5. Besturing en natuurkunde
6. Tekenen: poppetjes, wereld, snelheid
7. Schermen en menu's
8. Apparaten: computer, telefoon, tablet, tv
9. De app, versies en updates
10. De Google TV-app en Google Play
11. Online: GitHub Pages en een eigen domein
12. Tests
13. GitHub, CI en AI-agents
14. Lessons learned
15. Stappenplan voor een nieuw thema
16. Checklists
17. Beginprompt voor een nieuw project

---

## 1. Het idee

- **Een platformspel in het genre van de oude DOS- en Linux-klassiekers:** een poppetje loopt door een landschap, springt over kuilen en op vijanden, zoekt dingen en doet opdrachten om verder te komen. Alles is eigen werk: geen namen, figuren, plaatjes of levels van bestaande spellen.
- **Escaperoom-puzzels in een platformspel:** elk level heeft drie dingen om te zoeken, een opdracht voor een personage (breng iets, dan gaat een hek open) en een codeslot waarvan de cijfers onderweg op bordjes staan. Wie de bordjes leest, kan de code kraken; wie vastzit, krijgt na drie pogingen een tip.
- **Over echte mensen en een echte plek.** De familie speelt zichzelf (poppetjes naar foto's), het huis is het echte vakantiehuis, de grappen gaan over wat ze echt gaan meemaken. Feiten over de plek (aantal kamers, sauna, parkeerplaatsen) worden de cijfers van de codes.
- **Persoonlijke details maken het.** Wat iemand graag heeft of doet, komt terug: bij *TripScouts* Lego op een verjaardag, de echte auto's (Saabs), thee in plaats van koffie, chocolade en friet. Vraag ernaar (zie de intake).
- **Een level per dag** van de vakantie of het feest, zodat het spel meegroeit met de week. Het titelscherm telt af in nachtjes slapen, en toont tijdens de week de hoeveelste nacht het is.
- **Gevoelige dagen krijgen een eigen, rustig level.** Vraag de eigenaar of er dagen zijn met een bijzondere betekenis, en ontwerp die in overleg: geen vijanden, geen druk, geen grappen, en alleen wat de familie zelf wil.
- **Altijd verder kunnen:** geen game over (bij nul hartjes terug naar de laatste vlag), tips na foute codes, vlaggen als bewaarpunten.
- **Elke dag anders.** Hetzelfde patroon (een hek met "breng iets", dan een codeslot met bordjes) gaat na een paar dagen vervelen. Wissel de opdracht halverwege (iets brengen, drie hendels, lampen aansteken, een bel die een hek een paar seconden opent, een verdwaald dier terugbrengen, of geen hek) en het slot aan het eind (symbolen, tellen wat je onderweg ziet, een melodie, kleuren, pijlen, een woord, een klok). Laat een test de mix bewaken. En laat de wereld zelf anders spelen: heuvels, bewegende vlotten of gondels, ijs, wind, donker, zwemmen, een trap of ladder.
- **Dieren en dingen horen bij de plek.** Op de Noordpool geen pinguïns (die wonen op de zuidpool), tenzij er één verdwaald is en het verhaal dat zegt; robotstofzuigers en Lego alleen in het huis waar ze thuishoren. Vraag de eigenaar wat typisch is voor de plek.
- **Speelbaar op alles wat de familie heeft:** computer, telefoon en tablet (als web-app), tv (eigen app of casten), met toetsenbord, aanraken, controller of afstandsbediening.

### Checklist voor een level
- Drie dingen om te zoeken, verdeeld over het level, minstens één hoog.
- Een opdracht met een personage dat iets vraagt (met een grap), het voorwerp vóór het hek, en een bedankje met een grap.
- Een codeslot met vier cijfers. De aanwijzingen staan onderweg (`symbool = cijfer`, of feiten uit het echte leven) en zijn goed te zien.
- Vijanden en hindernissen die bij het thema passen, en die je kunt ontwijken, platspringen of omverglijden.
- Twee of drie personages met een grap, en bordjes met grappen over de plek.
- Verzamelobjecten die bij de dag passen (frietjes, legosteentjes, kerstkoekjes) en een hartje terug (chocolade).
- Een uitgang die bij het verhaal hoort (het huis, de auto, de kerstboom).
- Een zin bij het halen van het level die het verhaal verder vertelt.

## 2. Wat je de eigenaar vraagt (intake)

Vraag dit vóór je begint; het scheelt veel heen en weer. Stel vragen in één keer, niet één voor één.

1. **Wie:** namen, gezinnen, hoe ze familie van elkaar zijn. Voor kinderen alleen de klas (geen geboortejaren), en geen verzonnen karaktertrekken.
2. **Foto's van iedereen:** haar (kleur, lengte, model, knot, staart), bril (en of die in het spel moet), jas, sjaal, muts, broek of rok, schoenen. Teken een eerste versie, laat die zien, en verbeter per persoon.
3. **Waar en wanneer:** de plek, de datums, het huis (aantal kamers, voorzieningen, wat je zelf moet meenemen), uitstapjes in de buurt.
4. **Per dag:** wat gebeurt er? Dat wordt het thema van het level.
5. **Bijzondere dagen:** verjaardagen (hoe oud wordt iemand?), feestdagen, en dagen die rustig en respectvol moeten blijven.
6. **Persoonlijke details:** hobby's, auto's (merk, model, kleur, met foto), lievelingseten en -drinken, en wat juist niet (iemand drinkt geen koffie).
7. **Toon:** waar mag om gelachen worden, en waarover nooit?
8. **Apparaten:** wie speelt op wat (Android, iPhone, iPad, laptop, tv)? Welke controllers zijn er?
9. **Repository en adres:** GitHub-eigenaar en naam, eventueel een eigen domein.

## 3. Techniek

- **Gewone HTML, CSS en JavaScript met canvas. Geen build, geen framework, geen runtime-afhankelijkheden** (alleen webfonts). Iedereen, en elke agent, kan elk bestand lezen en veranderen; spelen vraagt geen installatie; hosten kan op elke statische site.
- **Alles getekend met code** (canvas-paden, pixel-art-texturen die één keer in een klein canvas worden gemaakt). Geen plaatjes om te beheren, en een level in een ander thema is een paar kleuren en vormen.
- **GitHub Pages**, installeerbaar als **app (PWA)**, **offline** speelbaar, eventueel op een **eigen domein**.
- **Gewone scripts in volgorde in `index.html`** (geen modules, geen `fetch`), zodat het spel ook als los bestand werkt en met `npm run bundle` tot één HTML-bestand te maken is (bijvoorbeeld om als Claude-artifact te delen).
- **Een kleine Node-server zonder afhankelijkheden** (`npm start`) voor lokaal spelen en de tests. `package.json` en `node_modules/` zijn alleen voor tests en hulpscripts.
- **Een kleine Android TV-app** (Java, één WebView) met het spel erin, voor de tv en Google Play. Zie §10.

### Bestanden
```
index.html            pagina en schermen; laadt de scripts op volgorde
privacy.html          privacyverklaring (voor Google Play), losse pagina
css/game.css          opmaak met tokens op :root; [hidden]-regel; menu in de breedte
js/data.js            datums, personages (naar foto's), grappen, rng()
js/levels.js          met de hand gebouwde levels
js/levelgen.js        levelgenerator + gegenereerde levels
js/core.js            opslaan, geluid (en het geluid aanzetten bij de eerste tik)
js/canvas.js          canvas, schaal, teken-hulpjes, emoji-cache, menu passend maken
js/sprites.js         poppetjes (met parameters), vijanden, voorwerpen
js/game.js            spelstatus, invoer (met tijdstempels), natuurkunde, interacties
js/world.js           texturen, achtergronden, decoratie, render()
js/screens.js         bovenbalk, intro/gehaald/finale, codeslot, titelscherm
js/gamepad.js         controller, menu-navigatie met pijltjes en afstandsbediening
js/app.js             versie, service worker, meldingen, spellus
sw.js, manifest.webmanifest, icons/
android-tv/           de Google TV-app (Gradle, Java, WebView, banner)
tests/                Playwright + serve.js + helpers.js
tools/                build-site.js, bundle.js, icons.js, store.js
docs/                 blueprint, agent-workflow, google-tv, iphone-ipad, domein, play-store/
.github/              workflows, issueformulier, PR-sjabloon
AGENTS.md, CLAUDE.md, README.md, renovate.json, .nvmrc
```

## 4. Hoe de code in elkaar zit

- **Eén gedeelde ruimte voor alle scripts:** namen op het hoogste niveau moeten uniek zijn. Code die bij het laden draait, mag alleen dingen uit eerdere bestanden gebruiken (functies zijn alleen binnen hun eigen bestand vooruit beschikbaar; `const`/`let` pas na hun regel).
- **Eén tekencontext `g`** (een `let`) die je tijdelijk kunt omwisselen (`withCtx`), zodat dezelfde tekenfuncties ook in texturen, achtergrondlagen en portretjes tekenen.
- **Een raster van tegels** (32 px, 15 rijen hoog) met tekens per soort (grond, plank, blok, stekels, hek, codedeur). Het scherm toont altijd de hele hoogte en schaalt mee; alleen de breedte scrolt.
- **Een vaste tijdstap** (1/60 s) en een losse tekenstap. Tekenen gebeurt met **interpolatie**: het poppetje, de vijanden en de camera staan op de tussenstand tussen de laatste twee stappen. Zonder dat hapert lopen op een tv op 50 Hz of op een toestel dat beelden overslaat (dan krijgt het ene beeld twee stappen en het volgende geen). Teken daarom niets dat zelf de spelstand verandert.
- **Een levelgenerator met een vast zaadje** maakt levels uit kleine stukjes waarvan bekend is dat ze te halen zijn (kuil, twee planken, trap, toren, vlak stuk). Hij reserveert vlakke stukken voor het hek en de codedeur, zet het opdrachtvoorwerp op de hoogste plek vóór het hek, verdeelt de rest en zet vier bordjes met `symbool = cijfer`. Met de hand gebouwde levels voor de bijzondere dagen.
- **Een testdatum in de link** (`#d-JJJJ-MM-DD`), zodat iedereen de bijzondere dagen kan bekijken zonder de klok te verzetten. Alle datumlogica gaat via één functie (`getToday()`), dagen tellen met `Math.round` over middernachten (zomertijd).

### Opslaan
- Eén sleutel met een voorvoegsel per spel (`cabinweek-…`): andere spellen op dezelfde origin delen `localStorage`.
- Elke toegang in `try/catch`; het spel werkt ook zonder opslag (privévenster).
- **Bewaar resultaten op het moment dat ze gebeuren** (een level gehaald, een personage gekozen).
- **Opslag hoort bij het adres**: wie van `x.github.io/spel` naar een eigen domein gaat, begint daar opnieuw. Kies het definitieve adres liefst vóór de familie gaat spelen.

## 5. Besturing en natuurkunde

### Invoer
- Toetsen die één keer tellen (springen, praten) gaan via een wachtrij (`edges`); ingedrukt houden via `held` (toetsenbord, aanraakknoppen), `padHeld` (controller) en `tvHeld` (controller in de tv-app). `step()` telt ze samen.
- **Precieze tikjes:** onthoud wanneer een knop werd ingedrukt en losgelaten (`event.timeStamp`, of in de tv-app hoe lang geleden). De spellus geeft elke stap een eigen moment en verwerkt de wachtrij per stap. Indrukken telt bij de volgende stap, loslaten even veel later als het tikje duurde. Slaat de spellus tijd over (een druk toestel), schuif het loslaten dan even ver op. Zonder dit loopt het poppetje op een tv te ver door. **Maar vertrouw de tijdstempel niet blind:** sommige Android- en tv-WebViews gebruiken een andere klok. Een tijdstempel die meer dan een seconde afwijkt of in de toekomst ligt, telt als "nu"; een wachtend loslaten houdt alleen zijn eigen toets op (nooit ← of → erna) en wacht nooit langer dan een seconde. Anders blijft het poppetje aan het begin van een level staan en zet het daarna ineens veel stappen.
- **Eén knop, meer betekenissen:** ↓ (of E, □/○, OK, 💬) praat met wie in de buurt is, leest een bordje, steekt een kaarsje aan of opent het codeslot; is er niets in de buurt en loop je, dan glijd je op je buik. Sta je stil op een plank (niet op de grond), dan zak je er met ↓ doorheen. Bij een ladder klim je met ↑ omhoog en met ↓ omlaag (geen schuine trap: een helling is in een platformspel veel lastiger dan een ladder, en binnen ziet een steile zoldertrap er net zo uit).

### Natuurkunde (de waarden van *TripScouts*)

| Wat | Waarde | Waarom |
|---|---|---|
| Zwaartekracht | 0,55 per stap (1,1 bij loslaten tijdens het stijgen) | korte tik = kleine sprong |
| Sprong | −11,6 | ruim 3 tegels hoog |
| Topsnelheid lopen / rennen | 4,4 / 6,2 px per stap | 4 tegels ver springen met aanloop |
| Optrekken op de grond | versnelling 0,12, per stap +0,03, tot 0,7 | een tikje = een paar pixels, vol na een kwart seconde |
| Afremmen / omdraaien | ×0,74 per stap / 1,1 per stap | stoppen en keren voelt direct |
| In de lucht | versnelling 0,45, wrijving ×0,93 | sturen in de lucht |
| Coyote-tijd / sprongbuffer | 7 / 8 stappen | vergevingsgezind |
| Rennen | Shift (of Ctrl), L1/R1/L2/R2, of dubbeltikken en vasthouden | dubbeltikken werkt op elk apparaat zonder extra knop |
| Buikglijden | vx 6,5, wrijving 0,985 (sneeuw) of 0,97, max. 60 of 50 stappen | vijanden gaan omver, stekels en kuilen niet |

- **Leg vast hoe hoog en ver het poppetje springt in een test**; elke wijziging aan de natuurkunde kan een level onhaalbaar maken. Versnellen gaat nooit boven de topsnelheid; boven de topsnelheid (rennen losgelaten, na glijden) zak je op de grond soepel terug en word je in de lucht meteen begrensd, zodat je zonder rennen nooit verder springt dan normaal.

## 6. Tekenen: poppetjes, wereld, snelheid

### Poppetjes naar foto's
- **Eén functie met parameters** (`drawPerson`): lengte (naar leeftijd), kind (grotere kop), haar (`short`, `bald`, `bob`, `curly`, `long`, `flowing`, `ponytail`, met knot), haarkleur, jas (`puffer`, `long`, `jacket`) en kleur, broek of rok, sjaal (strepen), muts (eventueel alleen buiten in de kou), bril (rond, breed), strik, gekleurde veters, rugzak, stoppels, grote ogen met wimpers (`cute`).
- **Binnen en buiten:** binnen geen jas of muts (de vader draagt dan zijn kersttrui), in de sneeuw iedereen een kerstmuts.
- **Beweging:** lang haar zwaait bij lopen en waait op bij springen en glijden; armen en benen op de stappen. Glijden = het staande poppetje een kwartslag gedraaid, met het hoofd teruggekanteld (kijkt vooruit) en de armen naar voren.
- **Laat elke versie zien** (een plaatje met alle poppetjes naast elkaar) en verbeter per persoon tot de familie zichzelf herkent.
- **Een eigen held** (optioneel): dezelfde `drawPerson` met keuzes als knoppen (lengte, huid, haar en kleur, knotje/strik/haarband, jas en kleur, lange of korte broek, rok of jurk, bril, muts, sjaal). Knoppen in plaats van uitklaplijsten, zodat het ook met een afstandsbediening en controller werkt. "Geen sjaal" moet ook echt geen sjaal betekenen, ook in de sneeuw waar de anderen er een krijgen. Laat het venster passen op 960×540, 740×360 en een telefoon rechtop.
- **Dieren lopen echt:** poten zwaaien vanuit de heup (`walkLeg`), viervoeters draven met de diagonale paren samen (`trotLegs`), het lijf veert mee (`stepBob`), en de stapfase komt uit de afgelegde weg, zodat de poten stilstaan als het dier stilstaat. **Dieren in het decor** die stilstaan teken je kleiner, iets hoger en iets vager, alsof ze verder weg staan: anders denkt de speler dat hij ertegenaan kan lopen of erop kan staan.

### De wereld
- **Dure tekeningen één keer:** achtergrondlagen als naadloze stroken (1536 px), het interieur van een heel level, tegeltexturen. Daarna is elke frame een paar `drawImage`-aanroepen.
- **Diepte:** lagen die langzamer meeschuiven, een donkere rand om poppetjes en tegels, schaduwen onder wie op de grond staat, sfeer-deeltjes (blaadjes, sneeuw, stofjes in het lamplicht).
- **Persoonlijke voorwerpen zelf tekenen** (auto's naar foto, met de kenmerkende vormen; geen kentekens), emoji alleen voor kleine dingen.

### Snel genoeg voor een tv (zonder dat het er anders uitziet)
- Teken van een achtergrondlaag alleen de strook waar iets op staat.
- Tegels uit één atlas per thema (één plaatje in plaats van honderden).
- Verloopkleuren één keer maken en hergebruiken.
- Emoji één keer als plaatje op schermgrootte maken en daarna kopiëren (kleuremoji tekenen is traag op Android).
- Stippen (sterren, sneeuw) met `globalAlpha` in plaats van een nieuwe kleurtekst per stip.
- Een ondoorzichtig canvas (`alpha: false`) zonder aparte wisbeurt; de achtergrond bedekt alles.
- **Geen naden:** het scherm schaalt (×1,35 en zo), dus tegelranden vallen op halve pixels en de achtergrond schijnt erdoorheen als dunne lijntjes die flikkeren als de camera beweegt. Laat elke tegel de volgende één schermpixel overlappen (`TS + 1/scale`), kopieer in de atlas de rand van elke tegel één pixel naar buiten, en teken water en andere vlakken als één rechthoek per stuk, niet per tegel. Een zwemmer die half onder water ligt: teken het water er nog eens doorschijnend vóór, in dezelfde kleur, in plaats van een vierkant.
- **Controleer dat het beeld gelijk blijft:** maak per level een beeld van `main` en van je branch, met vaste tijd, toeval, poppetje en vijanden, en vergelijk ze pixel voor pixel.

## 7. Schermen en menu's

- **Titelscherm:** de titel, de aftelling (nachtjes slapen; tijdens de week de hoeveelste nacht), een weekkalender, de helden, de dagen, een grap, de bediening en het versienummer. Op bijzondere dagen een eigen melding (een felicitatie, of een rustige melding zonder grappen).
- **Het menu in de breedte:** op een scherm dat breder is dan hoog (computer, tv, telefoon of tablet gedraaid) staat het titelscherm in twee kolommen, ontworpen op 960×540 (de tv) en meegeschaald naar het scherm, zodat niets hoeft te scrollen. Rechtop is het één kolom die scrolt. De intro, het codeslot en "gehaald" staan in de breedte in het midden, de intro en het codeslot in twee kolommen.
- **Menu's met pijltjes, afstandsbediening en controller:** kies de dichtstbijzijnde knop in de richting die je drukt (niet op volgorde), Enter/OK/✕ drukt, Terug/○ gaat terug. Zet de focus meteen op een knop zolang er niet met muis of vinger gespeeld is, en maak de focus goed zichtbaar.
- **Meldingen:** "zet het spel op je beginscherm" (Android: een knop die de vraag van de browser opent; iPhone/iPad: uitleg Deel → Zet op beginscherm; niet als het al een app is; *Niet nu* = twee weken stil) en "draai je scherm" (rechtop op een aanraakscherm; tijdens het spelen onder de bovenbalk en na een paar seconden weg).

## 8. Apparaten: computer, telefoon, tablet, tv

| Apparaat | Hoe | Besturing |
|---|---|---|
| Computer | browser | toetsenbord (pijltjes/WASD, Shift rennen), controller |
| Android-telefoon of -tablet | web-app (installeren via de melding) | knoppen op het scherm, controller |
| iPhone en iPad | web-app via Safari → Deel → Zet op beginscherm | knoppen op het scherm, controller |
| Google TV | eigen app (Google Play, interne test, of APK), of een browser-app, of casten | afstandsbediening, controller |
| Apple TV | AirPlay vanaf iPhone, iPad of Mac (tvOS heeft geen webweergave) | op het toestel zelf |

- **Aanraakknoppen** (links, rechts, springen, praten) met `pointerdown`/`pointerup` en `setPointerCapture`, zodat je kunt blijven drukken. Rennen met dubbeltikken en vasthouden, dus geen extra knop in beeld.
- **Alles past rechtop en in de breedte**; de pagina scrolt nooit opzij. Veilige randen (`env(safe-area-inset-*)`). Op een laag scherm in de breedte de bovenbalk op één regel.
- **Controller in de browser:** Gamepad API, standaardindeling, elke frame uitlezen. Een browser toont een controller pas na de eerste druk op een knop.
- **iPhone en iPad (Safari):** geluid pas na een tik, en opnieuw aanzetten na de achtergrond; `-webkit-text-size-adjust: 100%` (anders vergroot iOS de tekst bij draaien); `apple-mobile-web-app-*`-metatags en een `apple-touch-icon`; geen kopieermenu bij lang drukken, niet inzoomen bij dubbel tikken. Een eigen iOS-app (App Store, TestFlight) kost €99 per jaar en een Mac; de web-app is gratis en genoeg.

## 9. De app, versies en updates

Precies zoals in de escaperooms:
- **Service worker:** de pagina en de eigen bestanden **eerst van het netwerk met `cache: 'no-cache'`** (GitHub Pages laat browsers bestanden 10 minuten hergebruiken), de cache als reserve voor offline; bij installeren vullen met `cache: 'reload'`. Fonts eerst uit de cache. Niet registreren in de tv-app (daar zit het spel al in).
- **Meerdere spellen op één origin:** elk spel een eigen map, manifest-`id` en service worker. Wis bij `activate` alleen je **eigen** oude caches (`k.startsWith('cabinweek-')`).
- **Een versienummer vanaf het begin** (`GAME_VERSION`, gelijk aan het getal in de cachenaam; een test controleert dat), zichtbaar op het titelscherm. Verhoog het bij elke wijziging aan het spel.
- **Een updatebalk:** de service worker vertelt open pagina's zijn versie; een oudere pagina toont "Er staat een nieuwe versie klaar · Herladen".

## 10. De Google TV-app en Google Play

- **De app:** één `Activity` met een WebView die het spel uit de app-bestanden laadt via `WebViewAssetLoader` (`https://appassets.androidplatform.net/…`, zodat opslaan werkt). In het manifest `LEANBACK_LAUNCHER`, een banner (320×180) en `uses-feature` leanback/touchscreen/gamepad op `required="false"`, zodat dezelfde app ook op telefoons kan. Staat er `screenOrientation="landscape"` in, zet dan ook `uses-feature` `android.hardware.screen.landscape` en `.portrait` op `required="false"`, anders denkt Google Play dat een liggend scherm verplicht is en vallen toestellen af.
- **Controller in de app:** geef hem zelf door (de WebView geeft de Gamepad API niet op elk toestel door): hoogstens één keer per beeld (`postOnAnimation`), alleen als er iets veranderd is, met een teller per knop (een snelle tik gaat niet verloren). Links/rechts meteen, met hoe lang geleden het gebeurde. De terug-knop roept het spel aan (`window.tvBack()`); op het titelscherm sluit de app.
- **De workflow** (*Maak de Android-app*) zet de site in de app, bouwt een `.apk` (voor Downloader) en een ondertekende `.aab` (voor Google Play) en zet de `.apk` bij een release. In een **openbare** repository komt de `.aab` nooit openbaar: alleen als artifact in een 7z met wachtwoord (een artifact van een openbare repository kan iedereen met een GitHub-account downloaden), niet bij de release. In een **privé**-repository mag de `.aab` gewoon in het artifact en bij de release: alleen wie toegang heeft kan erbij. Gebruik de Android SDK van de runner (de setup-action installeert een verdwenen pakket). Versiecode = het nummer van de GitHub-run. **R8** (`isMinifyEnabled` en `isShrinkResources`, alleen voor de release) maakt de bundel kleiner en haalt de waarschuwing in Play Console weg; met één WebView zonder JavaScript-brug hoeft er niets bewaard te blijven (alleen regelnummers voor crashrapporten). Stop het mapping-bestand mee in het artifact (of de 7z). Een script (`npm run build:aab`) start de workflow, wacht en haalt de bundel op (en pakt de 7z uit); zet het ook als taak in VS Code.
- **De sleutel:** maak één keer een keystore (`keytool`), zet hem als secret met de GitHub CLI (`base64 -w0 sleutel.jks | gh secret set ANDROID_KEYSTORE_BASE64`), niet met kopiëren en plakken (dan breekt hij). Decodeer in de workflow met Python (tolerant voor regeleinden en URL-veilige tekens) en controleer met `keytool -list`. Nooit de sleutel of het wachtwoord in de repository.
- **Google Play (alleen voor de familie):** een ontwikkelaarsaccount ($25 eenmalig), app maken, **Android TV** toevoegen als apparaattype, de vragenlijsten (privacybeleid, advertenties, inhoudsclassificatie, doelgroep, gegevensveiligheid), de winkelvermelding (teksten, icoon, feature graphic, schermafbeeldingen, tv-banner; `npm run store` maakt de plaatjes), en een **interne test** met de Google-accounts van de familie. Tot de eerste beoordeling heet de app "pakketnaam (unreviewed)", zonder plaatjes: stuur de wijzigingen in via *Publishing overview*. Een beoordeling duurt meestal uren tot een paar dagen (de eerste keer en bij een nieuw account langer). Een gesloten of open test is alleen te zien in de landen die je bij die test aanzet; staat je Google-account in een ander land, voeg dat land dan toe. Oude, verwijderde apps in hetzelfde ontwikkelaarsaccount kunnen een beleidsmelding geven: los die op (of laat de app definitief verwijderen) voor je publiceert.
- **Release notes bij elke pull request**, in het formaat dat Play Console overneemt (`<nl-NL>…</nl-NL>`, eventueel `<en-GB>…</en-GB>`), hoogstens 500 tekens per taal en geschreven voor spelers. Gaan er meer PR's in één release, voeg ze samen.
- **Google Play verhoogt elk jaar de vereiste Android-versie** (`targetSdk`); de Android-plugin, Gradle en Java hangen van elkaar af: laat Renovate ze als één groep bijwerken.
- **Installeren op de tv:** vanaf de telefoon (*Installeren op meer apparaten*) of de computer; een testapp is in de Play Store op de tv vaak niet te vinden. Een eerder met Downloader geïnstalleerde versie eerst verwijderen (andere ondertekening).

## 11. Online: GitHub Pages en een eigen domein

- **Pages-bron: GitHub Actions** (niet "Deploy from a branch", anders racen twee publicaties en faalt er een).
- **Eigen domein:** alle paden relatief houden (`./`), dan hoeft er in de code niets te veranderen. DNS: vier A- en vier AAAA-records naar GitHub voor het hoofddomein, `www` als CNAME naar `eigenaar.github.io`. Een tweede domein laat je bij de registrar doorverwijzen (een Pages-site heeft één eigen domein). Daarna *Enforce HTTPS* en het domein verifiëren in de accountinstellingen.
- **Privacybeleid** als losse pagina op de site (nodig voor Google Play).

## 12. Tests

**Playwright** speelt het spel in een echte browser:
- **Elk level uitspelen:** alles oppakken, de opdracht doen, de code intypen (met het toetsenbord en met de knoppen op het scherm), naar de uitgang. Daarvoor zet de test het poppetje op de goede plek; het spel zelf doet de rest.
- **Bereikbaarheid:** een zoekalgoritme loopt elk level na met de echte sprongafstanden.
- **Natuurkunde zonder klok:** roep `step()` een vast aantal keer aan in één `page.evaluate`, zodat de uitkomst niet afhangt van de snelheid van de computer. Zet iets klaar en reken door in **dezelfde** `evaluate`: tussen twee `evaluate`s draait de spellus door (op een trage CI-machine meer dan bij jou).
- **Besturing:** springen (hoog en ver genoeg), optrekken (een tikje is klein), rennen, glijden, precieze tikjes (ook als de pagina even bezet is).
- **Controller en afstandsbediening:** een nagebootste `navigator.getGamepads` en een nagebootste tv-app (`window.__nativePad`, `window.__tvDir`); menu's met pijltjes.
- **Schermen:** telefoon rechtop en in de breedte (Pixel 7), het menu passend op 960×540, 1366×768 en 740×360 (op de drukste dag), meldingen (installeren, draaien), iPhone- en iPad-formaten.
- **Datums** (aftellen, zomertijd, bijzondere dagen), **voortgang en opslaan** (ook zonder `localStorage`), **de app** (installeerbaar, offline, elk bestand in de offline-lijst, versie gelijk aan de cache, metatags voor iOS) en **geen fouten in de console**.
- **Controleer wat de speler ziet**, niet alleen de toestand: een venster dat open moet zijn, de tekst die erin moet staan, een knop die in beeld moet zijn.
- **Geen Safari of echte tv in de CI:** test met de formaten in Chromium, en laat het op een echt toestel nakijken.
- **Wacht op een toestand, niet op een vaste tijd:** `expect.poll(() => …)` in plaats van `waitForTimeout(700)`. Op een drukke CI-machine duurt alles langer; een test die een hendel overhaalt, probeert het opnieuw als een beest het poppetje net wegduwde.
- **Niet te veel tests tegelijk** (`--workers`): tijdgevoelige tests (precieze tikjes) falen dan omdat de machine het niet bijhoudt, niet omdat het spel stuk is.

## 13. GitHub, CI en AI-agents

- **Nooit direct naar `main`**: elke wijziging is een branch van de nieuwste `main` en een pull request; de eigenaar kijkt en voegt samen. Bouwt een PR op een andere die nog open staat, zeg dan in welke volgorde ze samengevoegd moeten worden (versienummers botsen anders).
- **CI:** *Speel het spel* (alle tests) en *Maak de Android-app* op elke pull request; *Zet het spel online* publiceert `main`. **Renovate** houdt Playwright, de actions en de Android-bouw bij (de Android-plugin, Gradle en Java als één groep).
- **AI-agents in GitHub Actions** (optioneel): een *Idee*-issue → de refine-agent schrijft een plan → de eigenaar keurt goed met een label → de build-agent opent een PR. Review- en speeltest-agent **op afroep** (een label), niet bij elke PR: ze kosten tokens en falen allemaal als het token verloopt. Ze hebben een `CLAUDE_CODE_OAUTH_TOKEN` of `ANTHROPIC_API_KEY` als secret nodig. Zie [agent-workflow.md](agent-workflow.md).
- **`AGENTS.md` is het geheugen van het project** (met `CLAUDE.md` die het importeert): kaart, hoe de code werkt, opslag, oplossingen (spoilers, nodig om te testen), bijzondere dagen, hoe de poppetjes eruitzien, valkuilen, toon, checklists. Werk het bij in dezelfde PR als de wijziging.

## 14. Lessons learned

Uit de escaperooms:
- **`[hidden]{display:none!important}`**: onderdelen met `display:flex` negeren anders `hidden`.
- **CSS-klassen en globale namen zijn gedeeld**: zoek voor je een naam kiest.
- **Tekst in JS-templatestrings is HTML**: let op `<`, `&` en aanhalingstekens.
- **Zet opmerkingen op een eigen regel** en test wat de speler ziet.
- **Toon een versienummer vanaf het begin.**
- **Bewaar resultaten op het moment dat ze gebeuren.**
- **Nooit `alert/confirm/prompt`**; bouw bevestigingen in de pagina.
- **Toegankelijkheid:** knoppen met `type="button"`, velden met een label, zichtbare focus.
- **Getekende details vallen op**: een vorm die niet klopt wordt meteen gezien.
- **Eigen caches en opslag per spel** op een gedeelde origin.

Uit dit project, over de code:
- **Een toets die een venster opent, wordt pas in de volgende stap verwerkt.** Wacht in tests tot het venster zichtbaar is.
- **`page.goto` naar dezelfde URL met alleen een andere `#` herlaadt niet.** Herlaad expliciet.
- **`const`/`let` in een later script bestaan nog niet bij het laden van een eerder script.** Zet hulpjes die bij het laden nodig zijn vooraan; een `const` die je wilt omwisselen moet een `let` zijn.
- **Dagen tellen met `Math.round`** over middernachten (zomertijd).
- **Laat een computer de levels nalopen én uitspelen.**
- **Een waggel- of loopanimatie op `tijd + positie` trilt** zodra iets beweegt: laat hem van de afgelegde weg afhangen.
- **Schuif een tekenpositie niet heen en terug** (`translate(x)` en `translate(-x)`): dat laat afrondingsfouten achter. Bewaar de matrix en zet hem terug met `setTransform`.
- **Een snelheidsgrens met zacht afremmen erboven** moet ook het versnellen begrenzen, anders blijft de snelheid erboven hangen.
- **Een vertaalfunctie op een lijst** (`T(["a","b"], …)`) of een zoek-en-vervang met een te ruime regex kan een lijst zinnen in losse letters veranderen: een tekstballon per letter. Laat `say()` een losse zin zelf in een lijst stoppen, en test dat elke ballon een hele zin is.
- **Een extra bewaarvlag** die afhangt van "is er een opdracht" moet ook nieuwe soorten opdrachten kennen, anders staan er twee vlaggen naast elkaar.
- **Emoji nemen de doorzichtigheid van `fillStyle` over:** zet een ondoorzichtige kleur vóór `emoji()` als er net een schaduw getekend is.

Uit dit project, over apparaten:
- **Een tv is trager en vaak 50 Hz:** interpolatie en minder tekenwerk per beeld. De blaadjes liepen soepel (die bewegen per beeld), het poppetje niet (dat beweegt per stap): dat was de aanwijzing.
- **Een WebView overspoelen met `evaluateJavascript`** (een stick geeft honderden bewegingen per seconde) maakt de pagina traag en laat het loslaten te laat aankomen. Hoogstens één keer per beeld, en alleen veranderingen.
- **Een tikje moet even lang duren in het spel als in het echt** (tijdstempels), anders loopt het poppetje te ver.
- **Rustig optrekken** maakt kleine stapjes mogelijk; dubbeltikken en vasthouden is rennen zonder extra knop.
- **Ctrl+W sluit het tabblad** en is niet tegen te houden: noem Shift voor rennen.
- **Een menu dat rechtop is ontworpen, past niet op een tv.** Ontwerp het brede menu op 960×540 en schaal het mee.
- **iOS vergroot tekst bij draaien** en start geluid pas na een tik.
- **Lopen dat blijft hangen en dan ineens doorschiet** komt van een tijdstempel van een andere klok (Android-WebView): begrens hoe ver een tijdstempel mag afwijken.
- **Dunne flikkerende lijntjes in de grond** komen van schalen naar halve pixels: laat tegels overlappen.

Uit dit project, over publiceren:
- **Pages-bron op GitHub Actions**, anders faalt de ingebouwde publicatie.
- **Een keystore als secret** via de GitHub CLI zetten, niet plakken; decoderen met Python; controleren met `keytool`.
- **Afhankelijke updates (Android-plugin, Gradle, Java) falen apart**: laat Renovate ze groeperen.
- **Een tijdelijke app-naam "(unreviewed)"** in Google Play verdwijnt pas na de eerste beoordeling.
- **Een artifact van een openbare repository kan iedereen met een GitHub-account downloaden:** zet de `.aab` daar alleen in een 7z met wachtwoord, nooit bij een release. Is de repository privé, dan is dat niet nodig.
- **`screenOrientation="landscape"` maakt een liggend scherm verplicht** in de ogen van Google Play: zet de `uses-feature` op niet verplicht.
- **Parallelle PR's die allemaal het versienummer verhogen, botsen op die ene regel.** Geef ze oplopende nummers en voeg na elke samenvoeging `main` in de volgende.
- **Vraag naar gevoelige dagen** en behandel ze apart, rustig en zonder spelelementen die eraan afdoen.

Uit TripScouts, over snelheid (november 2026):
- **Een beeld is vooral pixels vullen, niet JavaScript.** De spelcode kostte 1 tot 3 ms per beeld; de rest was alles wat elk beeld opnieuw over het hele scherm ging: een verloop als lucht, de vignet, opgeschaalde achtergrondlagen, noorderlicht, het donker. Zoek de winst daar.
- **Meet met een flush, maar alleen om te meten.** Een canvas verzamelt tekenopdrachten en voert ze vaak pas later uit. Wie alleen de tijd van `render()` meet, ziet dan snelle beelden met af en toe een piek van honderden milliseconden: dat is werk van eerdere beelden dat in één keer wordt uitgevoerd, niet per se de echte kosten van dat ene beeld. Zet tijdens het meten `g.getImageData(0, 0, 1, 1)` na elk beeld (en vóór en na elk onderdeel dat je los wilt meten), dan zie je per beeld en per onderdeel hoeveel werk er is. Zo'n flush maakt het tekenen zelf trager (het spel moet wachten op de grafische kaart), dus de getallen zeggen wat iets kost, niet hoe lang een gewoon beeld duurt; laat hem nooit in het spel staan. En verdwijnen de pieken niet met een flush, dan is het een echte hapering: zoek uit wat dat beeld doet.
- **Kopieer wat stilstaat 1-op-1, op de eigen resolutie van het scherm.** Een verloop over het hele scherm vullen kostte 4,3 ms, een kant-en-klare kopie 0,1 ms; een laag opschalen 2,6 ms, een voorgeschaalde laag kopiëren 0,4 ms. Teken stille dingen één keer op schermresolutie en kopieer ze op hele pixels. Gemiddeld ging een beeld op tv-formaat zo van 19 naar 7 à 8 ms, zonder dat het er anders uitziet.
- **Houd zulke caches klein, en een ding er nooit twee keer in.** Een voorgeschaalde laag is op 1080p zo'n 8 MB: bewaar er hoogstens een paar en gooi de oudste weg. Stond dezelfde laag na een nieuwe resolutie twee keer in de lijst, dan gooide het opruimen de laag weg die net in gebruik was, en werd hij elk beeld opnieuw gemaakt (17 in plaats van 60 fps). Een test die controleert dat een cache tussen twee beelden *hetzelfde* blijft, vangt dat.
- **De resolutie is de grootste hefboom**: de tijd per beeld schaalt met het aantal pixels (×2 kostte 24 ms, ×1 maar 9). Geef een instelling Beeld: *automatisch*, *scherp* en *soepel*. Laat *automatisch* zelf een stap omlaag gaan als beelden te laat komen, en onthoud dat per apparaat.
- **Meet zo'n automatische stand in tijd, niet in beelden**, anders duurt het op een toestel van 10 fps een halve minuut. Negeer pauzes van meer dan een seconde (een ander tabblad), maar tel trage beelden wél mee (afgetopt), anders gaat juist het traagste toestel nooit omlaag. Wacht even na het begin van een level en na elke nieuwe grootte (dan worden de caches gemaakt), meet niet in menu's of gesprekken, en zet hem uit in tests.
- **"Elk ander beeld" verversen: tel stappen sinds de vorige keer, niet even en oneven.** Met een vaste tijdstap gaan er bij 30 fps steeds twee stappen per beeld voorbij, dus de teller blijft oneven en het noorderlicht bevroor.
- **Een fps-teller als tekst in de pagina, twee keer per seconde bijgewerkt**, kost niets; teken hem niet elk beeld op het canvas.
- **Teken een zacht effect (noorderlicht) op een kwart van de resolutie** en schaal het op: je ziet het verschil niet.
- **Controleer elke snelheidswinst op het beeld:** zet dezelfde stand (vaste tijd, toeval, poppetje, dieren) van `main` en van je branch naast elkaar en vergelijk ze pixel voor pixel.

Uit TripScouts, over spelregels:
- **Botsvolgorde telt.** De stekels werden vóór de dieren gecontroleerd: wie op een dier landde dat door de bramen liep, zakte in die stap een paar pixels de stekeltegel in en kreeg een tik in plaats van het dier om te gooien. Laat beide controles het over dezelfde stand eens zijn, inclusief hoe ver het dier in die stap nog kan lopen.
- **Dieren die op je af komen maken tests onvoorspelbaar.** Laat het hulpje dat het poppetje ergens neerzet, de dieren vlak bij die plek eerst weghalen.
- **Een rit (spoorfiets) is een eigen toestand**, met eigen snelheid en eigen botsingen. Laat het poppetje op de rails staan en tel een sprong apart op (`railJump`), en laat de botsing het getekende poppetje volgen (grootte, bukken, sprong), anders klopt "kinderen passen eronder" niet.

Uit TripScouts, over tests:
- **Een test moet de fout kunnen zien.** Draai een nieuwe test ook op de oude code: faalt hij daar niet, dan test hij niets. (Een test zette de juiste offline kopie terug vóór hij keek.)
- **Snellere code maakt racende tests zichtbaar.** De focus in een menu komt één beeld later; toen het tekenen sneller werd, drukten tests al op een pijltje voordat de focus er was. Wacht in de test op de focus, niet op een vaste tijd.
- **Een testopstelling kan zelf iets doen:** een poppetje op y = 0 neerzetten liet het 352 pixels hoog op de spoorfiets "springen". Zet het op de grond.

Uit TripScouts, over publiceren:
- **Lever de lettertypen mee** in plaats van Google Fonts: het werkt offline vanaf het eerste bezoek, er gaat niets naar buiten, en de privacyverklaring klopt.
- **De service worker bewaart alleen de spelpagina als offline kopie.** Anders overschrijft elke andere pagina op de site (de privacypagina, een doorverwijspagina) de kopie van het spel.
- **Onveranderlijke releases** (*immutable releases*) kunnen na publiceren niet meer veranderen: maak per versie een release, met de bestanden er in één keer bij. Een release van vóór die instelling blijft veranderlijk, en dat verbergt het probleem tot je hem ooit opnieuw maakt. Een onderbroken poging laat een concept achter: sla alleen een *gepubliceerde* release met het bestand over.
- **"Latest" kan maar één soort release zijn.** Voor een tweede app een vaste link: een kleine pagina op de site die de hoogste versie opzoekt (niet de eerste in de lijst: een later herhaalde oude build staat bovenaan) en doorstuurt.
- **Twee PR's die dezelfde regel naar hetzelfde versienummer zetten, gaan zonder conflict samen**, en dan heeft het tweede hetzelfde nummer als wat al online staat. Verhoog na het samenvoegen.
- **Een AI-reviewer vindt echte randgevallen** (onder 10 fps, een concept-release, een test die zichzelf repareert): neem ze serieus, controleer ze eerst in de code, en laat een test zien dat de oplossing werkt.

## 15. Stappenplan voor een nieuw thema

1. **Intake** (§2): wie, foto's, waar, wanneer, per dag, bijzondere dagen, persoonlijke details, apparaten.
2. **Repository** met deze opzet: `AGENTS.md`/`CLAUDE.md`, `README.md`, `docs/blueprint.md`, workflows, `renovate.json`, `.nvmrc`, Pages-bron op GitHub Actions.
3. **Titelscherm met aftelling, de poppetjes en het eerste level**, met tests en de app (service worker, manifest, versie). Laat de poppetjes zien en verbeter ze.
4. **Alle dagen**: met de hand voor de bijzondere dagen, de rest met de generator (een `seed` per dag). Codes uit feiten over de plek. Bereikbaarheid en uitspelen in de tests.
5. **Thema's per dag** (bos, huis, sneeuw, stad, of nieuwe): achtergrondlagen, tegels, decoratie, vijanden, verzamelobjecten.
6. **Apparaten:** controller, afstandsbediening, het brede menu, iPhone/iPad, meldingen.
7. **De tv-app** en Google Play (als de familie een Google TV heeft).
8. **Een eigen domein** (als de familie dat wil), vóór het echte spelen begint.
9. **Laten spelen en bijschaven**: snelheid op de tv, besturing, poppetjes, grappen.

## 16. Checklists

### Een level toevoegen
1. Kies de dag en het thema; schrijf wat je zoekt, de opdracht, de code met aanwijzingen, de grappen en de zin bij het halen.
2. Bouw het met de generator (een nieuw `seed`) of met de hand.
3. Zet het op de goede plek in `LEVELS`; werk de tests (`DAYS`), het issueformulier en `AGENTS.md` bij.
4. `npm test`; bekijk het op computer, telefoon (rechtop en in de breedte) en tv-formaat.
5. Verhoog de versie (`CACHE` en `GAME_VERSION`).

### Voor elke pull request
- Versie verhoogd; nieuwe bestanden in `index.html` en `sw.js`.
- Alle tests slagen (en de tv-app bouwt).
- `AGENTS.md` bijgewerkt.
- Schermafbeeldingen bekeken van alles wat veranderde, op computer, telefoon en tv-formaat.
- Bij optimalisaties: beelden van `main` en de branch pixel voor pixel vergeleken.
- Release notes voor Google Play in de beschrijving.

## 17. Beginprompt voor een nieuw project

Plak dit in een nieuwe Claude Code-sessie in een lege repository (na dit bestand naar `docs/blueprint.md` te kopiëren), en vul de haakjes in. Voeg foto's van de mensen (en van auto's of andere bijzondere dingen) toe.

```
Ik wil een platformspel in de browser maken met het thema [THEMA],
op de manier van docs/blueprint.md. Lees het eerst en volg de techniek,
de opbouw, de toon en de checklists. Stel de vragen uit de intake (§2)
die ik hieronder nog niet beantwoord, in één keer.

Wie: [namen, gezinnen, familie van elkaar; voor kinderen de klas]
Foto's: [bijgevoegd; wat moet er wel/niet in, zoals een bril]
Waar en wanneer: [de plek, de datums, feiten over het huis]
Per dag: [een idee voor een level per dag]
Bijzondere dagen: [verjaardagen (hoe oud), feestdagen, dagen die rustig moeten blijven]
Persoonlijke details: [hobby's, auto's, lievelingseten en -drinken, en wat juist niet]
Apparaten: [computer, Android, iPhone/iPad, Google TV, controllers]
Repository en adres: [eigenaar/naam], [eigen domein of GitHub Pages]

Begin met het titelscherm (met aftellen), de poppetjes, de besturing en
het eerste level, met tests, de app en AGENTS.md. Laat de poppetjes zien
voor je verder gaat. Open per wijziging een pull request; push nooit
direct naar main.
```
