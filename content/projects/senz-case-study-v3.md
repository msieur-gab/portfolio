---
title: Senz
description: How an innovation lab inside a Fortune 500 insurer built the tool that let domain experts test ideas in hours instead of months.
date:
    published: 2018-09-01
status: published
series: 41
featured: true
category: project
project:
    status: completed
    timeline:
        start: 2018
        end: 2021
tags:
    - ai
    - prototyping
    - insurtech
---

# Senz
### Making sense of ideas.

**Role:** Creator & Tech Lead — Head of Innovation & Creative Technology, Kaiser X Labs (Allianz Group)
**Team:** Internal team + dedicated freelance engineer
**Period:** 2018–2021

## The Speed Problem Nobody Admits

Every large corporation knows it is too slow. That is why innovation labs exist — someone, somewhere in the organization, admitted it out loud.

But admitting the problem and solving it are different things. At Allianz, one of the world's largest insurers, the questions were urgent and familiar to any enterprise: How do we innovate faster? How do we compete with startups that move at ten times our velocity? How do we reach new demographics and renew a customer base that is aging out?

The answers all pointed to the same bottleneck.

```chart-bar
title: The Cost of Testing One Idea
description: What it took to validate a single product concept

Resource, Traditional Pipeline
Disciplines Required, 4
Software Tools, 10
Months to First Test, 9
Budget (€ thousands), 95
```

Before a single user could test a new product concept, the organization needed designers to translate the idea into mockups, developers to build a prototype, researchers to design the test, and analysts to interpret the results. Months of coordination. Budgets that required executive sign-off before anyone knew whether the idea was worth pursuing.

The people who actually understood the customer — the claims processors, the underwriters, the service teams — were filling out spreadsheets and slide decks instead of shaping the products they knew their customers needed. The experts were locked out of the process that needed their expertise most.

Ideas were not failing because they lacked merit. They were failing because the pipeline between "what if" and "let's find out" was too expensive, too slow, and too exclusionary to let most of them through.

> "Everyone wants a magic solution to their problems, but no one wants to believe in magic."
> — Lewis Carroll

## The Thesis

What if domain experts could test their own ideas — without learning design tools, without waiting for developers, without filing a project request?

What if the distance between a sketch on a whiteboard and a testable prototype was seconds instead of months?

I created Senz — *helping people make sense of ideas* — while leading the department of Innovation and Creative Technology at Kaiser X Labs, Allianz's design consulting arm. The goal was not to build a better prototyping tool. It was to collapse the validation cycle so radically that testing an idea became cheaper than debating whether to test it.

## What We Built

Point a phone at a whiteboard sketch. Within seconds, receive an interactive prototype built from production-ready components. Test it with real users the same day.

![Senz sketch-to-code demonstration](media/senz-sketch-to-code.jpg "cover")

The system accepts input from wherever ideas actually happen — paper, whiteboards, tablets, digital files. Computer vision identifies UI elements in the drawing. A classification layer interprets their relationships and hierarchy. A generation engine produces functional code compatible with 98% of modern web frameworks, respecting whichever design system the organization already uses.

But converting sketches to code was the means, not the end. The end was the full cycle.

```flow LR
# Senz Validation Cycle
[<ellipse icon:user> Think] -> hypothesis -> [<icon:cog> Make] -> prototype -> [<icon:chart> Test]
[<icon:chart> Test] -> learn -> [<ellipse icon:user> Think]
```

**Think** — hypothesis and concept. **Make** — sketch to working prototype in seconds. **Test** — built-in analytics, A/B testing, user feedback. One platform. A learning curve low enough that the domain experts locked out of the old process could run a validation cycle themselves.

```chart-bar
title: Validation Cost Compression
description: Traditional enterprise pipeline vs. Senz

Resource, Traditional, Senz
People Required, 4, 1
Software Tools, 10, 1
Time (days), 270, 2
Cost (€), 95000, 5
```

We shipped this in 2018 — six months before Microsoft announced Sketch2Code as a research demo. Ours was not a demo. It was a deployed platform with authentication, real-time collaboration, multi-framework export, and a working beta.

## Building Inside the Machine

Innovation inside a large organization has constraints that a garage startup does not. You operate within existing infrastructure, security requirements, and stakeholder expectations. You also have something startups lack: direct access to the problem at enterprise scale.

I built the core team from within Kaiser X Labs. Sven Martinov, a senior creative technologist from my department with a background at the Max Planck Institute, led the collaborative editor and real-time preview system. For the generation engine and deployment layer, we needed someone full-time and fully dedicated who could move at startup speed while understanding a vision that, in 2018, was not yet credible to most people around us. We brought in Olivier Gonthier — former CTO at Freelancerepublik, with deep frontend experience from Deezer — as a dedicated freelancer.

Three people. Eight interconnected microservices. Each one a product-sized problem. We built all eight because the thesis demanded it — half a platform validates nothing.

```flow TB
# Senz Platform Architecture
[<ellipse icon:user> Sketch Input] -> capture -> [<icon:eye> AI Detection]
[<icon:eye> AI Detection] -> classify -> [<icon:cog> Component Recognition]
[<icon:cog> Component Recognition] -> generate -> [<icon:code> Code Generation]
[<icon:code> Code Generation] -> render -> [<icon:layout> Collaborative Editor]
[<icon:layout> Collaborative Editor] -> preview -> [<icon:play> Prototype Player]
[<icon:play> Prototype Player] -> collect -> [<icon:chart> Analytics]
[<icon:chart> Analytics] -> report -> [<database> Data Bridge]
[<icon:code> Code Generation] -> publish -> [<icon:cloud> Deployment]
```

There were no off-the-shelf datasets for wireframe recognition in 2018. We generated ours by hand — hundreds of hours of drawing, annotating, classifying UI elements to train models that did not yet exist for this purpose. We built every model ourselves. We retrained hundreds of times. Object detection via Faster R-CNN for wireframe analysis. LayoutLMv2 for semantic understanding of component relationships. Alpha matting for coherent visual theme generation. An incredible roller coaster of failure and refinement, long before the tooling that makes this work routine today.

Every architectural decision was filtered through a single constraint: can three people ship and maintain this while operating inside an enterprise environment?

## Validation

The platform reached private beta. Response confirmed the thesis — not just internally, but from the broader design and startup ecosystem.

> "Using AI to turn sketches into coded components. Wow!"
> — Sebastiano Guerriero, Founder & CTO, CodyHouse

> "Technology like this will revolutionize the way we innovate and supports non-designers and non-developers on their way to build a digital product by themselves."
> — Kai Kölsch, Founder & CEO, Seedbox Ventures

Design Sprint Studio integrated it into their workflow. The pattern was consistent: domain experts who had never written code were producing testable prototypes and collecting user data within hours of sketching their concept.

## What Senz Proved

```flow LR
# Industry Timeline
[<roundrect> 2018 Senz ships] -> 6 months -> [<roundrect> 2019 Microsoft Sketch2Code] -> 6 years -> [<roundrect> 2025 Figma Make]
```

In May 2025 — seven years after we shipped — Figma launched Make, an AI-powered prompt-to-prototype tool. The industry finally arrived at the territory we had been working in since 2018. The market did not disprove the thesis. It became it.

But what we built was never just sketch-to-code. It was an entire product methodology — the full design cycle from hypothesis through validation — compressed into a single tool accessible to people who had never been trained in design or development. That is not a feature. That is a structural change in how organizations innovate.

What Senz proved — inside a Fortune 500, with three people, hand-built datasets, and applied research that predated the industry by seven years — is that the barrier between idea and evidence is artificial. It exists because our tools enforce a separation between the people who understand the problem and the people who can build the test. Remove that separation, and organizations do not just move faster. They move differently. The right ideas surface because the cost of being wrong drops to nearly zero.

One person. One platform. Two days. An idea becomes a prototype with analytics. Tested instead of debated.

Seven years later, the industry agrees.
