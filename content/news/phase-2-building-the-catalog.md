+++
title = "Phase 2: Building the Catalog"
description = "The best open-weight model on earth shipped two weeks ago — and it's too big to run on any single machine. That's why we're keeping Archipelag.io free and credits-only while we build the catalog. Monetization waits until the models earn it."
date = 2026-06-25
draft = false

[extra]
category = "Announcement"
author = "Raffael Schneider"
+++

Two weeks ago, on the 13th of June, Z.ai open-sourced [GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) under an MIT license. Not a research preview. Not a weights-available-but-look-but-don't-touch arrangement. A plain MIT license — the same four paragraphs that govern half the software you use every day — stapled to what is now the strongest open-weight language model in the world.

It ranks fourth overall on the public leaderboards, trailing only a handful of closed frontier models from Anthropic and OpenAI. For something anyone can download for free, that is a remarkable place to sit.

There's a catch, and the catch is the whole story: GLM-5.2 is 753 billion parameters. Its full weights are roughly 1.5 terabytes. It does not fit on your laptop. It does not fit on your gaming GPU. It does not fit on the Mac Studio in the corner. The best open model humanity has ever released is, for almost everyone who'd want to run it, unrunnable.

That sentence is the entire reason Archipelag.io exists. And it's why we're making a deliberate choice today.

## We're not turning on the meter

When we entered open beta, we told you it would run for a few months and that we'd figure out what works as we went. Here's something we figured out: **now is the wrong time to start charging real money.**

So we're not. Archipelag.io stays free. It stays on credits. And instead of building a billing system, we're spending this phase building the thing that would make a billing system worth having — the catalog.

This isn't caution for its own sake. It's a read on where the ground is moving.

## The frontier became a public good, and it's moving monthly

A year ago, the assumption underneath every AI business plan was that the best models would be closed, expensive, and rented by the token from three companies. That assumption is quietly falling apart.

GLM-5.2 is the loudest example, but it isn't alone. The GLM-4.6 line before it shipped under the same clean MIT terms. Mistral keeps releasing capable models under Apache 2.0 — a license with no field-of-use restrictions at all. Every few weeks, the definition of "the best you can get for free" resets upward.

If we locked in a price sheet against this landscape, we'd be pricing a product that's being redefined faster than we could print the invoices. The honest move is to admit that and wait. Pricing power, when it comes, should come from a catalog so good that paying for convenient, low-latency, local access to it is obviously worth it — not from rushing a number out the door while the underlying value is still doubling.

## Why "too big to run" is our favorite problem

Here's the part that gets us out of bed. A 1.5-terabyte model that no ordinary machine can hold is a compelling target for distributed compute. It is also a hard systems problem, and multi-Island inference remains experimental while we validate the latency, reliability, and placement tradeoffs.

The old shape of AI infrastructure — a handful of companies own the GPUs, everyone else rents — assumed models would live on one big machine somewhere in a data center. But the frontier is now producing models that don't fit on *any* one machine you'd want to own. The future isn't one giant box. It's many ordinary boxes, coordinated. A teenager's gaming PC in Munich, a photographer's Mac Studio in Lisbon, the M4 laptop on your kitchen table — pooled, sharded, and pointed at a model none of them could run alone.

That's the catalog we're building toward. Not "small models that happen to fit," but the actual frontier, made runnable by spreading it across the islands.

And it isn't only chat. The same story is playing out in image generation: there's now a tier of genuinely open, Apache-licensed image models — [Qwen-Image](https://huggingface.co/Qwen/Qwen-Image), FLUX's lightweight open releases — that a network like ours can serve cleanly, and that run on the same fleet, all the way down to a Mac using its Metal GPU. Two launch verticals, one principle: take the best the open community has put out under a license that lets us serve it, and make it run on hardware people already own.

## The roadmap, in the open

We'd rather tell you the plan than imply we don't have one.

- **Phase 1 — The Network.** *Done.* Islands register, jobs dispatch, inference streams back to your browser token by token. The coordination layer works.
- **Phase 2 — The Catalog.** *Now.* Onboard frontier open models as Cargos — starting with the GLM line and the Apache-licensed Mistral models, the ones whose licenses let us serve them cleanly. Make the models that are too big for one machine run across many. Keep the whole thing free, on credits, while we do it.
- **Phase 3 — Monetization.** *When the catalog earns it.* Real billing arrives only when the catalog is good enough that it's plainly worth paying for. There's no date on this milestone, and that's on purpose. It's gated on quality, not the calendar.

## Free is a decision, not a gap

A closed AI platform is only ever as good as the one model its vendor ships. Archipelag.io gets better every single time the open-source community ships — and right now, they are shipping at a pace that's genuinely hard to keep up with. We'd rather ride that wave than bet against it.

None of this means we're standing still on the things that make a network trustworthy. Identity verification, abuse controls, and transparent virtual amounts on the [Compute Exchange](/matchmaking) are all moving forward regardless. Maturing the platform and putting up a paywall are different projects, and we're doing the first one without the second.

So: still free, for now, on purpose. We'll be busy filling the catalog. Come use it, lend a machine, and watch the frontier show up on hardware you already own.

See you on the islands.
