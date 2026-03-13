+++
title = "Archipelag.io Enters Open Beta"
description = "We're opening Archipelag.io to everyone for three months. Come use AI, lend your GPU, and help us figure out what works."
date = 2026-03-13

[extra]
category = "Blog"
+++

There's a GPU in your computer that spends most of its life doing nothing.

Maybe it's a gaming rig that sits idle while you're at work. Maybe it's a workstation that renders video for two hours a day and sleeps the other twenty-two. Maybe it's a machine you built during the mining craze that's been gathering dust since ETH went proof-of-stake.

Meanwhile, someone across town is paying a cloud provider to rent a GPU in a data center three time zones away, waiting 200ms for each token of a chatbot response, and wondering why AI feels so sluggish.

This is the problem we set out to fix.

## Taking from the rich, giving to the rest

The way compute works today is that a handful of companies own the GPUs, and everyone else rents time on them. Prices go up, capacity gets scarce, and if you're not a Fortune 500 company with a cloud contract, you're at the back of the queue.

We thought there might be a different way. What if the people who need compute could get it from the people who already have it, just sitting around? What if your neighbor's gaming PC could serve your LLM requests with lower latency than any data center, because it's literally down the street?

That's Archipelag.io. A network where regular people contribute their idle CPUs and GPUs, and regular people use them. The compute is already out there, scattered across millions of homes and offices. We just built the plumbing to connect it.

## So, open beta

Starting today, Archipelag.io is open to everyone for three months, through **June 13, 2026**.

Here's what that means in practice:

**All the money is fake.** Credits, earnings, payouts, everything financial on the platform during the beta is virtual. Nobody gets charged, nobody gets paid. We need to test the billing system, the karma scores, the payout logic, and the best way to do that is to run it all for real, just without real money attached. When we flip the switch to real billing after the beta, everyone who participated will get bonus credits as a thank-you.

**Things will break.** We've been building this for over a year, and it works on our machines, in our test environments, with our carefully crafted scenarios. But we haven't seen what happens when a few hundred people with different hardware, different network conditions, and different ideas about what "use AI" means all show up at once. That's the whole point. We need you to find the bugs we can't.

**We might reset things.** If we need to change how the database works or restructure accounts, we might have to wipe data. We'll warn you first, but don't store anything important here yet.

## What you can actually do

You can chat with LLMs (Mistral 7B, Llama), generate images with Stable Diffusion XL, or hit our OpenAI-compatible API with your existing code. There are Python and JavaScript SDKs if you want to build on top of it.

If you've got a decent GPU (RTX 3060 or better), you can install the node agent on Windows, macOS, or Linux and start hosting. Your machine picks up inference jobs from people nearby, runs them, streams the results back. You earn virtual credits for now, real money later.

The web UI has a playground for trying models and a marketplace for browsing what's available.

## What we're hoping to learn

Honestly, we don't know exactly what will happen, and that's why we're doing this.

We want to find out if the routing works well enough, if requests actually land on nearby hosts or if they bounce around. We want to see where the onboarding loses people, which error messages are confusing, which features nobody uses. We want to know if the karma system (where hosts build reputation through reliable service) actually incentivizes good behavior or just creates busywork.

We want to hear from you. If something is broken, [open an issue](https://github.com/archipelag-io/archipelag-io/issues). If something is confusing, [email us](mailto:hello@archipelag.io). If you have an idea for something we should build, tell us.

## Getting started

**Want to use AI?** [Sign up](https://app.archipelag.io/auth/register), open the chat, and start talking to a model. It's running on someone's GPU, probably not very far from where you're sitting.

**Want to host?** [Grab the node agent](https://github.com/archipelag-io/node-agent/releases), point it at your API key, and set when you're available. Jobs will start arriving.

**Want to build?** The [docs](https://docs.archipelag.io) have everything, including the [API reference](https://docs.archipelag.io/api) and SDK guides.

## What happens next

After the beta, we plan to turn on real payments, add more models, launch mobile agents for phones and tablets, and grow the network into more regions. The specifics depend on what we learn over the next three months.

We'll keep posting updates here and on [GitHub](https://github.com/archipelag-io). This is a small team building something that only works if people show up and use it. So thank you for showing up.

Let's see what happens.
