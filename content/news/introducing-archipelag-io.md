+++
title = "Introducing Archipelag.io"
description = "We built a distributed compute network that routes AI Cargos to nearby hardware instead of distant data centers. Here's the story of why, and what it actually does."
date = 2025-01-26

[extra]
category = "Announcement"
author = "Raffael Schneider"
+++

This started with a question that kept nagging at us: why are we sending AI requests halfway across a continent when there's a perfectly good GPU two blocks away?

Not a hypothetical GPU. A real one. Sitting inside a gaming PC in someone's apartment, drawing 15 watts at idle, waiting for its owner to get home from work so it can render some frames in a first-person shooter. Or inside a video editor's workstation that finished a render at 2pm and won't touch the GPU again until tomorrow morning. Or inside one of the thousands of machines people built during the Ethereum mining era, now gathering dust in closets and garages because proof-of-stake made them obsolete overnight.

We kept coming back to this picture: enormous amounts of capable hardware, already purchased, already powered on, already connected to fast internet, doing nothing. And on the other side, people paying cloud providers to rent equivalent hardware in a data center that might be three time zones away, accepting the latency and the markup because that's how things work.

We decided to see if we could connect those two sides.

## What Archipelag.io actually is

The short version: you send us an AI Cargo (a chat message, an image prompt, an API call), and we route it to a nearby Island that can handle it. That machine runs the job, streams the result back to you, and the person who owns it earns money for the work.

The longer version involves a coordinator service that tracks which Islands are online, what hardware they have, how reliable they've been, and where they are relative to you. When a job comes in, the coordinator picks the best available Island based on all of that, dispatches the job over NATS (a messaging system built for exactly this kind of thing), and the Island software picks it up, runs it in a sandboxed container, and streams output back through the coordinator to your browser or API client.

Islands build up a reputation score we call karma. Complete jobs reliably, respond quickly, stay online when you say you will, and your karma goes up. Higher karma means you get offered better jobs and can charge higher rates. Flake out or produce bad results, and the system routes around you. It's a simple mechanism, but it aligns incentives in a way that matters when you're trusting strangers' hardware with real Cargos.

## What you can do with it today

We're launching with AI inference, because that's where the mismatch between supply and demand is most obvious.

You can chat with Mistral 7B and Llama models, with responses streaming token by token from an Island near you. You can generate images with Stable Diffusion XL. If you're a developer, there's an OpenAI-compatible API, so if your code already talks to OpenAI, pointing it at Archipelag.io is a configuration change, not a rewrite.

On the Island side, we have the Island software that runs on Windows, macOS, and Linux. Install it, point it at your API key, tell it when you're available, and it handles the rest: pulling the right container images, managing GPU memory, streaming results, reporting health back to the coordinator. You don't need to understand how inference works. You just need a decent GPU (RTX 3060 or better) and an internet connection.

We chose to start with inference because it's a contained problem with clear value on both sides. But the architecture underneath doesn't know or care that it's running language models. It dispatches jobs to containers. Those containers could do rendering, transcoding, scientific simulation, whatever. We'll get there.

## Why we think this matters

There's a practical argument and a structural one.

The practical argument: latency. When someone in Berlin asks a chatbot a question and the response comes from a GPU in Frankfurt instead of Virginia, the difference is noticeable. Not just in raw milliseconds, but in the feel of the interaction. Streaming tokens from 30ms away feels like a conversation. Streaming them from 200ms away feels like waiting.

The structural argument: concentration. Right now, a small number of companies control most of the world's GPU cloud capacity. That's fine when things are working, but it means pricing is opaque, capacity crunches hit everyone at once, and if you're not a large enterprise with a negotiated contract, you're paying retail for a commodity. Meanwhile, NVIDIA ships over 30 million discrete GPUs a year into the consumer market alone. The compute exists. It's just not connected to the people who need it.

We're not trying to replace cloud providers. Data centers are good at sustained, high-throughput workloads, and that's not going away. What we're building is the other layer: the local, distributed, community-operated compute that handles the long tail of requests where proximity matters more than raw scale. A freelancer in Lisbon shouldn't have to send their inference requests to us-east-1. A student in Nairobi shouldn't be priced out of experimenting with AI because the nearest cloud region is in South Africa.

## What comes next

Over the coming months, we're adding more models, expanding into more regions, and shipping SDKs for Python and JavaScript so developers can build on top of this without thinking about the infrastructure underneath. We're also working on a mobile Island, because modern phones have serious compute capabilities and there's no reason they shouldn't participate in the network too.

The harder work is in the economics and the trust model. How do you price compute fairly when every Island has different hardware, different electricity costs, different availability patterns? How do you build enough trust that people are willing to send real Cargos to strangers' machines? We have initial answers to both of these, but they're hypotheses, not conclusions. We need real usage to test them.

## Try it

If you want to use AI on the network: [sign up](https://app.archipelag.io), get 10 free credits, and send a message. It'll be served from someone's GPU, probably closer to you than you'd expect.

If you want to contribute compute: [grab the Island software](https://github.com/archipelag-io/node-agent/releases), set your schedule, and see what happens. Your machine works while you don't.

If you want to follow along or contribute: everything is on [GitHub](https://github.com/archipelag-io). If something breaks or confuses you, [tell us](mailto:hey@archipelag.io).

This is a small team at the start of something that only works if people show up and participate. We're grateful you're here.
