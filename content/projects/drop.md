---
title: "Drop: A Water Refill Finder"
description: "A water refill finder that lives on a bottle cap. NFC tag triggers the PWA — scan, see, walk. Not a utility app with features, a quiet prompt to drink."
thumbnail: /content/media/water_droplet.jpg
date:
    published: 2026-02-08
status: published
category: project
project:
    status: active
    timeline:
        start: 2026-02
    client: Personal Project
tags:
    - pwa
    - nfc
    - vanilla-js
    - phygital
---

# Drop
### When finding water is harder than buying plastic, the bottle failed.

**Role:** Design Engineer — Research, Architecture, Implementation
**Stack:** Vanilla JS, ES Modules, Leaflet, Overpass API, PWA
**Approach:** Offline-first, no accounts, no tracking, physical trigger

**Reusable bottles fail at the moment they matter most — when you're thirsty and can't find water. Drop removes that friction. An NFC tag on the bottle cap. A tap. A map. Walk.**

::prototype{src="https://drop-water.netlify.app/" height="700" caption="Live prototype — tap to explore the map, find water points nearby"}

###### Problem Statement
## The last-metre problem

Reusable bottles are everywhere. Refill infrastructure is not — or rather, it is, but invisible. Public fountains, café taps, filtered stations in offices and gyms. They exist. People just can't find them when they need them.

The result: 1 million plastic bottles are purchased every minute worldwide. Not because people prefer plastic, but because plastic is findable and water isn't. The problem isn't supply — it's wayfinding at the moment of need.

Existing solutions assume you'll open an app, search, scroll, filter. They treat water-finding as a feature inside a utility. But thirst is immediate. The interface needs to be as fast as the impulse.

###### The Design
## The bottle is the interface

Drop starts with a physical object — an NFC tag embedded in a bottle cap. Tap your phone to the cap. The PWA opens. Your location resolves. Nearby water points appear on the map.

No app store. No account. No onboarding. The tag carries a URL with the bottle volume encoded (`?vol=750`). The app knows your bottle, tracks your refills locally, and shows weekly stats — all without ever creating a profile or sending data anywhere.

```flow LR
[<roundrect> Tap bottle cap (NFC)] -> [<roundrect> PWA launches] -> [<roundrect> Geolocate] -> [<roundrect> Show water points] -> [<roundrect> Walk & refill]
```

The NFC tag isn't a gimmick. It's the design. The app doesn't live on a home screen competing for attention. It exists in the moment of need, launched by a physical gesture tied to the object itself. When your phone doesn't support NFC, the launch screen shows briefly, then skips to the map — graceful degradation, not a dead end.

###### Architecture
## Public infrastructure, all the way down

Every technical dependency is open commons:

- **Leaflet** for maps — battle-tested, lightweight, no API key
- **OpenStreetMap** via Overpass API for water point data — the commons, not a product
- **OSRM** for walking routes — open source routing
- **IndexedDB** for local storage — your data stays on your device

Three Overpass mirrors with sequential fallback handle the API's frequent timeouts. Water points are cached locally — cache-first display with background refresh. The map works offline with cached data. Seven-day stale pruning keeps things fresh without network dependency.

```flow TB
[<roundrect> NFC / URL] -> [<roundrect> Geolocation (or tap map)] -> [<roundrect> IndexedDB Cache] -> display -> [<roundrect> Map with markers]
[<roundrect> Geolocation (or tap map)] -> [<roundrect> Overpass API (3 mirrors)] -> cache -> [<roundrect> IndexedDB Cache]
[<roundrect> Map with markers] -> tap marker -> [<roundrect> Detail card + route]
[<roundrect> Detail card + route] -> refill -> [<roundrect> Local refill log]
```

###### Decisions
## What was rejected and why

**No app store.** A water finder should be as free as the water it helps you find. PWA installs from the browser. No gatekeeper, no review process, no update approval. The web platform, used as intended.

**No accounts.** Refill tracking uses IndexedDB. Your data never leaves your device. There is no server to breach, no profile to sell, no terms to accept. If you clear your browser, your history is gone — and that's fine.

**No geolocation requirement.** When the browser denies location access, the map still loads. Tap anywhere to set your position manually. Tested in the prototype, proven pattern — no permission should be a dead end.

**No feature creep.** Drop finds water. It doesn't rate fountains, review cafés, gamify hydration, or build a social graph around drinking. The app serves the moment of thirst and gets out of the way.

###### What It Opens
## A quiet prompt

912 million people use ad blockers. Millions more carry reusable bottles. The overlap — people who care about both digital and physical waste — is the audience. Not through marketing, but through the object itself. Every bottle cap is a distribution channel. Every refill is proof the design works.

Drop is small by design. One person, vanilla JavaScript, no venture capital. It doesn't scale the way platforms scale. It scales the way water fountains scale — by being there when you need them and invisible when you don't.
