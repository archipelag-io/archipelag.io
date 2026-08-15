<p align="center">
  <a href="https://archipelag.io"><img src="https://img.shields.io/website?url=https%3A%2F%2Farchipelag.io&label=archipelag.io" alt="Website"></a>
  <a href="https://github.com/archipelag-io/archipelag.io/blob/main/LICENSE"><img src="https://img.shields.io/github/license/archipelag-io/archipelag.io" alt="License"></a>
  <a href="https://www.getzola.org/"><img src="https://img.shields.io/badge/Built_with-Zola-blue" alt="Built with Zola"></a>
</p>

# Archipelag.io Website

Marketing website for [archipelag.io](https://archipelag.io), built with [Zola](https://www.getzola.org/) static site generator.

## Quick Start

```bash
# Install dependencies (requires mise)
mise install

# Run development server
mise run dev

# Build for production
mise run build
```

The dev server runs at `http://localhost:1111` with live reload.

## Project Structure

```
website/
├── config.toml              # Zola configuration
├── mise.toml                # Task runner configuration
│
├── content/                 # Markdown content
│   ├── _index.md           # Homepage (uses index.html template)
│   ├── use.md              # Use AI page
│   ├── earn.md             # Earn/Host page
│   ├── pricing.md          # Pricing page
│   ├── about.md            # About page
│   ├── contact.md          # Contact page
│   └── blog/               # Blog section
│       ├── _index.md       # Blog listing config
│       └── *.md            # Blog posts
│
├── templates/               # Tera HTML templates
│   ├── index.html          # Homepage
│   ├── use.html            # Use AI page
│   ├── earn.html           # Earn page
│   ├── pricing.html        # Pricing page
│   ├── blog.html           # Blog listing
│   ├── blog-post.html      # Individual blog post
│   ├── page.html           # Generic content page
│   ├── base.html           # Base layout (unused, each template is standalone)
│   └── 404.html            # Error page
│
├── sass/                    # SCSS stylesheets
│   ├── main.scss           # Entry point, imports partials
│   ├── _variables.scss     # Design tokens, fonts, colors
│   ├── _layout.scss        # Container, grid, flex utilities
│   ├── _components.scss    # Buttons, cards, tables, badges
│   ├── _sections.scss      # Hero, header, footer, CTAs
│   └── _utilities.scss     # Text, spacing, display helpers
│
├── static/                  # Static assets (copied as-is)
│   ├── img/                # Images
│   ├── favicon.*           # Favicon files
│   ├── CNAME               # GitHub Pages custom domain
│   ├── robots.txt          # Search engine directives
│   └── site.webmanifest    # PWA manifest
│
└── public/                  # Built site (git-ignored)
```

## Pages

| Path | Template | Description |
|------|----------|-------------|
| `/` | `index.html` | Homepage with hero, features, CTAs |
| `/use` | `use.html` | For AI consumers - capabilities, API docs |
| `/earn` | `earn.html` | For hosts - earnings, requirements, security |
| `/pricing` | `pricing.html` | Credit packages, usage rates, host earnings |
| `/about` | `page.html` | Mission, team, roadmap |
| `/contact` | `page.html` | Contact information |
| `/blog` | `blog.html` | Blog post listing |
| `/blog/*` | `blog-post.html` | Individual blog posts |

## Design System

### Typography

- **Brand font**: Satoshi (headings, navigation, buttons)
- **Body font**: iA Writer Quattro S (content, prose)

Both fonts are loaded from CDN with `font-display: swap`.

### Colors

Stone-based neutral palette with teal accent:

```scss
// Neutrals
--stone-100 through --stone-900  // Warm grays

// Accent (teal)
--accent: #0d9488
--accent-light: #14b8a6
--accent-dark: #0f766e

// Semantic
--bg, --bg-subtle, --bg-muted   // Backgrounds
--text, --text-secondary        // Text colors
--border, --border-subtle       // Borders
```

### Dark Mode

Activated via `.dark` class on `<html>`. Theme preference stored in `localStorage`. Each template includes inline JS to prevent flash of wrong theme.

### Spacing Scale

```scss
--space-1: 0.25rem   --space-8: 2rem
--space-2: 0.5rem    --space-12: 3rem
--space-4: 1rem      --space-16: 4rem
--space-6: 1.5rem    --space-24: 6rem
```

### Components

**Buttons:**
```html
<a class="btn btn-primary btn-lg">Primary</a>
<a class="btn btn-secondary">Secondary</a>
```

**Cards:**
```html
<div class="card p-6">Content</div>
<div class="card pricing-card featured">Highlighted</div>
```

**Feature cards, step cards, code blocks** - see `_components.scss`.

### Layout Utilities

```html
<div class="container">Max-width centered content</div>
<div class="grid grid-3 gap-6">3-column grid</div>
<div class="flex items-center justify-between">Flexbox</div>
<div class="split">50/50 two-column layout</div>
```

## SEO & Accessibility

All templates include:

- **Meta tags**: description, robots, canonical, theme-color
- **Open Graph**: type, url, title, description, image
- **Twitter Cards**: summary_large_image with @archipelagio
- **JSON-LD**: Organization, WebSite, WebPage, FAQPage, BreadcrumbList
- **ARIA**: landmarks (banner, main, contentinfo), labels, states
- **Skip link**: Keyboard navigation to main content

## Configuration

### config.toml

```toml
base_url = "https://archipelag.io"
title = "Archipelag.io"

[extra]
app_base_url = "https://app.archipelag.io"
twitter = "@archipelagio"
```

### Adding a Blog Post

Create `content/blog/my-post.md`:

```markdown
+++
title = "Post Title"
description = "Short description for previews and SEO"
date = 2025-01-26
+++

Post content in Markdown...
```

Posts with `draft = true` are excluded from production builds.

### Adding a Page

1. Create `content/my-page.md` with frontmatter
2. Use `template = "page.html"` or create custom template
3. Add to navigation in templates if needed

## Development

### Available Tasks

```bash
mise run dev      # Start dev server with live reload
mise run build    # Build production site
mise run check    # Validate without building
mise run clean    # Remove public/ directory
```

### Editing Styles

1. Edit the appropriate SCSS partial
2. Dev server auto-recompiles on save
3. Use existing CSS custom properties for consistency

### Template Syntax

Templates use [Tera](https://tera.netlify.app/) (Jinja2-like):

```html
{{ config.title }}
{{ page.content | safe }}
{% for post in section.pages %}...{% endfor %}
{% if page.date %}...{% endif %}
```

## Deployment

The site deploys automatically via GitHub Actions on push to `main`:

1. Action installs Zola
2. Runs `zola build`
3. Deploys `public/` to GitHub Pages
4. Custom domain via `static/CNAME`

See `.github/workflows/deploy.yml` for details.

### Manual Deployment

```bash
mise run build
# Upload public/ to any static host
```

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](https://github.com/archipelag-io/.github/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/archipelag-io/.github/blob/main/CODE_OF_CONDUCT.md).

## External Links

- **App**: https://app.archipelag.io
- **Docs**: https://docs.archipelag.io
- **GitHub**: https://github.com/archipelag-io
- **Status**: https://status.archipelag.io (planned)
