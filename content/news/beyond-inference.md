+++
title = "Beyond Inference"
description = "Archipelag.io isn't just an AI network. It's a distributed compute fabric with 137 workloads — from OCR and PDF generation to video transcoding and code formatting. Here's why that matters."
date = 2026-04-19
draft = true

[extra]
category = "Technical"
+++

Every few months, another startup announces a decentralized AI inference network. The pitch is always some version of: idle GPUs plus a coordination layer equals cheaper LLM calls. It's a reasonable idea. We've made that pitch ourselves.

But it's also a ceiling. If all you can do is relay inference requests to someone else's GPU, you're competing on price against cloud providers who have economies of scale you will never match, and against each other, which is worse. The network becomes a commodity relay. Margins compress. The only differentiator left is who has more GPUs.

We decided early on that Archipelag.io should be something else. Not an inference relay. A compute fabric.

## 137 Cargos

As of today, the Archipelag.io [Cargo Registry](/cargo) contains 137 workloads across six different runtime formats. Here's what that looks like:

**40 container-based Cargos** — traditional Docker containers running Python, Node, or compiled binaries. These handle everything from [OCR](#ocr) and [PDF generation](#documents) to [video transcoding](#video) and [code formatting](#developer-tools). None of them require a GPU. They run on any Island with a CPU and some RAM.

**22 WebAssembly modules** — lightweight Rust programs compiled to WASM. These are tiny (kilobytes, not gigabytes), start in milliseconds, and can run on anything: a Linux server, a Mac, a phone, even a browser. They handle data transformations, text processing, hashing, compression, regex matching, QR code generation.

**45 ONNX models** — pre-trained neural networks for specific tasks: speech recognition, text classification, named entity recognition, image captioning, object detection, background removal, text embeddings, translation across 100+ language pairs. About half of these run on CPU alone.

**15 GGUF models** — quantized large language models for llama.cpp inference. From TinyLlama (1.1B parameters, runs on a phone) to Nemotron-3 (120B parameters, needs serious hardware). These are the "AI inference" part of the network.

**12 Diffusers models** — image and video generation. Stable Diffusion, FLUX, text-to-video models from Tencent and Alibaba. These need GPUs.

**3 CoreML models** — on-device inference for iOS: text-to-speech, a small LLM, and speech recognition via WhisperKit. These run on Apple's Neural Engine.

The AI models get the attention. But the 40 containers and 22 WASM modules are, quietly, the more interesting part of the story.

## Why non-AI Cargos matter

Consider what happens when an Island on the network can only serve LLM inference. It sits idle when there's no chat traffic. It competes with every other GPU on the network for the same pool of inference requests. Its utilization is spiky and unpredictable, high when someone's chatting, zero otherwise.

Now consider an Island that can serve inference *and* OCR *and* image resizing *and* PDF generation *and* code formatting. It has five sources of demand instead of one. When nobody's chatting, it's processing document scans. When the OCR queue is empty, it's converting Markdown to PDF. The Island stays busy. The operator earns more. The network serves more use cases.

This is the same logic that makes general-purpose cloud providers more resilient than single-purpose ones. Diversified demand smooths utilization. Smoothed utilization means better economics for everyone.

But there's a second reason, and it's more fundamental: most compute work in the world is not AI inference. It's document processing, media conversion, data transformation, batch operations. The mundane, unglamorous tasks that every business runs every day. If you build a network that can only do one thing, you're ignoring the vast majority of compute demand. If you build a network that can do anything, you can grow into the actual shape of the market.

<h2 id="ocr">OCR: extracting text from images</h2>

Let's make this concrete with one Cargo.

The OCR Cargo takes an image — a photo of a receipt, a scan of a contract, a screenshot of a whiteboard — and returns the text in it. It uses EasyOCR, supports 80+ languages, and can return bounding boxes and confidence scores for every detected word.

The container is a 24-line Dockerfile with a Python script. It doesn't need a GPU (though it'll use one if available). It needs 2GB of RAM and two CPU cores. Any Island on the network can run it.

Here's what a request looks like:

```json
{
  "image": "<base64-encoded image>",
  "languages": ["en", "de"],
  "detail": true
}
```

And the response:

```json
{
  "text": "Invoice #2847 — Due: April 30, 2026",
  "blocks": [
    {"text": "Invoice", "confidence": 0.98, "box": [[12, 8], [142, 8], [142, 34], [12, 34]]},
    {"text": "#2847", "confidence": 0.95, "box": [[148, 8], [232, 8], [232, 34], [148, 34]]}
  ],
  "languages": ["en", "de"]
}
```

The consumer doesn't need to know which Island ran it, where it was, or what hardware it has. They sent an image, they got text back. The network handled the rest.

Now multiply this by 40 containers. Image resizing with intelligent cropping. Face blurring for privacy compliance. HTML to PDF. PDF merging and signing. Audio normalization. Video transcoding between H.264, H.265, VP9, and AV1. Barcode and QR code generation. Excel parsing. Code formatting for Python, JavaScript, Go, and Rust. Template rendering with Jinja2 and Mustache.

Each of these is a real, production-ready container with a Dockerfile, a manifest, and implementation code. Each one is a Cargo that any Island can serve.

<h2 id="documents">Documents and media</h2>

Document processing is one of the most underserved categories in cloud computing. The APIs that exist are either expensive (per-page pricing that adds up fast at scale), slow (cold starts measured in seconds), or locked into a specific vendor's ecosystem.

On Archipelag.io, document Cargos run on the same network as everything else. Need to extract text from a thousand PDFs? The coordinator distributes the work across available Islands, each one processing pages in parallel. Need to merge fifty invoices into a single document? One API call, one result, billed at market rate through the [Compute Exchange](/matchmaking).

The document Cargos currently in the registry:

| Cargo | What it does |
|-------|-------------|
| `pdf-extract` | Pull text, tables, and images from PDFs |
| `pdf-merge` | Combine multiple PDFs into one |
| `pdf-sign` | Add digital signatures to documents |
| `html-to-pdf` | Render HTML to PDF with custom page sizes and margins |
| `markdown-to-pdf` | Convert Markdown to styled PDF documents |
| `docx-extract` | Extract text and metadata from Word documents |
| `xlsx-parse` | Parse Excel spreadsheets to JSON |
| `ocr` | Extract text from images (80+ languages) |

<h2 id="video">Video and audio</h2>

Media processing is another category where distributed compute makes obvious sense. Transcoding a video is CPU-intensive, embarrassingly parallel, and something that happens at enormous scale every day. Audio normalization, noise removal, format conversion — all of these are tasks that any machine with FFmpeg can handle.

| Cargo | What it does |
|-------|-------------|
| `video-transcode` | Convert between H.264, H.265, VP9, AV1 |
| `video-compress` | Quality-controlled compression |
| `video-clip` | Extract clips by timestamp |
| `video-thumbnail` | Generate thumbnail images |
| `video-subtitle` | Burn SRT/ASS subtitles into video |
| `audio-convert` | Convert between MP3, WAV, FLAC, OGG, AAC |
| `audio-merge` | Merge files with optional crossfade |
| `audio-split` | Split by silence detection or timestamps |
| `noise-remove` | Remove background noise |
| `normalize-audio` | LUFS-standard volume normalization |

<h2 id="developer-tools">Developer tools</h2>

Some of the most useful Cargos are the smallest ones. The WASM modules are Rust programs compiled to WebAssembly — they start in under a millisecond and handle data transformations that developers do every day.

| Cargo | Runtime | What it does |
|-------|---------|-------------|
| `json` | WASM | Validate, format, query JSON (jq-like) |
| `csv` | WASM | Parse and transform CSV data |
| `yaml` | WASM | YAML ↔ JSON conversion |
| `toml` | WASM | TOML ↔ JSON conversion |
| `regex` | WASM | Match, test, replace with regex |
| `diff` | WASM | Compute unified diffs between texts |
| `highlight` | WASM | Syntax-highlight code to HTML |
| `minify` | WASM | Minify HTML, CSS, JavaScript |
| `markdown` | WASM | Render Markdown to HTML |
| `semver` | WASM | Parse, compare, validate semantic versions |
| `jwt` | WASM | Decode, validate, inspect JWT tokens |
| `hash` | WASM | SHA-256, SHA-512, MD5, BLAKE3 |
| `uuid` | WASM | Generate and validate UUIDs (v4, v5, v7) |
| `sanitize` | WASM | Sanitize HTML to prevent XSS |
| `format-code` | Container | Format Python, JS, Go, Rust source code |
| `json-to-types` | Container | Generate TypeScript/Python/Go types from JSON |
| `language-detect` | Container | Detect the language of text |

These aren't glamorous. Nobody's going to put "distributed YAML parsing" in a pitch deck. But they represent something important: the network can handle *any* compute task, not just the ones that require billion-parameter models. And because WASM modules are measured in kilobytes and start instantly, they prove that the overhead of routing work through a distributed network can be negligible — not every job needs to justify the cost of spinning up a container.

## The AI models, too

To be clear: we haven't abandoned AI. It's still the largest category in the registry by model count, and it's where most of the compute demand will come from for the foreseeable future.

The ONNX collection alone covers most of the ML tasks a typical application needs:

- **Text**: sentiment analysis, classification, summarization, paraphrasing, grammar correction, named entity recognition, translation (100+ languages), keyword extraction, toxicity detection
- **Vision**: object detection (YOLOv8), image captioning (BLIP), depth estimation, segmentation, background removal, style transfer, upscaling (Real-ESRGAN)
- **Audio**: speech recognition (Whisper, Parakeet), text-to-speech (Kokoro, Coqui, IndexTTS), voice cloning
- **Embeddings**: from lightweight (BGE-Small, 384 dimensions) to high-quality multilingual (E5-Large, 1024 dimensions) to multimodal (Qwen3-VL)

And the LLM collection ranges from models that [run on a phone](/news/your-phone-is-an-island) (TinyLlama at 1.1B parameters) to models that need a serious workstation (Nemotron-3 at 120B parameters, with mixture-of-experts keeping the active parameter count manageable).

The difference is: AI inference is one thing the network does. Not the only thing.

## What this means for Islands

If you're running an Island — or thinking about it — the diversity of Cargos translates directly to earnings.

An inference-only network pays you when someone chats with an LLM. That demand is bursty. Nobody's chatting at 3 AM. Your GPU sits idle.

On Archipelag.io, your Island can serve any Cargo it's capable of running. During peak hours, you're running LLM inference. During off-hours, you're processing batch OCR jobs, transcoding video uploads, converting documents. The coordinator matches supply to demand continuously, routing work to the Islands that can handle it most efficiently.

And because 40 of the 60+ non-AI Cargos don't need a GPU at all, even a modest machine — a laptop, a mini PC, an old desktop — can contribute meaningfully. You don't need an RTX 4090 to be a useful Island. You need a CPU, some RAM, and an internet connection. The network has work for you.

## The architecture underneath

All of this is possible because of a design decision we made early: the coordinator doesn't know or care what's inside a Cargo. It dispatches jobs to containers. The container takes input, produces output, and reports completion. Whether that container runs a 70-billion-parameter language model or a Python script that calls Tesseract doesn't matter to the coordination layer.

This means adding a new Cargo to the network is straightforward:

1. Write a Docker container (or a WASM module, or package an ONNX model) that reads JSON from stdin and writes JSON to stdout
2. Create a manifest declaring what resources it needs
3. Sign the image with cosign
4. Register it in the Cargo Registry

The network handles everything else: routing, scheduling, streaming, billing, reputation tracking, failure recovery. The same infrastructure that streams LLM tokens in real time can stream OCR results, transcoding progress, or any other incremental output.

This is what we mean by "compute fabric." Not a wrapper around one kind of computation. A general-purpose substrate that routes any kind of work to any kind of hardware, close to the people who need it.

## What we're building toward

We started with AI inference because that's where the urgency is — GPU scarcity is real, latency matters, and the market is ready. But the endgame was always broader.

We want Archipelag.io to be the network you reach for whenever you need compute and don't want to manage infrastructure. Resize a batch of images. Transcribe a meeting. Convert a hundred Markdown files to PDF. Run sentiment analysis on customer feedback. Transcode video uploads for your app. Format a codebase. Extract data from a stack of invoices.

Every one of these tasks already has a Cargo in the registry. Every one of them can run on a network of independent Islands, priced by supply and demand, routed to the nearest capable hardware.

The GPU is not the only interesting piece of silicon in the world. There are billions of capable CPUs out there, doing nothing most of the time. We intend to put them to work.

Browse the full registry at [archipelag.io/cargo](/cargo).
