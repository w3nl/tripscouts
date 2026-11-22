# Fonts

The game's two fonts are in the repository, so the game never loads anything from Google Fonts: no request leaves the player's device, it works offline from the first visit, and the privacy policy stays true.

| Font | Used for | Licence |
|---|---|---|
| [Fredoka](https://github.com/hafontia/Fredoka-One) (variable, weights 300–700) | headings, buttons, numbers (`--display` in `css/game.css`) | SIL Open Font License 1.1: [OFL-Fredoka.txt](OFL-Fredoka.txt) |
| [Nunito](https://github.com/googlefonts/nunito) (variable, weights 200–1000) | body text (`--body`) | SIL Open Font License 1.1: [OFL-Nunito.txt](OFL-Nunito.txt) |

Each font has two WOFF2 files, the `latin` and `latin-ext` subsets as Google Fonts splits them (the `unicode-range` of each is in the `@font-face` rules at the top of `css/game.css`). Latin covers English and Dutch; latin-ext is for names like Šibenik. Other scripts fall back to the system font. Emoji always come from the system.

To update them: download the files from the `css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800` stylesheet of Google Fonts (use a modern browser as User-Agent to get WOFF2) and keep the file names. A new `.woff2` file in this folder needs an entry in `CORE` in `sw.js`.
