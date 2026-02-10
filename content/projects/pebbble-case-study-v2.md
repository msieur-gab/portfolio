---
title: "Pebbble: A Stone That Carries Voices"
description: "Designing for the families that technology forgot — NFC, IPFS, and client-side encryption in a handcrafted stone."
date:
    published: 2024-06-01
status: published
category: project
tags:
    - privacy
    - family
    - NFC
    - IPFS
    - encryption
    - voice
    - PWA
project:
    status: in-progress
    timeline:
        start: 2024
---

# Pebbble
### A stone that carries voices.

**Role:** Creator & Lead Designer/Engineer
**Status:** Active development
**Period:** 2024–present

## The Families That Technology Forgot

There are co-parenting apps that track schedules. Video calling platforms that compress faces into rectangles. Messaging tools that store every word on servers owned by companies that will sell, subpoena, or shut down.

None of them were designed for a three-year-old who cannot read. None of them were designed for a parent whose messages are monitored. None of them were designed for the moment a child is taken across a border and the silence begins.

```chart-bar
title: Reported International Parental Child Abduction Cases
description: Cases reported to central authorities (2020–2023)

Country, 2020, 2021, 2022, 2023
USA, 700, 700, 982, 982
France, 540, 544, 544, 661
Germany, 604, 650, 599, 527
UK, 239, 243, 258, 243
Canada, 122, 199, 199, 199
```

These are only the cases that reach official channels. Approximately 800 American children and 1,800 European children are victims of international parental abduction every year. Seventy-five percent are under six. Less than 40% of cases are resolved. And beyond abduction: military families, cross-border work, custody across distance. Millions of households where a parent's daily presence has been replaced by silence.

I am personally familiar with this silence. But the reason I designed Pebbble is not personal — it is that an entire industry looked at these families and offered them scheduling apps.

## Voice, Not Text

A child recognizes their parent's voice from birth. By two months, that voice is encoded as a marker of safety. For a child too young to read, voice is not a communication channel — it is the primary medium of parental presence. When that voice disappears, the child does not lose information. They lose the feeling of being held.

This insight shaped every decision: the medium is voice. Everything else follows.

## A Stone

The object needed to be something a child could keep without it being confiscated. Something that draws no attention. Something that does not need charging, updating, or explaining.

Children collect stones. Have always collected them — regardless of gender, culture, or age. A stone on a nightstand is invisible. A stone in a pocket is unremarkable. A stone in the hands of a child being monitored raises no suspicion.

![Pebbble — handcrafted NFC stones](media/pebbble-form.jpg "cover")

Inside each handcrafted stone: an NFC chip. No battery. No screen. No moving parts. The chip waits, passive, drawing power from the device that reads it only at the moment of reading. It will wait for decades.

Hold the stone to a phone. Hear your parent's voice.

## How It Works

A parent records a voice message. It is encrypted on-device using a key derived from the stone's unique NFC serial number. The encrypted file is uploaded to IPFS, where it is addressed by content hash, not location. The stone stores only the pointer. When a child taps the stone, the process reverses.

```flow TB
# Pebbble — Voice to Stone to Voice
[<ellipse icon:user> Parent] -> record -> [<icon:speaker> Voice Message]
[<icon:speaker> Voice Message] -> encrypt -> [<icon:lock> AES-256]
[<icon:lock> AES-256] -> upload -> [<icon:cloud> IPFS Network]
[<icon:cloud> IPFS Network] -> return CID -> [<hexagon icon:nfc> Stone]
[<hexagon icon:nfc> Stone] -> tap -> [<icon:cog> App]
[<icon:cog> App] -> fetch + decrypt -> [<icon:play> Audio Player]
[<icon:play> Audio Player] -> stream -> [<ellipse icon:user> Child]
```

Every layer solves a specific constraint. **No accounts, no passwords** — the stone is the key. Physical possession is the only authentication. **No central server** — IPFS distributes content across the network. Block one node, it routes through another. A voice recorded in one country reaches a child in another regardless of what stands between them. **No tampering** — content is addressed by cryptographic hash. What was recorded is what will be heard.

And the hardest constraint of all: **no trace when needed.**

## Two Modes

A child with their own phone, in a safe home, keeps the voice available always. Persistent mode: cached, ready whenever loneliness arrives.

But what about a child using a borrowed device? A shared tablet at a shelter? A phone belonging to someone who must not know what it accessed?

```flow TB
# Playback Mode
[<ellipse icon:user> Child] -> tap stone -> [<icon:phone> Device]
[<icon:phone> Device] -> check -> [<diamond> Owned Device?]
[<diamond> Owned Device?] -> yes -> [<roundrect> Persistent Mode]
[<diamond> Owned Device?] -> no -> [<roundrect> Ephemeral Mode]
[<roundrect> Persistent Mode] -> cache -> [<database icon:disk> Local Storage]
[<roundrect> Ephemeral Mode] -> play once -> [<icon:play> Stream Only]
[<icon:play> Stream Only] -> leave no trace -> [<icon:speaker> Audio Output]
[<database icon:disk> Local Storage] -> replay anytime -> [<icon:speaker> Audio Output]
```

Ephemeral mode: the audio plays once. When the app closes, nothing remains. No history, no cache, no evidence. The voice was heard, and then — nothing.

This is not paranoia. This is the reality of situations where evidence of contact could escalate danger. Design that ignores these cases abandons the people who need it most.

## The Hardest Problem First

Design for the extreme case, and the common case becomes trivial.

The hardest version of this problem has the most constraints: no reliable internet, active censorship, a monitored device, a child too young for interfaces, content that must survive hostile infrastructure, technology that must last years without maintenance.

If a parent's voice can reach an abducted child — safely, secretly, persistently — then every other separated family is already served. The military family on deployment. The parent working across time zones. The divorced couple sharing custody across distance. All solved by the architecture designed for the worst case.

This is a working Progressive Web Application with NFC reading, client-side AES-256 encryption, IPFS storage, offline caching, and dual playback modes. The stones are handcrafted. The first batch is made.

A stone. A voice. A child who remembers.
