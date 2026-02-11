---
title: "Charts & Graphs"
description: "Markdown-embedded data visualizations and flow diagrams - demonstrated with Pebbble project data"
category: experiments
status: published
series: 53
---

# Charts & Graphs in Markdown

This portfolio supports embedded charts and flow diagrams directly in markdown. Below are examples using real data and architecture from the Pebbble project.

## Pebbble System Architecture

The complete data flow from parent recording to child playback, featuring NFC, IPFS, and client-side encryption.

```flow TB
# Pebbble - NFC Stone to Audio Player
[<ellipse icon:user> Parent] -> tap -> [<hexagon icon:nfc> NFC Stone]
[<hexagon icon:nfc> NFC Stone] -> read tag -> [<icon:phone> Phone NFC Reader]
[<icon:phone> Phone NFC Reader] -> extract URI -> [<icon:cog> PWA Service Worker]
[<icon:cog> PWA Service Worker] -> resolve CID -> [<icon:cloud> IPFS Gateway]
[<icon:cog> PWA Service Worker] -> fetch key -> [<database icon:key> Local Keystore]
[<icon:cog> PWA Service Worker] -> cache -> [<database icon:disk> Offline Storage]
[<icon:cloud> IPFS Gateway] -> encrypted blob -> [<icon:lock> Decryption Layer]
[<database icon:key> Local Keystore] -> secret key -> [<icon:lock> Decryption Layer]
[<icon:lock> Decryption Layer] -> plaintext audio -> [<icon:play> Audio Player]
[<database icon:disk> Offline Storage] -> prefetched -> [<icon:play> Audio Player]
[<icon:play> Audio Player] -> stream -> [<ellipse icon:user> Child]
```

The system ensures voice messages reach children regardless of network conditions or censorship.

## The Problem: Parental Child Abduction

International parental child abduction cases reported to authorities - the visible fraction of an unmeasurable problem.

```chart-bar
title: Reported International Parental Child Abduction Cases
description: Cases reported to central authorities (2020-2023)

Country, 2020, 2021, 2022, 2023
USA, 700, 700, 982, 982
France, 540, 544, 544, 661
Germany, 604, 650, 599, 527
UK, 239, 243, 258, 243
Canada, 122, 199, 199, 199
```

These numbers represent only cases that reach official channels. The true scope is unknowable.

## Upload Flow: Parent Side

How a parent records and uploads a voice message to the decentralized network.

```flow LR
# Voice Recording Upload Flow
[<ellipse icon:user> Parent] -> record -> [<icon:speaker> Voice Memo]
[<icon:speaker> Voice Memo] -> encrypt -> [<icon:lock> AES-256]
[<icon:lock> AES-256] -> upload -> [<icon:cloud> IPFS Pin]
[<icon:cloud> IPFS Pin] -> return CID -> [<icon:cog> App]
[<icon:cog> App] -> write URI -> [<hexagon icon:nfc> NFC Stone]
```

The stone becomes a permanent, battery-free pointer to the encrypted content.

## Technology Stack Distribution

The core technologies powering Pebbble's censorship-resistant architecture.

```chart-donut
title: Core Technology Stack

Component, Weight
IPFS/Decentralized Storage, 35
NFC/Physical Interface, 25
Web Crypto/Encryption, 20
PWA/Offline Support, 15
Audio Processing, 5
```

Each layer serves a specific purpose in ensuring voice reaches its destination.

## Playback Modes

Pebbble supports two distinct modes based on device ownership and safety requirements.

```flow TB
# Playback Mode Decision
[<ellipse icon:user> Child] -> tap stone -> [<icon:phone> Device]
[<icon:phone> Device] -> check -> [<diamond> Owned Device?]
[<diamond> Owned Device?] -> yes -> [<roundrect> Persistent Mode]
[<diamond> Owned Device?] -> no -> [<roundrect> Ephemeral Mode]
[<roundrect> Persistent Mode] -> cache audio -> [<database icon:disk> Local Storage]
[<roundrect> Ephemeral Mode] -> play once -> [<icon:play> Stream Only]
[<database icon:disk> Local Storage] -> replay anytime -> [<icon:speaker> Audio Output]
[<icon:play> Stream Only] -> leave no trace -> [<icon:speaker> Audio Output]
```

Ephemeral mode protects children in dangerous situations by leaving no evidence.

## Growth Trajectory

Projected adoption across different use cases over the next 24 months.

```chart-area
title: Projected User Segments
description: Monthly active families by use case

Month, M1, M3, M6, M12, M18, M24
Travel Parents, 50, 150, 400, 1200, 2500, 4000
Military Families, 20, 80, 200, 600, 1200, 2000
Separated Parents, 30, 100, 300, 800, 1500, 2500
At-Risk Cases, 5, 20, 50, 150, 400, 800
```

The architecture designed for the hardest case serves all cases.

## Network Resilience

IPFS gateway performance across different regions and network conditions.

```chart-line
title: Gateway Response Times (ms)
description: Median latency by region

Region, North America, Europe, Asia, Africa, South America
Optimal, 45, 65, 120, 180, 150
Degraded, 120, 180, 350, 520, 420
Offline/Cached, 5, 5, 5, 5, 5
```

Offline caching ensures playback regardless of network state.

## Security Layers

The encryption and verification layers protecting voice content.

```flow TB
# Security Architecture
[<icon:cloud> IPFS Content] -> verify -> [<icon:shield> Content Hash]
[<icon:shield> Content Hash] -> match? -> [<diamond> Integrity Check]
[<diamond> Integrity Check] -> pass -> [<icon:key> Decrypt]
[<diamond> Integrity Check] -> fail -> [<icon:warning> Reject]
[<icon:key> Decrypt] -> AES-256-GCM -> [<icon:speaker> Plaintext Audio]
[<database icon:key> Keystore] -> provide key -> [<icon:key> Decrypt]
```

Content integrity is guaranteed by cryptographic hash verification.

## Audio Quality vs. Size

Balancing voice clarity with bandwidth constraints for global accessibility.

```chart-scatter
title: Audio Quality Trade-offs

Bitrate (kbps), Clarity Score, Format
24, 65, Opus
32, 75, Opus
48, 85, Opus
64, 92, Opus
96, 95, AAC
128, 97, AAC
```

Opus codec provides excellent voice quality at low bitrates, critical for constrained networks.

## Syntax Reference

### Chart Types

| Block | Description |
|-------|-------------|
| `chart-bar` | Categorical comparison |
| `chart-line` | Trends with data points |
| `chart-area` | Magnitude over time |
| `chart-pie` | Proportional parts |
| `chart-donut` | Proportional with center |
| `chart-scatter` | Two-variable correlation |

### Flow Diagram Shapes

| Syntax | Shape | Use |
|--------|-------|-----|
| `[Label]` | Rounded rect | Default process |
| `[<rect> Label]` | Rectangle | Process step |
| `[<diamond> Label]` | Diamond | Decision point |
| `[<ellipse> Label]` | Ellipse | Start/end |
| `[<database> Label]` | Cylinder | Data store |
| `[<hexagon> Label]` | Hexagon | External system |

### Icons

Add icons with `icon:name` syntax: `[<shape icon:name> Label]`

Available: `user`, `lock`, `key`, `cloud`, `database`, `phone`, `cog`, `play`, `speaker`, `shield`, `warning`, `nfc`, `disk`, and more.
