+++
title = "Archipelag.io Enters Open Beta"
description = "We're opening Archipelag.io to everyone for three months. Come use AI, lend your GPU, and help us figure out what works."
date = 2026-03-13

[extra]
category = "Announcement"
+++

There's a GPU in your computer that spends most of its life doing nothing.

Maybe it's a gaming rig that sits idle while you're at work, a machine that cost you the better part of a paycheck and now runs Steam updates and screensavers for twenty hours a day. Maybe it's a workstation that renders video for two hours and sleeps the other twenty-two. Maybe it's a machine you built during the mining craze that's been collecting dust since ETH went proof-of-stake. Maybe it's the M3 MacBook on your kitchen table. Or the iPhone in your pocket, with a neural engine that Apple spent billions designing, currently dedicated to scrolling Instagram.

All of these devices can do meaningful compute work. Not just the beefy rigs, even a phone can run a small language model, handle a classification task, or contribute to a distributed inference job. The compute is already there, paid for, powered on, doing nothing useful.

Meanwhile, someone across town is paying a cloud provider to rent a GPU in a data center three time zones away, waiting 200ms for each token of a chatbot response, and wondering why AI feels so sluggish.

We looked at this situation and thought: this is fixable.

## The compute is already here

The way AI infrastructure works today is that a handful of companies own the GPUs, and everyone else rents time on them. Prices go up, capacity gets scarce, and if you're not a Fortune 500 company with a cloud contract, you're at the back of the queue. Meanwhile, NVIDIA can't manufacture chips fast enough, export controls are tightening, and every quarter the gap between who needs compute and who can get it grows wider.

But here's the thing that gets lost in all the hand-wringing about chip shortages: there is an enormous amount of compute sitting in people's homes right now, doing absolutely nothing. The gaming GPU market alone ships over 30 million discrete cards a year. Add laptops with capable integrated graphics, workstations, retired mining hardware, phones with neural engines, tablets with ML accelerators. The aggregate compute power in ordinary people's hands dwarfs what any single cloud provider operates. It's just fragmented, unconnected, and idle.

We thought there might be a different way. What if the people who need compute could get it from the people who already have it? What if your neighbor's RTX 4070 could serve your LLM requests with lower latency than any data center, because it's literally down the street? What if a network of regular people's machines, from a teenager's gaming PC in Munich to a photographer's Mac Studio in Lisbon, could collectively form something more resilient and more accessible than any centralized cloud?

That's Archipelag.io. A distributed compute network where you contribute what you have and use what you need. The hardware exists. The bandwidth exists. The people exist. We built the coordination layer to connect it all.

## Why this matters beyond convenience

We're building this because we think the current trajectory of AI infrastructure is fragile and exclusionary, and we'd rather not wait to find out how that plays out.

When three companies control the majority of GPU cloud capacity, that's a single point of failure for an increasingly critical technology. When a startup in São Paulo pays the same rate as a hedge fund in Manhattan but gets worse latency because the nearest data center is in Virginia, that's not a market working well. When a solo developer can't afford to experiment with AI because inference costs eat their entire budget, that's talent and ideas we never get to see.

We believe AI compute should work more like the internet itself: decentralized, regional, and owned by the people who participate in it. Not because centralization is evil, but because resilient systems need diverse infrastructure. A network of ten thousand independent hosts spread across real neighborhoods is harder to take down, harder to price-gouge, and closer to the people who actually use it than any single data center campus.

This is partially idealistic, yes. But it's also practical. Hardware scarcity is not a hypothetical scenario for next decade, it's already here. Lead times for high-end GPUs stretch months. Cloud spot instance prices spike unpredictably. Every new foundation model release triggers another wave of demand that supply can't absorb. The people who already own capable hardware are sitting on an asset that could generate passive income while making AI more accessible for everyone around them. That's not utopian thinking, that's just a better allocation of resources that already exist.

## So, open beta

Starting today, Archipelag.io is open to everyone for three months, through **June 13, 2026**.

Here's what that means in practice:

**All the money is fake.** Credits, earnings, payouts, everything financial on the platform during the beta is virtual. Nobody gets charged, nobody gets paid. We need to test the billing system, the karma scores, the payout logic, and the best way to do that is to run it all for real, just without real money attached. When we flip the switch to real billing after the beta, everyone who participated will get bonus credits as a thank-you.

**Things will break.** We've been building this for over a year, and it works on our machines, in our test environments, with our carefully crafted scenarios. But we haven't seen what happens when a few hundred people with different hardware, different network conditions, and different ideas about what "use AI" means all show up at once. That's the whole point. We need you to find the bugs we can't.

**We might reset things.** If we need to change how the database works or restructure accounts, we might have to wipe data. We'll warn you first, but don't store anything important here yet.

## What you can actually do

**Use AI.** Chat with LLMs (Mistral 7B, Llama), generate images with Stable Diffusion XL, or hit our OpenAI-compatible API with your existing code. There are Python and JavaScript SDKs if you want to build on top of it. The web UI has a playground for trying models and a marketplace for browsing what's available.

**Host with a GPU.** If you've got a decent graphics card (RTX 3060 or better), install the node agent on Windows, macOS, or Linux. Your machine picks up inference jobs from people nearby, runs them, streams the results back. You set your own availability, your machine works when you're not using it, and you earn credits. Think of it as your gaming rig picking up a side job while you sleep.

**Host with a phone.** If you have a recent iPhone or an M-series Mac, you can run smaller models directly on-device. It won't replace a 4090 for heavy inference, but it can handle lightweight tasks, and it lets you see how the network works without dedicating a full machine. We're building this to scale from phones to server racks, because a truly distributed network needs every tier of hardware.

The compute exchange sets prices through supply and demand, so even modest hardware can find work at a price point that makes sense. During the beta, all credits are virtual, but the economics are real: you'll see what your hardware is worth on the network.

## What we're hoping to learn

Honestly, we don't know exactly what will happen, and that's why we're doing this.

We want to find out if the routing works well enough, if requests actually land on nearby hosts or if they bounce around. We want to see where the onboarding loses people, which error messages are confusing, which features nobody uses. We want to know if the karma system (where hosts build reputation through reliable service) actually incentivizes good behavior or just creates busywork.

We want to hear from you. If something is broken, [open an issue](https://github.com/archipelag-io/archipelag-io/issues). If something is confusing, [email us](mailto:hey@archipelag.io). If you have an idea for something we should build, tell us.

## Getting started

**Want to use AI?** [Sign up](https://app.archipelag.io/auth/register), open the chat, and start talking to a model. It's running on someone's GPU, probably not very far from where you're sitting.

**Want to host?** [Grab the node agent](https://github.com/archipelag-io/node-agent/releases), point it at your API key, and set when you're available. Jobs will start arriving.

**Want to build?** The [docs](https://docs.archipelag.io) have everything, including the [API reference](https://app.archipelag.io/api/v1/docs) and SDK guides.

## What happens next

After the beta, we plan to turn on real payments, add more models, and grow the network into more regions. The specifics depend on what we learn over the next three months.

The longer arc is this: we want to build a compute network that's as decentralized and resilient as the internet was supposed to be. One where a freelance developer in Kraków can spin up an AI feature without a cloud contract. Where a student in Lagos can access the same models as a researcher at Stanford, served from hardware in their own city. Where the person hosting earns enough to cover their electricity bill and then some, turning idle hardware into a genuine income stream.

We're not pretending this is easy. Distributed systems are hard, incentive design is hard, getting strangers to trust a network with their hardware and their workloads is hard. But the alternative, a future where all AI compute funnels through three or four corporate clouds, is not a future we want to build toward.

We'll keep posting updates here and on [GitHub](https://github.com/archipelag-io). This is a small team building something that only works if people show up and use it. So thank you for showing up.

Let's see what we can build together.
