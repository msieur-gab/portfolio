---
title: Penumbra
description: "An e-ink watch concept exploring time as presence rather than position."
status: published
series: 52
featured: true
category: explorations
tags:
    - interaction-design
    - vanilla-js
    - phygital
date:
    published: 2025-01-15
---

# Penumbra

**An e-ink watch concept exploring time as presence rather than position**

---

## Overview

Penumbra reimagines the analog watch face through overlapping gradient arcs — time rendered not as discrete hands pointing to numbers, but as shadows that compound through transparency. The leading edge marks the present moment; the past dissolves behind it.

Designed for e-ink displays, the concept embraces 1-bit aesthetics while creating the illusion of depth through dithering and alpha compositing.

---

## The Core Idea

Traditional watch hands answer "what time is it?" with precision. Penumbra asks a different question: *what does time feel like?*

Three concentric arcs rotate at different speeds — hours, minutes, seconds. Each arc is a gradient that fades from solid at its leading edge to transparent at its tail. Where arcs overlap, their transparencies compound, creating darker zones that emerge and dissolve as time passes.

The result: you don't read time, you perceive it. The darkest point is always now.

::prototype{src="../prototypes/time_c_v2.html" height="520" caption="Live prototype — toggle options to explore variations"}

---

## Design Principles

**Emergence over indication**
Rather than pointing to time, the display allows time to emerge from the relationship between moving elements. The hour isn't shown — it's revealed through the intersection of hour and minute shadows.

**Transparency as information**
The overlap zones carry meaning. When minute and hour arcs align, their combined darkness marks a moment of convergence. The visual weight shifts continuously around the dial.

**Appropriate ambiguity**
Precise time requires a glance at digits. But for the peripheral awareness of time passing — the felt sense of where you are in an hour or a day — ambiguity serves better than precision.

---

## Variations Explored

**Elapsed vs. Remaining**
The default mode shows elapsed time as a trailing shadow. An inverted mode flips this: remaining time appears as darkness ahead, shrinking as the hour progresses. A countdown rather than a trace.

**Light on Dark**
Inverting the color scheme — white gradients on black background — transforms the metaphor from "shadow cast" to "light revealed." Time becomes luminous rather than weighted.

**With and Without Seconds**
The seconds arc adds a fast-moving shimmer at the edge. Beautiful for focus or meditation contexts, but potentially too active for e-ink's slow refresh rates. The hours-and-minutes version offers quieter contemplation.

---

## Technical Approach

Built as a canvas-based prototype using vanilla JavaScript. Key implementation details:

- Conic gradients rotated to match time position
- Multiple overlapping draw calls with alpha compositing
- Bayer matrix dithering explored for true 1-bit rendering
- Gradient direction follows the arc rotation, not a fixed radial pattern

The prototype runs in real-time, allowing observation of how the visual relationships evolve across hours.

---

## Reflections

This project began with a simple question: what if a watch face had no hands? The overlapping gradient concept emerged from thinking about how traditional clock hands already create implicit relationships — we naturally notice when they align or oppose.

Penumbra makes those relationships explicit and continuous rather than momentary. Every second, the three arcs define a unique visual configuration. Time becomes a space you inhabit rather than a position you note.

---

## Status

Functional prototype. Concept validated through multiple rendering approaches (gradient alpha, ordered dithering, additive/subtractive compositing). Ready for hardware testing on actual e-ink display.

---

*2025 · Concept & Prototyping*
