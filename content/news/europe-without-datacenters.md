+++
title = "Europe Without Datacenters"
description = "AI inference is here to stay. Europe is weak on the infrastructure that runs it and strong on the values that should shape it. Datacenter-less inference is how the two reconcile."
date = 2026-05-01

[extra]
category = "Perspective"
+++

It is the first of May. A day about human labour, which makes it a good day to be honest about two things at once: that AI is going to take a meaningful share of the work humans used to have to do, and that the infrastructure deciding *whose* AI does it is being poured in concrete right now, mostly outside Europe.

Archipelag.io is a bet on both of those things. We think AI inference is permanent — not a hype cycle, not a winter waiting to happen, but a new utility on the level of electricity and bandwidth. And we think Europe is currently weak on the layer that delivers that utility, in a way that will define the next twenty years of European innovation if nothing changes.

There is a separate, longer argument for that claim — about why "most innovative country" rankings measure yesterday's patents rather than today's substrate, and why Switzerland sitting first on a fifteen-year-old composite says less than people think. Our founder, Raffael Schneider, [makes that case in full on his personal blog](https://www.raskell.io/articles/patents-per-capita-is-a-vanity-metric/). The short version is the one that matters for what we are building: **the leaderboards lag the substrate by a decade, and Europe's substrate is thin.**

## The infrastructure gap is real

Europe has world-class researchers. It has serious universities. It has, in patches, a manufacturing base that other regions cannot conjure on demand. What it does not have, in 2026, is sovereign training and inference capacity at the scale the next decade will demand. The hyperscale buildout is happening in Virginia, in Texas, in the Gulf states, in Seoul, in Hefei. The European share of frontier compute is small, and most of it sits inside foreign clouds whose access can be revoked, repriced, or repurposed by a jurisdiction that is not ours.

The reflex answer is "build more datacenters." It is not wrong, but it is slow. A new gigawatt-class facility takes years of permits, grid headroom Europe largely does not have spare, and capital that flows more easily to other geographies. By the time the concrete cures, the workload has moved on.

There is a faster answer hiding in plain sight.

## Datacenter-less inference

Every modern phone has a neural accelerator. Every modern laptop has a GPU that idles 95% of the time. Every workstation under a desk in a Basel lab, a Stockholm studio, a Lisbon co-working space is, for most of the day, a compute resource doing nothing.

Archipelag.io turns that latent capacity into a network. An iPhone in Zürich runs a 1.1B-parameter model for someone in Lyon. A Mac Studio in Berlin handles a diffusion job submitted from Madrid. The coordinator places work on the nearest capable Island; the host earns credit for the cycles they contribute; the consumer gets inference that is fast, cheap, and — this is the part that matters for Europe — running on hardware whose physical location and legal jurisdiction are knowable.

This is not a substitute for hyperscale where hyperscale is genuinely needed. Frontier training will keep happening in big buildings. But a very large fraction of the inference economy — chat, summarization, OCR, transcription, image edits, code assistance, the daily volume that adds up to most of the bill — does not need an H100 cluster. It needs *enough* compute, *near enough* to the user, *under the right jurisdiction*. That is a substrate problem, not a datacenter problem. And it is one Europe can build now, with hardware that already exists, in homes and offices across the continent.

## Sovereignty as a side effect, not a slogan

"Digital sovereignty" gets used as a marketing word. We try to be precise about what we mean. When inference runs on an Island whose operator is a person in a known country under a known legal regime, you get answers to questions that hyperscale clouds cannot answer cleanly: where the bytes physically were when the model touched them, whose law governs disclosure, who can compel a shutdown, whose export controls bind the silicon. None of that requires a new treaty. It requires the network to be built out of hardware that is already inside the jurisdiction.

The corollary is that the network is hard to lock in. There is no single vendor whose terms-of-service govern the substrate. Islands can leave; consumers can leave; cargos are signed and portable. Anti-lock-in is a leading indicator of innovation: the cheaper a system is to exit, the more the ecosystem iterates around it.

## The labour question

Labour Day is not a technology holiday. It is about people, and about which work humans should and should not have to do. We are clear-eyed about what AI is going to change. A meaningful share of the work that has historically been arduous, repetitive, low-agency, or quietly dangerous is going to be done by machines in the next decade. That is the fourth industrial revolution as it is actually arriving — not chrome humanoids, but inference cycles quietly absorbing the parts of human labour that humans were never especially glad to do.

That shift is good if the substrate underneath it is plural, jurisdictionally clear, and within reach of the people whose lives it will reshape. It is bad if it is owned by three companies on another continent.

Archipelag.io is our piece of making it the first one. A network where the compute is everywhere, where every contributor is a stakeholder, and where the most important question about an AI workload — *whose hardware, under whose law* — has an answer that does not require trusting a logo.

The leaderboards will catch up in ten years. The substrate is built now.
