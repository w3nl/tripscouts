"use strict";
// Languages: Dutch for a Dutch browser, otherwise English. Every text in the game is written as T("English", "Nederlands").
// The choice is remembered; ?lang=nl or ?lang=en in the link also works (handy for tests and sharing).
const LANG_KEY = "cabin-week-lang";
const LANG = (() => {
  const q = /[?&]lang=(en|nl)\b/.exec(location.search);
  if (q) { try { localStorage.setItem(LANG_KEY, q[1]); } catch (e) {} return q[1]; }
  try { const v = localStorage.getItem(LANG_KEY); if (v === "en" || v === "nl") return v; } catch (e) {}
  return /^nl(?:-|$)/i.test(navigator.language || "") ? "nl" : "en";
})();
/** Pick the text in the current language. */
function T(en, nl) { return LANG === "nl" ? nl : en; }
/** Switch language: remember it and reload (all texts are built when the game loads). */
function setLang(l) {
  try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete("lang"); location.replace(u.toString());
}
// Texts in index.html: English in the page, Dutch in data-nl (and data-nl-label for aria-label, data-nl-title for title,
// data-nl-content for a meta tag).
document.documentElement.lang = LANG === "nl" ? "nl" : "en-GB"; // British English
if (LANG === "nl") {
  document.querySelectorAll("[data-nl]").forEach(el => { el.innerHTML = el.getAttribute("data-nl"); });
  document.querySelectorAll("[data-nl-label]").forEach(el => el.setAttribute("aria-label", el.getAttribute("data-nl-label")));
  document.querySelectorAll("[data-nl-title]").forEach(el => el.setAttribute("title", el.getAttribute("data-nl-title")));
  document.querySelectorAll("[data-nl-placeholder]").forEach(el => el.setAttribute("placeholder", el.getAttribute("data-nl-placeholder")));
  document.querySelectorAll("[data-nl-content]").forEach(el => el.setAttribute("content", el.getAttribute("data-nl-content")));
}
