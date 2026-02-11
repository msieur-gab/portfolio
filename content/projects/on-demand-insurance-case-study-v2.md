---
title: "On-Demand Insurance: Insure What You Carry, Not What We Sell"
description: "How a strategic pitch about the API economy became a working product concept that anticipated the market by seven years."
date:
    published: 2017-06-01
status: published
series: 91
category: project
tags:
    - insurance
    - innovation
    - API-economy
    - strategy
    - prototyping
    - Allianz
project:
    status: completed
    timeline:
        start: 2017
---

# On-Demand Insurance
### Insure what you carry, not what we sell.

**Role:** Head of Innovation & Creative Technology, Kaiser X Labs (Allianz Group)
**Context:** Strategic pitch to CIO of Allianz Deutschland + unsolicited product prototype
**Period:** 2017

## The Aging Portfolio Problem

Allianz is one of the world's largest insurers. Its customer base is also one of the oldest. The company was not struggling to serve existing policyholders — it was struggling to acquire the next generation of them.

In 2017, the data was unambiguous. Two-thirds of millennials considered insurance premiums unaffordable. Nearly a third were overwhelmed by the complexity of choosing a policy. Only 47% had any life insurance at all — and those who did were significantly less engaged with their insurer than any other generation.

```chart-bar
title: Why Younger Demographics Rejected Insurance (2017)
description: Sources — Harris Poll 2017 (n=1,171), Insuranks Millennial Survey (n=1,000), Gallup Insurance Engagement Study 2014, Kaiser X Labs customer interviews

Barrier, Respondents (%)
Too expensive, 66
Too complex, 29
Not digital enough, 24
Long-term commitment, 21
```

This was not a marketing problem. The product itself was misaligned with how a generation lived, consumed, and made decisions. They expected the immediacy of Amazon Prime, the transparency of N26, the frictionlessness of Instagram. Insurance offered them paperwork, twelve-month contracts, and a phone number.

The brief I received was narrower than this problem: the CIO of Allianz Deutschland asked me to prepare a pitch on the benefits of the API economy — how Allianz could leverage its services as APIs, build partnerships across industries, and scale growth through an open platform.

I delivered the deck. Then I delivered something nobody asked for.

## A Deck Without a Demo Is Just Words

A strategy presentation without a tangible example is theory. It is words on slides that the audience agrees with in the room and forgets by the following week. Unless you are McKinsey or BCG, abstraction does not survive the walk back to the desk.

So alongside the API economy pitch, I built a clickable prototype. Not because it was requested — but because it answered a question the organization did not yet know it needed to ask: what would insurance look like if it were designed for the people who currently reject it?

The concept was built on three insights surfaced by our research team at Kaiser X Labs, who conducted continuous customer interviews across all products and services:

**No long-term contracts.** Younger users did not want to commit to coverage they did not need. They wanted protection when it mattered — for the duration of a trip, for a specific purchase, for a defined moment.

**No complexity.** The app was free. No fees, no fine print. It synced with your bank, learned your spending patterns, and prompted you when a purchase worth insuring was detected. You approve with a tap.

**No selling what you don't need.** The system knew your payment card's existing coverage. When you booked a trip to China, it showed you what was already covered and what was not — information most cardholders never check. You selected the goods you planned to carry, and the app offered a minimal fee to cover the gap. Insurance started the day of departure and stopped the day you returned home.

```flow LR
# On-Demand Insurance Flow
[<ellipse icon:user> User] -> pays -> [<icon:card> Bank Sync]
[<icon:card> Bank Sync] -> detects trip -> [<icon:cog> App]
[<icon:cog> App] -> checks -> [<icon:shield> Card Coverage]
[<icon:shield> Card Coverage] -> shows gaps -> [<icon:phone> User Prompt]
[<icon:phone> User Prompt] -> select goods -> [<icon:lock> Gap Coverage]
[<icon:lock> Gap Coverage] -> trip dates only -> [<ellipse icon:user> User]
```

No contract. Full transparency. Pay for what you miss, not for what we want you to believe you need. Insurance that starts and stops with the moment it protects.

The prototype also addressed shared assets — splitting coverage when lending a camera or a drone, micro-insurance for items that traditional policies ignore.

## The Strategic Layer

The prototype was not just a product concept. It was the API economy pitch made real.

The on-demand model required Allianz to expose its underwriting and risk assessment as services — APIs that any partner could integrate. The bank sync layer demonstrated how financial data partnerships could drive contextual insurance offers without the customer ever visiting an insurance website.

And the partnership opportunity was already on Allianz's balance sheet. N26 — the fastest-growing neobank in Europe — was already part of the Allianz ecosystem. The relationship had started in 2016 via Allianz Partners, and Allianz X would co-lead N26's $160 million Series C the following year.

```flow TB
# API Economy — Insurance as a Service
[<ellipse icon:user> Customer] -> purchases -> [<icon:card> N26 / Bank Partner]
[<icon:card> N26 / Bank Partner] -> triggers -> [<icon:cog> Allianz API]
[<icon:cog> Allianz API] -> risk assessment -> [<icon:shield> Coverage Offer]
[<icon:shield> Coverage Offer] -> contextual prompt -> [<ellipse icon:user> Customer]
[<icon:cog> Allianz API] -> partner integration -> [<icon:cloud> Third-Party Platforms]
```

I proposed that Allianz move beyond silent investment into an active product partnership — offering on-demand insurance as a white-label service through N26 and similar partners. A younger-facing product, powered by Allianz infrastructure underneath, reaching demographics the parent brand could not access directly.

## What Happened Next

The CIO received the pitch and the prototype well. Others at the table were less receptive — the on-demand model was perceived as a risk to existing product lines rather than an expansion of them.

The CIO left the company in 2020. He went on to build a company offering insurance as a service — an API stack built from insurance domain expertise. The model from the pitch, pursued independently.

In 2024, Allianz began exploring on-demand insurance initiatives internally. By then, the original research was gone. The prototype was gone. The person who built it was gone.

The market, however, arrived. On-demand and embedded insurance is now one of the fastest-growing segments in insurtech. The model that did not survive the room in 2017 became the model the industry is building toward in 2025.

## What This Proved

A strategy deck explains what could happen. A prototype proves what should happen. The distance between the two is the distance between a meeting that ends in agreement and a meeting that ends in action.

This project proved that customer research, when taken seriously, will surface the product your organization is not yet building. That the hardest part of enterprise innovation is not the concept or the prototype — it is surviving the room where existing revenue sits at the table. And that being seven years early is, from a portfolio perspective, indistinguishable from being right.
