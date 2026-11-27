# Changelog

## 1.0.2 — 2026-11-26

- **Fixed on Windows:** LUNA on Windows sizes the page to the window's outer size, title bar and frame included, so the bottom 39 px and the right 16 px were hidden. The page now leaves that space out on Windows, so everything at the bottom and right edges shows in full.
  the part you can see, so the controls at the bottom were hidden. The page now fits itself to
  the window size LUNA reports; nothing changes where the two match.
- **Report copy:** Alt-click on the version now always says in the status bar that the report was copied. Where the system clipboard is blocked (seen on some Windows set-ups) it uses a fallback, and if that fails too it shows the report selected so you can copy it by hand.

## 1.0.1 — 2026-11-25

- A short getting-started guide: the first time it opens it asks for your language, then walks
  you through the window in it. The **?** button brings it back.

## 1.0.0 — 2026-11-22

- First release: session speed from 25 % to 150 % keeping the pitch, with LUNA's own session
  speed; presets, fine slider, on/off and back to 100 %.
- Takes recorded at another speed are fitted to the tempo by themselves when recording stops.
- Effective tempo display, dark and grey themes, 7 languages.
