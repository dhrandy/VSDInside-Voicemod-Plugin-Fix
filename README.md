# Voicemod Plugin (Optimized VSDinside Edition)
A fully optimized, persistent‑connection Voicemod plugin for VSDinside, rewritten for speed, stability, and responsiveness. This version eliminates the long delays, reconnection storms, and repeated API calls found in the original plugin.
## 🚀 Overview
This is for the Voicemod plugin version 2.1, the one you download within the app. This plugin is a performance‑enhanced rebuild of the Voicemod integration used in VSDinside dashboards. The original plugin repeatedly reconnected to Voicemod and reloaded all data every time a page appeared, causing 20–30 second freezes, UI lag, audio‑engine reinitialization, multiple WebSocket connections, and heavy repeated API calls. This optimized version fixes all of that. This is only for the VSDInside, not any other Stream Decks like the Elgato or otherwise.
## ⚡ Key Improvements
✔ Persistent WebSocket Connection — The plugin now connects to Voicemod once and keeps that connection alive.  
✔ Full Caching Layer — The plugin caches all Voicemod data, including voices, current voice, soundboards, bitmaps, background effect status, mute status, hear‑my‑voice status, and mute‑for‑me status.  
✔ Zero Re‑Initialization on Page Switch — No more reloading everything when switching pages.  
✔ Instant Page Switching — No more long delays or UI freezes.  
✔ Auto‑Update Disabled — Hopefully it works, just rename the plugin.
## 📦 Installation
1. Download or clone this repository.
2. Make a backup of your index.js file in the C:\Users\<your-username-goes-here>\AppData\Roaming\HotSpot\StreamDock\plugins\com.hotspot.streamdock.voicemod_custom.sdPlugin\plugin
3. Place the index.js file into your VSDinside plugins directory C:\Users\<your-username-goes-here>\AppData\Roaming\HotSpot\StreamDock\plugins\com.hotspot.streamdock.voicemod_custom.sdPlugin\plugin.  
4. (Optional) Rename the folder to avoid conflicts and to possibly keep it from updating:  
   com.hotspot.streamdock.voicemod_custom  
5. Restart VSDinside.  
6. Add the Voicemod actions to your dashboard.
## 🔒 Preventing Auto‑Updates
I renamed the plugin to com.hotspot.streamdock.voicemod_custom.sdPlugin. I'm not sure if that'll help or not. I don't think the plugin auto-updates.
This (hopefully) ensures no silent updates, no overwriting your optimized version, and no reverting to the slow original plugin.
## 🧠 How It Works (Plain English)
The original plugin reconnected to Voicemod every time a page loaded, reloaded all voices, soundboards, and icons, forced Voicemod to rebuild its audio engine, and caused long delays and UI freezes. The optimized version connects once, remembers everything, only updates when Voicemod actually changes something, and makes page switching instant.
## Attribution
This project is based on the original HotSpot Voicemod plugin. The version I originally obtained was a free, redistributed copy provided by key123.vip. This repository contains an optimized, persistent‑connection version designed for VSDinside.
## ❤️ Credits
Original plugin by HotSpot. Redistribution by key123.vip. Optimization, caching system, and stability improvements by dhrandy.
