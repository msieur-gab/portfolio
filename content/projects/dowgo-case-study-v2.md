---
title: "Dowgo: The File System Was Not the Problem"
description: "How two weeks of dialogue, prototyping, and restraint turned a due diligence platform from passive storage into guided action."
category: case-study
---

# ~~Dowgo~~
### The file system was not the problem.

**Role:** External Consultant — Systems Design & Prototyping
**Client:** ~~Dowgo~~ — blockchain-based renewable energy investment platform
**Period:** 2024 — 2 weeks
**Status:** In production

## The Brief

~~Dowgo~~ connects renewable energy companies seeking funding with investors. At the heart of the platform sits a data room — the space where issuers collect and submit the documents required for due diligence: financial records, legal filings, team information, patents, revenue data, previous investment history.

Romain Menetrier, CPO/CTO, approached me with what seemed like a clear problem: the data room needed a better user experience. Users were organizing documents in a traditional file system, and the team was considering AI-driven file categorization as the solution. A modern platform should have a modern approach.

I pushed back.

## What the Dialogue Revealed

Rather than starting with solutions, I spent time in conversation with Romain, mapping how users actually worked. Not how they complained about working — how they worked.

The file system was not the problem. Users already had fluency with file structures. They knew how to create folders, name documents, drag things into place. That literacy was an asset, not a constraint.

The cognitive cost was elsewhere: **users could organize, but they could not act.** The file system showed them what existed. It did not show them what was missing, what needed attention, or what to do next. Every action required the user to hold the full mental model of the due diligence process in their head — which documents were required, which had been submitted, which were still pending review, who needed to provide what.

```flow TB
# Where Cognitive Load Actually Lived
[<ellipse icon:user> User] -> opens -> [<icon:folder> File System]
[<icon:folder> File System] -> sees -> [<icon:file> Documents]
[<icon:file> Documents] -> but cannot see -> [<icon:alert> What's Missing]
[<icon:file> Documents] -> but cannot see -> [<icon:clock> What's Due]
[<icon:file> Documents] -> but cannot see -> [<icon:user> Who Needs to Act]
```

The problem was not organization. It was the absence of contextual anchoring for action.

## The Shift

I proposed keeping the file system intact and enriching it with an **action panel** — a persistent surface that makes pending tasks, decisions, and progress visible within the structure users already understood.

The file system stays. The context becomes actionable.

```flow LR
# From Storage to Guidance
[<icon:folder> File System] -> enriched by -> [<icon:cog> Action Panel]
[<icon:cog> Action Panel] -> surfaces -> [<icon:alert> Missing Documents]
[<icon:cog> Action Panel] -> surfaces -> [<icon:clock> Pending Reviews]
[<icon:cog> Action Panel] -> surfaces -> [<icon:user> Delegated Tasks]
[<icon:cog> Action Panel] -> tracks -> [<icon:check> Completion Progress]
```

## The Experience

The interface is split into two persistent sections that work as a pair.

**Section one: the agent.** A conversational companion that greets you by name and offers to help organize your documents. No dashboard. No empty state with twelve input fields. A simple prompt: let me help you get started.

You drag and drop your existing files — or upload a ZIP archive of everything you have. The system unpacks the archive, reads each file, and sorts them into the appropriate folders and categories using a coordinate system built on regex pattern matching. No AI inference. No data sent to a third-party model. Standard JavaScript, running locally, matching filenames and content markers against the known structure of a due diligence data room.

```flow TB
# From Dump to Structure
[<ellipse icon:user> User] -> uploads ZIP -> [<icon:cog> Regex Categorizer]
[<icon:cog> Regex Categorizer] -> sorts into -> [<icon:folder> Data Room Structure]
[<icon:folder> Data Room Structure] -> calculates -> [<icon:check> Completion State]
[<icon:check> Completion State] -> generates -> [<icon:alert> Action Cards]
```

Once files are placed, the agent shifts. It announces your progress — how much completion you have reached, and what is still missing. The missing items appear as **action cards** that narrow your focus to the next thing that needs attention.

**Section two: the workspace.** A file explorer with an action sidebar. Tap an action card in the agent and the workspace scrolls to the relevant folder, action panel already open, ready for you to upload the missing document or delegate it to a collaborator.

The agent narrows. The workspace acts. One thinks for you, the other works with you.

Every new upload triggers the loop again. The agent updates completion. Action cards appear or resolve. A persistent progress bar in the app header tracks the state of the currently selected data room — because users manage multiple projects simultaneously, each with its own completion state.

```flow LR
# Two Sections, One Loop
[<icon:message> Agent] -> narrows task -> [<icon:alert> Action Card]
[<icon:alert> Action Card] -> points to -> [<icon:folder> Workspace]
[<icon:folder> Workspace] -> user acts -> [<icon:upload> Upload / Delegate]
[<icon:upload> Upload / Delegate] -> updates -> [<icon:message> Agent]
```

## Natural Language for Complex Delegation

Due diligence involves multiple external parties — financial advisors, legal teams, auditors, previous investors. Coordinating document requests across these players through traditional form interfaces creates friction at every step.

I designed a natural language input that let users delegate tasks the way they think about them: `@legal team provide shareholder agreement by :next Friday` — using trigger characters for people, files, and time. The date parsing was handled by Compromise.js, which resolves expressions like "next Friday" or "end of month" into actual dates without requiring a date picker.

The pattern reduced a multi-field form to a single line of natural text. The interface parses it. The user confirms.

## Designed for Degradability

An important principle: what survives if constraints tighten?

I designed the system so that even without the conversational agent, the core functionality — file organization, completion tracking, missing document alerts — remains valuable. The ambitious features enhance the experience. They do not gate it.

If AI-driven categorization becomes necessary later, the architecture accommodates it. But the regex-based approach shipped sooner, cost less, and introduced no legal risk into a platform handling sensitive investment documentation. Restraint first. Complexity only when earned.

## What Was Delivered

In two weeks:

A functional prototype built in React and Shadcn — the same stack the development team uses in production — delivered directly to their git repository. Not a reference design to be interpreted. Working code to be extended. The development team is now replicating it faithfully because the prototype already speaks their language.

Alongside it, a Figma design system documenting the patterns, hand-drawn sketches mapping the interaction logic, and a written explanation of the design intentions behind each decision — so the team could extend the product without guessing *why* something was built a certain way.

A 30-minute validation session with Romain confirmed the concept was technically feasible, cost-conscious, and intuitive. The development team took it from there.

~~Dowgo~~ has since raised €2 million in funding and processes over €300K in active business.

## What This Proved

The instinct in product design is to replace what feels old. File systems feel old. The instinct in 2024 is to add AI. AI feels modern.

Neither instinct was correct here. The right answer was to observe how users actually worked, identify where cognitive load accumulated, and add the minimum layer that made the familiar structure actionable.

This project proved that restraint is a design skill. That prototyping is a discovery tool, not a deliverable. And that walking into someone else's domain — blockchain, renewable energy, investment compliance — and finding the real problem in two weeks of dialogue is a skill that does not require expertise in the domain. It requires expertise in how people work.
