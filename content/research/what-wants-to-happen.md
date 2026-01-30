---
title: What Wants to Happen
description: "On designing with the grain — code, craft, and the patience to let solutions emerge."
date:
    published: 2025-01-27
thumbnail: /content/media/what-wants.jpg
status: published
category: reflexion
tags:
    - design-philosophy
    - wu-wei
    - craft
    - methodology
---

# What Wants to Happen

![Workshop light](https://picsum.photos/seed/workshop-light/800/600 "cover")

I learned to design by learning to wait.

Not the passive waiting of indecision, but the active waiting of observation — the kind where you watch a problem long enough that it starts to reveal its own shape. In China, they call this wu wei. Often mistranslated as "non-action," it really means something closer to "not forcing." You act, but you act with the grain rather than against it.

Wood has grain. So does code. So do people scrolling through screens at two in the morning, necks bent at angles their bodies did not evolve for.

The question I've learned to ask is not "what should I build?" but "what wants to happen here?" The answers are different. The first assumes I know better. The second assumes the situation has intelligence I haven't yet perceived.

---

A few months ago I was rebuilding a scroll synchronization system — the kind that keeps images aligned with text as you read through a long article. The previous version worked. It also had the quality of something that had been *made* to work, wrestled into submission through conditionals and edge cases and carefully sequenced events.

I wanted to start over. Not to add features, but to find what was underneath.

The first thing I did was not write code. I sat with the question: where do people actually look when they read on screens?

Not the center. Not where we assume attention lives. The upper third — somewhere around 30% from the top of the viewport. This is where reading happens. Below that line, we scroll. We bring content up to meet our eyes rather than chasing it down.

This isn't preference. It's physics. The angle of the neck, the strain on eye muscles, the way light hits the retina differently at different positions. Decades of holding books and newspapers trained these patterns before screens existed. The body remembers what the mind forgets.

Once I saw this, the design became obvious. The trigger point for changing images shouldn't be the middle of the screen. It should be where people actually read. And it should shift based on scroll direction — lower when scrolling back up, because reviewing feels different than reading forward.

I didn't invent this. I observed it. The solution was already there, waiting in the space between physiology and habit.

---

> The craftsman who approaches material with a fixed plan will fight constant resistance. The one who observes first, who tests with light cuts before committing, who adjusts technique to match material — this craftsman produces work that appears effortless.

I keep returning to Japanese joinery. Not because I build furniture, but because the philosophy transfers.

A kanawa tsugi joint connects two beams through interlocking geometry so precise that it needs no nails, no glue. What looks decorative is structural. The visible pattern on the surface continues deep into the wood, distributing stress along the grain rather than across it.

These joints flex. In a country of earthquakes, rigid connections fail. The solution was not to build stronger but to build *with* — to create structures that absorb shock and return to position, that accommodate movement rather than resisting it.

I think about this when I write components. The temptation is always toward rigidity: fixed breakpoints, explicit states, tight control. But systems that flex outlast systems that resist. The question is what to hold firm and what to let move.

In the scroll sync component, the structural frame — padding, gaps, the grid itself — stays fixed in pixels. The content inside adapts. Text reflows, line counts change, scroll height changes. But the relationship between the reading column and the media column holds.

This is the difference between *responsive* and *unstable*. Responsive means adapting intentionally. Unstable means breaking under pressure.

---

Somewhere in the process, I made a trade I want to be honest about.

Typography wisdom says 45-75 characters per line for optimal readability. CSS makes this easy: set your container to `max-width: 65ch` and the text will always stay within that range.

But `ch` is relative to font size. When the user scales their text up — which is their right, and for some, their necessity — the container grows. The careful ratio between text and image dissolves. The layout that worked at default size fails at accessible sizes.

I chose stability over orthodoxy.

The frame holds. The text reflows within it. Line lengths vary more than the textbooks recommend. But no one reads text below 14 pixels on large screens anyway, and users who need larger text are already comfortable with their own reading patterns.

This is the part of design that doesn't make portfolios. The conscious acceptance of imperfection in one dimension to protect integrity in another. The trade-offs you make with eyes open, knowing that perfect solutions don't exist, only honest ones.

---

I've spent fifteen years watching the industry discover things I felt certain about a decade earlier. Not because I'm prescient, but because I was paying attention to different signals.

Cross-device ecosystems — I was sketching those in 2010. AI-assisted design — I built a platform for it in 2019, years before it became a conversation. Local-first architecture, privacy by design, technology that serves rather than extracts — these feel obvious to me in a way I struggle to articulate.

The pattern isn't prediction. It's observation. If you watch how people actually use technology — not how they're supposed to, not how the metrics say they do, but how they *actually* behave when no one is measuring — the future is already visible. It's just distributed unevenly, hiding in workarounds and frustrations and the gap between what tools provide and what people need.

Designing well means closing that gap. Not by adding features, but by removing friction. Not by building what's impressive, but by building what disappears into use.

---

The scroll sync component has seven configurable properties. It could have more. Early versions did have more — options for animation timing, for easing curves, for threshold tolerances. I removed them.

Each option is a question the user has to answer. Each question is friction. The goal is not maximum flexibility but appropriate flexibility — enough to adapt to real contexts, not so much that configuration becomes its own burden.

What remains:

- Where does the media sit? Left or right.
- What's the ratio between text and media? A simple split.
- Are there sticky headers to account for? Name them.
- Do you need to see what's happening? Turn on debug.

Everything else has defaults that work. Not because I decided they were correct, but because I tested them until they stopped feeling like decisions. When the component disappeared into the reading experience — when I forgot I was using it — I knew the defaults were right.

---

There's a phrase in woodworking: "let the wood teach you."

It sounds mystical, but it describes something practical. Each piece of wood is unique. The craftsman who approaches it with a fixed plan will fight constant resistance. The one who observes first — who tests with light cuts, who feels for the direction of the grain, who notices where the material wants to separate and where it wants to hold — this craftsman produces work that appears effortless.

The effort is hidden. Not absent, but hidden. Absorbed into the observation that preceded action.

I think good design works the same way. The final artifact should feel inevitable, as if it could not have been otherwise. But that inevitability is the result of patience — of watching the problem long enough that the solution stops being imposed and starts being revealed.

Code is my material. It has grain. It has directions it wants to move and directions it resists. The framework is not the point. The library is not the point. These are tools, and I'll use whatever tool fits the cut.

What matters is the attention. The willingness to sit with something unfinished. The discipline to remove what isn't necessary, even when it was difficult to build.

> Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.

I used to read that quote as advice about simplicity. Now I read it as advice about patience. You cannot know what to remove until you've watched carefully enough to see what isn't needed. And you cannot see what isn't needed until you stop assuming you already know.

---

The component works now. Images appear when they should. The layout holds under pressure. The experience, when it's working well, is invisible.

That invisibility is the goal. Not to be noticed, but to be felt. To create the conditions where someone reads an article and thinks only about the ideas, not the infrastructure delivering them.

This is what I mean when I say I design by learning to wait. I wait to understand the problem. I wait to see what the material allows. I wait until the solution feels less like construction and more like discovery.

Then I build. And then — the hardest part — I remove what I can.

What remains is what wanted to happen all along.
