---
title: Nexus
description: An alternate reality game where you get hacked first, then learn why it matters. By 2026, every European citizen gets a digital identity wallet. Most will not understand what that means until it is already their reality. Nexus teaches sovereignty through consequence — not slides, not warnings, but lived experience in a controlled breach.
date:
    published: 2025-01-27
thumbnail: /content/media/nexus-hero.jpg
status: draft
series: 21
featured: true
category: project
project:
    status: in-progress
    timeline:
        start: 2024
tags:
    - privacy
    - education
    - ARG
    - sovereignty
    - cryptography
    - WebRTC
    - EUDI
---

# Nexus

![Terminal awaits](https://picsum.photos/seed/nexus-hero/800/600 "cover")

By the end of 2026, every European citizen will be offered a digital identity wallet.

The European Digital Identity initiative — EUDI — is not a proposal. It is legislation, passed, scheduled, rolling out. Your credentials, your health records, your qualifications, your age verification — all consolidated into a system that will mediate your relationship with governments, banks, employers, and services across the continent.

Most people will not understand what this means until it is already their reality.

Nexus exists to change that.

## Why This Game Exists

We are not prepared.

Not technically — the systems will work. Not legally — the frameworks are in place. We are not prepared *cognitively*. We do not have the mental models to navigate a world where identity is digital, portable, and consequential in ways paper documents never were.

![Unprepared](https://picsum.photos/seed/unprepared/800/600)

What happens when your identity wallet is compromised? What does it mean that credentials can be selectively disclosed — and what happens when you disclose the wrong thing to the wrong verifier? How do you evaluate whether a service requesting your data deserves access? What are the implications of a system that can, by design, link interactions across contexts?

These are not paranoid questions. They are the basic literacy of the coming decade. And nothing in our current experience teaches them.

> EUDI will arrive whether we understand it or not. Nexus is preparation for those who want to understand.

The game is edutainment — education disguised as play. But the disguise is not deception. It is recognition that lectures fail, that warnings are ignored, that the only learning that sticks is learning through experience. If people will not study digital identity, perhaps they will play a game about it. And if the game teaches what studying would have taught, the outcome is the same.

## The Aesthetic of Elsewhere

The terminal glows. Monochrome. Phosphor green on black, or amber, or the blue-white of early CRTs. A cursor blinks, waiting.

This is not nostalgia. It is invitation.

![Retro terminal](https://picsum.photos/seed/retro-aesthetic/800/600)

The cyberpunk aesthetic — retrofuturist, 1-bit, deliberately primitive — signals departure. You are not in your email client. You are not on social media. You have stepped into a different space, governed by different rules, asking for a different kind of attention.

Immersion matters because escape matters. The daily routine is where habits live — the same apps, the same feeds, the same automatic trust in systems you never chose to trust. Breaking the visual language breaks the routine. The player who enters the terminal leaves behind the context that made them careless.

> The aesthetic says: here, things are different. Pay attention.

The 1-bit constraint is also practical. It emerged from a component library built for e-ink devices — low PPI, low refresh rate, designed for readability under constraint. What works on e-ink works anywhere. The limitations became the style, and the style became a signal: this is not the mainstream. This is something you chose to enter.

The cyberpunk genre carries its own lessons. A world of powerful systems and vulnerable individuals. Technology that empowers and surveils in the same gesture. Corporations and states with capabilities that dwarf what citizens can muster. These themes are not fiction. They are description. The aesthetic makes them visible.

## The First Lesson Is Failure

The first time you connect, you will be hacked.

This is not a bug. This is the lesson.

You create your profile. You enter your data. The terminal accepts it, stores it, welcomes you to the game. You feel the small satisfaction of onboarding complete.

Then you return. And the terminal tells you: your identity has been compromised. Your data was stored in cleartext. Anyone could have read it. You are disconnected, locked out, exposed.

![First breach](https://picsum.photos/seed/first-breach/800/600)

Now you are ready to learn.

We do not learn from warnings. We learn from consequences.

A thousand articles about data breaches will not change behavior. A single experience of being breached — even in a game, even with fictional stakes — rewires the nervous system. The abstract becomes visceral. The statistic becomes personal.

> You cannot teach vigilance to those who have never felt vulnerable.

After the breach, the game changes. You must secure your identity — not by reading about security, but by practicing it. Your mobile device becomes your key. You generate a mnemonic phrase, create cryptographic keys, establish the architecture that will protect you for the rest of the game.

This is not simulation. The cryptography is real. BIP-39 mnemonics, Ed25519 key pairs, AES-256-GCM encryption. The same standards that secure cryptocurrency wallets and will underpin EUDI implementations. You are not learning about security. You are implementing it.

## The Twelve Words

Somewhere in this process, you are given twelve words.

They seem arbitrary. A strange poem generated by algorithm. The game tells you to write them down, to keep them safe, to never share them. You may or may not take this seriously.

![Twelve words](https://picsum.photos/seed/twelve-words/800/600)

Later — perhaps chapters later, perhaps when you have forgotten the warning — a scenario unfolds. A fictional hacker group from an autocratic nation targets the network. Your mobile device is compromised. Your account is erased.

If you saved your twelve words, you recover. The mnemonic regenerates your keys, restores your identity, returns everything you built. The game continues.

If you did not save them, you start over. From the beginning. All progress lost.

> The mnemonic is not a game mechanic. It is a lesson about what cannot be recovered.

This is harsh. It is meant to be. The real world does not offer second chances for lost keys. EUDI wallets will have recovery mechanisms, but they will also have failure modes. The player who has lost everything once — even fictionally — treats recovery phrases differently forever.

## The Architecture of Trust

Your phone holds your identity. Your computer holds nothing.

This separation is the heart of the system. The terminal — the PC interface where you receive missions, interact with handlers, navigate the game world — is deliberately untrusted. It displays information. It cannot store it. It shows you data your phone exposes during active sessions, and when the session ends, the terminal remembers nothing.

![Trust architecture](https://picsum.photos/seed/trust-architecture/800/600)

The connection between devices uses WebRTC, peer-to-peer, encrypted by default. No server in the middle. No cloud storing your interactions. The data travels directly from your phone to your screen, protected by the same protocols that secure video calls.

Session IDs are short-lived. QR codes for connection are single-use. The P2P channel, once established, is cryptographically secure. Even if someone intercepted the connection request, they could not hijack the session.

> The terminal is a window. The phone is the room. You choose what the window shows.

This mirrors what EUDI should be. Your credentials live with you, not with platforms. You expose what you choose, when you choose, and revoke access by ending the session. The architecture is not just secure — it is a model of agency you inhabit while playing.

## Where Fiction Meets the Web

Nexus is an ARG — an Alternate Reality Game. The boundary between game and world is deliberately porous.

Missions send you into the actual web. You search for real information. You visit real sites. You collect data in your mobile's notes, analyze it, decrypt patterns, report back to your handler through the terminal.

![ARG bridge](https://picsum.photos/seed/arg-bridge/800/600)

The scenarios are fiction built on fact. Plausible futures extrapolated from present trends. The EUDI rollout is real — Nexus prepares you to navigate it. The surveillance capabilities are real — Nexus teaches you to understand them. The disinformation campaigns are real — Nexus trains you to recognize them.

> The game is fictional. The threats are not.

Each chapter addresses a different axis of the coming landscape:

**Identity and verification** — How credentials flow, what selective disclosure means, the difference between proving an attribute and revealing an identity.

**Manipulation and disinformation** — How to trace sources, verify claims, distinguish organic movements from manufactured ones. When algorithms show you content, whose interests does that serve?

**Interference and foreign influence** — State actors in digital spaces. What they want, how they operate, what makes populations resilient or vulnerable.

**Privacy as agency** — Not privacy as hiding, but privacy as the ability to control what others know about you. The difference between secrecy and sovereignty.

## Grounding in Fact

The feeds are designed to capture you. The algorithms are designed to engage you. The content that reaches you has been selected not for truth but for reaction.

This is not conspiracy. It is business model. And the result is a population that increasingly lives in manufactured realities — not outright lies, but curated selections that shape perception as effectively as any falsehood.

![Grounding in fact](https://picsum.photos/seed/grounding-fact/800/600)

Nexus teaches verification as skill.

When your handler presents a claim, you check it. You trace sources. You distinguish primary documents from commentary, peer-reviewed research from opinion, evidence from assertion. You learn, through practice, that the feeling of "this confirms what I believe" is exactly when scrutiny matters most.

> Algorithms optimize for engagement. You must optimize for truth. These are not the same.

The scenarios make this visceral. Information that feels credible turns out to be manufactured. Sources that seem authoritative turn out to be compromised. The player learns to hold claims at arm's length, to verify before believing, to treat emotional resonance as a warning sign rather than confirmation.

By the end, players do not passively consume. They interrogate. Not from paranoia — from competence. The same skills that progress the game protect against manipulation outside it.

## Actionable Gear

Some chapters require installing tools. A privacy-focused browser. A VPN. A password manager. An encrypted messaging app.

These are not arbitrary obstacles. They are capabilities.

![Actionable tools](https://picsum.photos/seed/actionable-tools/800/600)

The player who installs a VPN for a mission has a VPN. The player who switches to a secure browser for a chapter has switched browsers. The player who sets up encrypted messaging to coordinate with other agents has encrypted messaging.

The game teaches by requiring. And what it requires is genuine protection.

> The tools you install for the game are the tools you keep for life.

Yes, this could be revenue — ethical product placement, tools that benefit users, partnerships that support development. But the primary purpose is agency. The player who finishes Nexus is not just informed. They are equipped. The gap between knowing and doing has been closed by the structure of the game itself.

## The Handler in the Machine

Your handler is your guide through the game. They assign missions, evaluate intelligence, advance your clearance level as you prove competence.

The handler may be an AI.

![Handler AI](https://picsum.photos/seed/handler-ai/800/600)

Not a cloud service. Not an API call to distant servers. A language model running locally, in the browser, on your machine. Processing your reports without sending them anywhere. Responding without surveillance.

This is still experimental. The technology is promising but young. But the direction matters: if the game requires a conversational agent, that agent should embody the same principles the game teaches. Local processing. No data exfiltration. Intelligence that serves you without reporting on you.

> The handler knows your secrets because the handler is local. This is how all AI should work.

When the local model is ready, it will be invisible — just a character in the game, responsive and helpful. But the architecture will be a lesson in itself: AI does not require cloud, does not require surveillance, does not require trading your prompts for processing.

## Clearance and Credibility

Progress in Nexus follows two tracks.

Clearance level determines what missions you can access. Complete the security chapter, reach level 2. Prove competence in investigation, reach level 3. Each level opens new scenarios, harder challenges, deeper engagement.

Credibility points measure how the network trusts you. Accurate intelligence increases credibility. Mistakes decrease it. The handler weighs your reports against your track record, and players with high credibility unlock options unavailable to those still proving themselves.

![Progression system](https://picsum.photos/seed/progression/800/600)

This mirrors real networks — not game networks, human networks. Trust is earned through demonstrated competence. Access follows reputation. The player who rushes, who submits sloppy intelligence, who fails to verify before reporting, learns that carelessness has cost.

> Clearance is permission. Credibility is trust. You cannot buy either.

## Hack the Terminal

One chapter invites you to attack.

You have learned to protect yourself. You understand the architecture, the cryptography, the separation of concerns. Now prove it. Find the vulnerability. Compromise the terminal. Show that you understand security well enough to break it.

![Hack the terminal](https://picsum.photos/seed/hack-terminal/800/600)

This is the final exam, and it is not ceremonial. The terminal is genuinely secured. The session management is genuinely robust. If you find a weakness, you have found an actual weakness — and you will have learned more than any chapter could teach.

Most players will fail this chapter on the first attempt. Some will fail repeatedly. The difficulty is intentional. When you finally succeed — if you succeed — you will understand what you exploited, why it was possible, and how to recognize similar vulnerabilities elsewhere.

> Security that cannot be tested is faith. Security that survives testing is trust.

## What Nexus Builds

When you finish, you have:

Experienced identity compromise and recovery — viscerally, not theoretically.
Generated and secured cryptographic keys using real standards.
Installed privacy tools you will keep beyond the game.
Investigated real information, verified sources, identified manipulation.
Practiced separating trusted and untrusted systems.
Learned to ground decisions in fact, not feeds.

![What remains](https://picsum.photos/seed/what-remains/800/600)

These are not achievements. They are capabilities. The player who completes Nexus is not the same as the player who began — not because they accumulated points, but because they practiced agency until agency became habit.

> EUDI arrives in 2026. The question is whether citizens will navigate it or be navigated by it.

Nexus is not the only preparation needed. But it is preparation. The player who has been hacked and recovered handles identity differently. The player who has verified disinformation recognizes patterns. The player who has geared up with real tools has real protection.

The game ends. The capabilities remain. And when the wallet apps arrive, when the credential requests begin, when the new landscape unfolds — some people will be ready.

Because they played a game that taught them what no one else was teaching.

## The Terminal Awaits

Nexus is not finished. The engine is being built — event-based, progression-gated, ready to receive chapters that can be authored without rebuilding the system. The component library exists, minimal and dependency-free. The P2P architecture is proven, encrypted, inviolable.

What remains is content. Scenarios that teach without lecturing. Missions that reveal without moralizing. A narrative that pulls players forward while the architecture does its quiet work beneath.

![Terminal waiting](https://picsum.photos/seed/terminal-waiting/800/600)

Somewhere, the terminal waits. Phosphor glow on dark glass. A cursor blinking in a world that looks like nowhere else.

Someone will enter who does not yet know what is coming — not the game, but the world. EUDI. Digital identity as infrastructure. A landscape that rewards understanding and punishes ignorance.

They will create a profile. They will be hacked. They will feel, for a moment, the vulnerability that explanation cannot convey.

And then they will learn.

Not because someone told them.

Because they had to.

---

> The future is arriving whether we understand it or not.
>
> Nexus is a game about understanding it first.
>
> The terminal is waiting.
>
> Are you ready to fail?
