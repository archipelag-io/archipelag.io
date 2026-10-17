#!/usr/bin/env python3
"""Snapshot the public Cargo catalog into data/cargos.json.

The /cargo page renders from this file at build time, so the website lists
exactly the Cargos the Coordinator reports as enabled and approved. Run it
with `mise run cargo:sync` and commit the result.

Usage: sync-cargo-catalog.py [--base-url URL] [--check]
  --check  exit 1 if data/cargos.json differs from production (no write)
"""

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_BASE_URL = "https://app.archipelag.io"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "cargos.json"

# Use-case groups understood by GET /api/v1/cargos?category=, with page labels
CATEGORIES = {
    "llm": "Language models",
    "image": "Image",
    "audio": "Audio",
    "vision": "Vision",
    "text": "Text",
    "utility": "Utility",
}

# Coordinator runtime_type -> filter key, short icon label, sidebar label
FORMATS = {
    "llmcpp": ("gguf", "GGUF", "GGUF"),
    "container": ("containers", "OCI", "Containers"),
    "onnx": ("onnx", "ONNX", "ONNX"),
    "wasm": ("wasm", "WASM", "WASM"),
    "diffusers": ("diffusers", "DIFF", "Diffusers"),
    "coreml": ("coreml", "CML", "CoreML"),
    "webgpu": ("webgpu", "WGPU", "WebGPU (browser)"),
    "exo": ("exo", "EXO", "Exo (multi-Island)"),
}


def fetch(base_url, query=""):
    url = f"{base_url}/api/v1/cargos{query}"
    # The edge rejects urllib's default user agent with 403
    headers = {"Accept": "application/json", "User-Agent": "archipelag.io-website/cargo-sync"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)["cargos"]


def size_label(mb):
    if not mb:
        return None
    return f"{mb / 1024:.0f} GB" if mb >= 1024 else f"{mb} MB"


def build(base_url):
    category_of = {}
    for category in CATEGORIES:
        for cargo in fetch(base_url, f"?category={category}"):
            category_of.setdefault(cargo["slug"], category)

    cargos = []
    for cargo in fetch(base_url):
        runtime = cargo["runtime_type"]
        fmt, icon, label = FORMATS.get(runtime, (runtime, runtime[:4].upper(), runtime))
        vram = size_label(cargo.get("required_vram_mb"))
        ram = size_label(cargo.get("required_ram_mb"))
        cargos.append({
            "slug": cargo["slug"],
            "name": cargo["name"],
            "description": cargo.get("description") or "",
            "runtime_type": runtime,
            "format": fmt,
            "format_icon": icon,
            "format_label": label,
            "category": category_of.get(cargo["slug"], "utility"),
            "requirement": f"{vram} VRAM" if vram else (f"{ram} RAM" if ram else None),
            "gpu": bool(cargo.get("required_vram_mb")),
        })

    order = list(CATEGORIES)
    cargos.sort(key=lambda c: (order.index(c["category"]), c["name"].lower()))
    return cargos


def facets(cargos):
    """Sidebar filter options with counts, in display order."""
    def count(field, key):
        return sum(1 for c in cargos if c[field] == key)

    formats = [
        {"key": key, "label": label, "count": count("format", key)}
        for key, _icon, label in FORMATS.values()
    ]
    categories = [
        {"key": key, "label": label, "count": count("category", key)}
        for key, label in CATEGORIES.items()
    ]
    formats.sort(key=lambda f: -f["count"])
    return {
        "formats": [f for f in formats if f["count"]],
        "categories": [c for c in categories if c["count"]],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    cargos = build(args.base_url.rstrip("/"))

    if args.check:
        current = json.loads(OUTPUT.read_text())["cargos"] if OUTPUT.exists() else []
        if current != cargos:
            print(f"data/cargos.json is stale: {len(current)} saved vs {len(cargos)} live")
            return 1
        print(f"data/cargos.json is current ({len(cargos)} Cargos)")
        return 0

    snapshot = {
        "source": f"{args.base_url.rstrip('/')}/api/v1/cargos",
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "count": len(cargos),
        **facets(cargos),
        "cargos": cargos,
    }
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(cargos)} Cargos to {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
