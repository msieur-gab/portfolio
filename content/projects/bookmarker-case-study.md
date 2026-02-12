---
title: "Bookmarker: A Reading Vault"
description: "When reading became surveillance, I stopped fighting the trackers and removed the battlefield entirely."
category: case-study
subcategories:
    - privacy
    - design-engineering
    - pwa
tags:
    - privacy-first
    - local-first
    - pwa
    - readability
    - web-components
    - vanilla-js
related:
    articles:
        - content/consent-shield.md
        - content/data-mirror.md
    links:
        - title: "WhoTracks.Me — Ghostery Tracker Database"
          url: https://www.ghostery.com/whotracksme/
        - title: "Princeton Web Census — 1M-Site Measurement"
          url: https://webtransparency.cs.princeton.edu/webcensus/
        - title: "Pew Research — How Americans View Data Privacy"
          url: https://www.pewresearch.org/internet/2023/10/18/how-americans-view-data-privacy/
status: published
project:
    status: active
    timeline:
        start: 2024-06
    client: Personal Project
---

# Bookmarker
### When reading became surveillance, I built a way out.

**Role:** Design Engineer — Research, Architecture, Implementation
**Stack:** Vanilla JS, Lit Web Components, PWA, Mozilla Readability
**Approach:** Local-first, zero-dependency, privacy by architecture


**Every article you read online is read back. By an average of 43 trackers, loading 6.77 seconds of surveillance infrastructure you never asked for, reporting to companies you've never heard of. Consent banners promise you control. The data says otherwise. What if reading could just be reading again?**


###### Problem Statement
## The page behind the page

Open any news article. Before a single word renders, something else loads first.

Google trackers are present on 74% of all web traffic. Out of the top 10,000 websites, only 62 have zero connection to Google — not even a font. The average news site carries 43 third-party trackers. The New York Post and Houston Chronicle load 85 each. The Daily Mail holds the record at 125. All of the top 5 third-party trackers, and 12 of the top 20, are owned by a single company.

This is not abstract. It has a measurable cost.

```chart-bar
title: The Speed Tax — News Sites With vs Without Trackers
description: Pingdom, "The Impact of Ad Tags on Site Speed" (top 50 news sites analysis)

Metric, With Trackers, Without Trackers
Average Load Time (seconds), 9.46, 2.69
Sites Loading Under 3s (%), 12, 76
Sites Loading Over 9s (%), 42, 4
```

A page that loads in 2.69 seconds clean takes 9.46 seconds when it carries its surveillance payload — 3.5× slower. On mobile, where 61.6% of all web traffic now originates, pages load 70.9% slower than desktop. The people with the least bandwidth pay the highest price.

Amazon calculated that every 100 milliseconds of added latency costs 1% in sales. Vodafone found that a 31% improvement in page load increased sales by 8%. The Financial Times measured a 4.6% drop in article views per second of delay. The trackers are not free. They cost attention, they cost time, and they cost comprehension — research confirms that digital ads measurably reduce reading speed and text processing.


###### The Reframing
## Consent is not control

The obvious response is: "But we have consent banners now. GDPR fixed this."

The data tells a different story.

A study of 81 German websites found that 79% load trackers before the consent banner even appears. An average of 3 trackers activate before the user has made any choice — up to 13 on some sites. After clicking "Reject All," an average of 4 trackers persist. After "Accept All," up to 63 activate.

```chart-bar
title: Consent Theater — What Actually Happens When You Choose
description: Bollinger, Englehardt & Narayanan (CHI 2025, n=254,148); Kaspersky/Securelist Web Trackers Report 2023–2024

Stage, Average Trackers Active
Before Any Consent Choice, 3
After Reject All, 4
After Accept All, 18
Maximum Observed After Accept, 63
```

Across 254,148 websites in 31 countries, only 15% of consent interfaces meet even minimal GDPR compliance. Three organisations control 37% of all consent management platforms. The system designed to give people control has been captured by the industry it was meant to regulate.

And people know it doesn't work — they just can't do anything about it. 89.3% of users choose a bulk option: accept all or reject all. Only 1.3% — 17 people out of 1,280 surveyed — ever personalise their consent preferences. Europeans collectively spend 575 million hours per year clicking through consent banners. 78% of Americans routinely sign away their data rights without reading. Not because they don't care — 81% report being concerned about how companies use their data — but because the mechanism designed to protect them demands constant vigilance against deliberately hostile interfaces.

```chart-bar
title: The Privacy Paradox — Concern vs Understanding
description: Pew Research Center (October 2023, n=5,101)

Domain, Concerned (%), Understand (%)
Company Data Use, 81, 33
Government Data Use, 71, 23
Data Privacy Laws, 72, 28
```

The gap between concern and understanding is the design failure. People care deeply about privacy but have almost no comprehension of what's happening or what the laws actually do. 84% feel they've lost control of their personal information. 60% believe it's impossible to avoid data collection entirely.

912 million people now use ad blockers — 21× growth since 2012, projected to surpass one billion by 2026. In Germany, 49% of internet users block ads. The top reason isn't aesthetics. It's self-defence.

```chart-line
title: The Rise of Ad Blocking (millions of users)
description: Blockthrough/Statista Q2 2023; GWI Q1 2024 (2026 projected)

Metric, 2012, 2014, 2016, 2018, 2020, 2022, 2023, 2026
Global Users (M), 44, 121, 236, 380, 586, 763, 912, 1000
```


###### The Investigation
## Three experiments that changed the question

I didn't start by building a reader. I started by trying to make the invisible web visible.

**Experiment 1: Data Mirror.** A tool that reflects back everything a website can harvest from your browser — hardware fingerprint, GPU renderer, timezone, stored credentials. No simulations. Your actual data. The goal was educational: show people the "oh shit" moment. It worked. People were shocked. But shock fades. Awareness alone doesn't change behaviour.

**Experiment 2: Consent Shield.** A bookmarklet that scans any page, identifies tracker domains, and attempts to block them at the network level. It intercepted requests, refused cookies, and reported what it found. It taught me three things: legitimate interest clauses bypass consent entirely, server-side tracking is invisible to client-side tools, and Content Security Policy headers can block the blocker itself. You can't win an arms race fought on someone else's infrastructure.

**Experiment 3: Consent Invaders.** A Space Invaders game where the enemies are real tracker domains harvested from the page you're visiting. Google Analytics, Facebook Pixel, Criteo, Taboola — descending toward your browser while you try to shoot them down. Ludic proof of a serious point: even when you fight back, there are always more. The game is unwinnable by design, because the real game is unwinnable too.

```flow LR
[<roundrect> Data Mirror] -> awareness -> [<roundrect> Consent Shield] -> resistance -> [<roundrect> Consent Invaders] -> recognition -> [<diamond> The question changes]
```

Three experiments. Three progressive realisations. The problem isn't that we can't see the trackers, or that we can't block them. The problem is that we're fighting on their turf. The article lives on a server controlled by someone whose business model depends on surveilling you. No amount of blocking, consenting, or resisting changes that structural reality.

The question shifted from "how do I protect the reader inside the page?" to "what if the reader never enters the page at all?"


###### The Solution
## Remove yourself from the battlefield

Bookmarker doesn't block trackers. It doesn't manage consent. It doesn't fight the surveillance web. It removes you from it entirely.

The architecture is deliberately simple: share a URL from any app on your phone. A serverless function fetches the page once, passes it through Mozilla's Readability engine — the same one Firefox Reader Mode uses — extracts the semantic content, converts it to clean Markdown, and sends it back to your device. The content is stored locally. The function retains nothing. No account. No cloud. No profile.

```flow TB
[<roundrect> Share URL from any app] -> [<roundrect> Netlify Serverless Function] -> [<roundrect> Mozilla Readability Extraction] -> [<roundrect> Semantic Markdown Conversion] -> [<roundrect> Local Device Storage (IndexedDB)]
```

What arrives on your device is the article — headings, paragraphs, citations, images — stripped of every tracking parameter, every analytics pixel, every behavioural beacon. URLs are normalised: the 15+ UTM codes, click IDs, and session tokens that follow you across the web are removed before storage.

The reading experience is yours to shape. Typography controls let you set font family, size, line height, and margins. Light and dark themes. Reading position memory across sessions — close the app mid-paragraph, return days later to the same line. Text selection for highlighting with contextual notes that anchor back to their passage. All stored locally, all exportable as Markdown.

This is a PWA — a progressive web app that installs from the browser, works offline, and integrates with Android's share sheet as a native-feeling target. No app store. No gatekeeper. No update approval process. The web platform, used as intended.

The legal position is clean. User-initiated extraction of publicly accessible content, processed ephemerally, stored only on the user's own device. The same model established by Pocket, Instapaper, and Wallabag — save for later, read without surveillance.


###### What It Opens
## The space Pocket left behind

In February 2025, Mozilla shut down Pocket — the most widely used read-it-later service — stating that "the way people save content has evolved." Instapaper, acquired by an AI text-to-speech company, is barely maintained. Wallabag requires self-hosting and developer skills. The consumer-friendly, privacy-first reading space is essentially empty.

But Bookmarker isn't positioned as "the next Pocket." Pocket was save-for-later. Bookmarker is escape-the-surveillance-web-entirely. Different premise. The demand is proven — 912 million ad blocker users say so. The incumbent just left. And the need is deeper than convenience.

Research consistently shows that sustained, uninterrupted reading builds cognitive infrastructure: abstract reasoning, perspective-taking, critical analysis, resistance to misinformation. When that reading happens inside a surveillance apparatus — where every choice feeds a behavioural profile, where attention is the product being sold — the cognitive benefits are compromised by the very medium delivering them.

```flow TB
[<roundrect> Pain: 43 trackers per page] -> bookmarklet reveals -> [<roundrect> Awareness: the invisible web] -> game proves unwinnable -> [<roundrect> Insight: stop fighting on their turf] -> architecture shift -> [<roundrect> Solution: content comes to you, clean]
```

Bookmarker is a small tool. One person, vanilla JavaScript, no venture capital, no growth metrics. It doesn't scale the way platforms scale. That's the point. It doesn't need to harvest attention to survive. It doesn't need your data to function. It just holds your articles until you're ready to read them.

Reading should remain a private, intentional act. Not a commodity. Not a signal. Not a data point.

A reading vault. Nothing more. Nothing less.
