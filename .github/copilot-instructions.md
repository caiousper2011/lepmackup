# Antifurto

Consolidated project instructions for AI-assisted development. SEO is always the priority.

---

## 1. SEO & Search Optimization

### Technical SEO (seo-audit)

- Audit in priority order: Crawlability & Indexation → Technical Foundations → On-Page → Content Quality → Authority & Links.
- Verify robots.txt doesn't block important pages; confirm XML sitemap exists, is submitted to Search Console, and contains only canonical, indexable URLs.
- Important pages must be within 3 clicks of the homepage; no orphan pages.
- Every page needs a unique title tag (50–60 chars, primary keyword near the start) and meta description (150–160 chars with a CTA).
- One H1 per page containing the primary keyword; headings follow a logical hierarchy (H1 → H2 → H3).
- Include the primary keyword in the first 100 words; use related keywords naturally.
- All images need descriptive file names, alt text, compressed sizes, WebP format, and lazy loading.
- Canonical tags on every page; enforce consistent trailing-slash and www/non-www policies.
- Core Web Vitals targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- HTTPS across the entire site; no mixed content; valid SSL certificate.
- URLs must be lowercase, hyphen-separated, readable, descriptive, and short.
- `web_fetch`/`curl` cannot detect JS-injected schema markup — use Google Rich Results Test or browser DevTools instead.
- E-E-A-T signals: demonstrate Experience, Expertise, Authoritativeness, Trustworthiness with author credentials, original data, and transparent business info.

### AI Search Optimization (ai-seo)

- Optimize for ChatGPT, Perplexity, Google AI Overviews, Gemini, and Copilot.
- Three pillars: **Structure** (extractable content), **Authority** (citable sources), **Presence** (be where AI looks).
- Citing sources boosts visibility +40 %, statistics +37 %, quotations +30 % (Princeton GEO research).
- Comparison articles get cited ~33 % of the time — prioritize them.
- Use clear headings, summary boxes, definition lists, and FAQ sections so AI can extract answers.
- Implement comprehensive schema markup (FAQ, HowTo, Product, Article) to help AI understand content.
- Allow AI bots access: GPTBot, PerplexityBot, ClaudeBot — check robots.txt.
- Monitor AI search presence with Otterly AI, Peec AI, ZipTie, or LLMrefs.

### Schema Markup (schema-markup)

- Always use JSON-LD format in `<head>` or end of `<body>`.
- Common types: Organization, WebSite, Article, Product, SoftwareApplication, FAQPage, HowTo, BreadcrumbList, LocalBusiness, Event.
- Combine multiple types on one page using `@graph`.
- Schema must accurately represent visible page content — never mark up content that doesn't exist.
- Validate with Google Rich Results Test before deploying; monitor via Search Console.

### Programmatic SEO (programmatic-seo)

- Build SEO pages at scale using templates + data; every page must provide unique value — not just swapped variables.
- Data defensibility hierarchy: Proprietary > Product-derived > User-generated > Licensed > Public.
- Use subfolders (`/templates/resume/`), not subdomains — subfolders consolidate domain authority.
- 12 playbooks: Templates, Curation, Conversions, Comparisons, Examples, Locations, Personas, Integrations, Glossary, Translations, Directory, Profiles.
- Internal linking via hub-and-spoke model; no orphan pages; XML sitemap for all generated pages.
- Quality > Quantity: 100 great pages beat 10,000 thin ones. Avoid doorway pages, keyword stuffing, duplicate content.

### Site Architecture (site-architecture)

- Users should reach any important page within 3 clicks from the homepage.
- Header nav: 4–7 items max; CTA button rightmost; logo links to homepage.
- URL patterns: `/features/{name}`, `/blog/{slug}`, `/docs/{section}/{page}`, `/integrations/{name}`, `/vs/{competitor}`.
- No dates in blog URLs; no over-nesting; no IDs in URLs; no query parameters for content.
- Breadcrumbs mirror URL hierarchy; every segment is clickable except the current page.
- Internal linking: 5–10 internal links per 1,000 words; descriptive anchor text; no "click here".
- Hub-and-spoke model for content: hub page links to all spokes; spokes link back to hub and to each other.
- Footer grouped: Product, Resources, Company, Legal.

### Content Strategy (content-strategy)

- Balance searchable content (SEO-driven) with shareable content (social/viral).
- Content types: use-case pages, hub/spoke clusters, template libraries, thought leadership, data-driven, expert roundups, case studies.
- Build content pillars and topic clusters around them.
- Keyword research by buyer stage: Awareness → Consideration → Decision.
- Prioritization scoring: Customer Impact 40 %, Content-Market Fit 30 %, Search Potential 20 %, Resources 10 %.
- Content ideation from 6 sources: customer conversations, search data, competitor gaps, industry trends, internal data, community questions.

---

## 2. Content & Copywriting

### Copywriting (copywriting)

- Always check for `.agents/product-marketing-context.md` before writing.
- Core principles: Clarity over cleverness; Benefits over features; Specificity over vagueness; Customer language over company language; One idea per section.
- Style: Simple words ("use" not "utilize"), active voice, confident tone (remove "almost," "very"), no exclamation points.
- Headline formulas: "{Outcome} without {pain point}", "The {category} for {audience}", "Never {unpleasant event} again".
- CTA formula: [Action Verb] + [What They Get] + [Qualifier]. Strong: "Start Free Trial", "Get the Complete Checklist". Weak: "Submit", "Click Here".
- Page structure: Above the fold (Headline + Subheadline + Primary CTA) → Social Proof → Problem/Pain → Solution/Benefits → How It Works → Objection Handling → Final CTA.
- Provide 2–3 headline/CTA alternatives with rationale; include Meta title + description for SEO.
- Never fabricate statistics or testimonials — honesty over sensationalism.

### Copy Editing (copy-editing)

- Seven Sweeps Framework: Clarity → Voice/Tone → "So What?" → Prove It → Specificity → Heightened Emotion → Zero Risk.
- Word-level: replace complex words with plain English; cut filler words.
- Sentence-level: one idea per sentence; active voice; remove qualifiers.
- Paragraph-level: lead with the point; cut redundant paragraphs.
- Run sweeps iteratively — each round of edits may create new issues.

### Social Content (social-content)

- Build content around 3–5 pillars (e.g., Industry insights 30 %, Behind-the-scenes 25 %, Educational 25 %, Personal 15 %, Promotional 5 %).
- Hook formulas: Curiosity ("I was wrong about…"), Story ("Last week…"), Value ("How to…"), Contrarian ("Unpopular opinion…").
- Repurposing: Blog post → LinkedIn carousel + Twitter thread + Instagram reel + key insight posts.
- Platform frequency: LinkedIn 3–5×/week, Twitter 3–10×/day, Instagram 1–2 posts + Stories daily, TikTok 1–4×/day.
- Engagement routine (30 min/day): respond to comments, comment on 5–10 target accounts, share with insight, send 2–3 DMs.
- Avoid external links in post body (reduces reach); test hooks, times, and formats.

---

## 3. Conversion Rate Optimization

### Page CRO (page-cro)

- Analysis framework (by impact): Value Proposition Clarity → Headline Effectiveness → CTA Placement & Hierarchy → Visual Hierarchy & Scannability → Trust Signals → Objection Handling → Friction Points.
- Visitor must understand what the page is and why they should care within 5 seconds.
- One clear primary CTA visible without scrolling; repeat CTAs at key decision points.
- Trust signals (customer logos, testimonials, case studies, review scores) placed near CTAs and after benefit claims.
- Address objections through FAQ, guarantees, comparisons, process transparency.
- Structure output as Quick Wins → High-Impact Changes → Test Ideas → Copy Alternatives.

### Form CRO (form-cro)

- Every field has a cost: 3 fields = baseline; 7+ fields = 25–50 %+ reduction in completion.
- For each field ask: Is it necessary? Can we get it later? Can we infer it?
- Start with easiest fields (name, email); sensitive fields last (phone, company size).
- Labels stay visible (not placeholder-only); inline validation on blur; specific error messages.
- Single-column layout preferred; multi-step forms for 5+ fields with progress indicator.
- Submit button: "[Action] + [What they get]" (e.g., "Get My Free Quote"); placed immediately after last field.
- Mobile: 44 px+ touch targets, appropriate keyboard types, autofill support.

### Signup Flow CRO (signup-flow-cro)

- Minimize required fields: Email + Password essential; defer Company, Role, Phone to later.
- Show value before asking for commitment; let users experience the product before signup if possible.
- Social auth (Google, Apple, Microsoft) often converts higher — place prominently.
- Single-step for ≤ 3 fields; multi-step with progress bar for more.
- Progressive commitment: Email only → Password + Name → Optional customization.
- "No credit card required", "Free forever", privacy notes near form.
- Post-submit: clear confirmation + immediate next step; if email verification needed, allow product exploration while waiting.

### Onboarding CRO (onboarding-cro)

- Time-to-value is everything — remove every step between signup and core value.
- Define the "aha moment": the action most strongly correlated with retention.
- First session: one goal, one successful outcome. Save advanced features for later.
- Onboarding checklist: 3–7 items, ordered by value (most impactful first), with progress bar and celebration on completion.
- Empty states are onboarding opportunities — show what the area does, example data, and a clear primary action.
- Multi-channel: trigger-based emails reinforce (not duplicate) in-app actions.
- Detect stalled users (X days inactive) and re-engage via email, in-app recovery, or personal outreach for high-value accounts.

### Popup CRO (popup-cro)

- Timing is everything: too early = annoying, too late = missed. Best triggers: scroll 25–50 %, exit intent, click-triggered (highest conversion 10 %+).
- Value must be obvious and relevant to page context; easy to dismiss; respect user preferences.
- Frequency: max once per session; 7–30 day cool-down after dismissal; exclude converted users.
- Copy: benefit-driven headline, specific subheadline, first-person CTA ("Get My Discount"), polite decline ("No thanks").
- Close button must be visible (top right); mobile: bottom slide-ups, not full-screen overlays.
- Comply with GDPR (clear consent, privacy link); avoid intrusive interstitials that hurt SEO.
- Benchmarks: email popup 2–5 % conversion; exit intent 3–10 %; click-triggered 10 %+.

### Paywall & Upgrade CRO (paywall-upgrade-cro)

- Show upgrade prompts after the "aha moment", never before value is experienced.
- Trigger points: feature gates, usage limits, trial expiration (warnings at 7, 3, 1 day), time-based prompts.
- Components: Headline ("Unlock [Feature] to [Benefit]") → Value demonstration → Feature comparison → Pricing → Social proof → Specific CTA → Clear escape hatch.
- Respect the "No": don't trap or pressure; maintain trust for future conversion.
- Anti-patterns: hiding close button, confusing plan selection, guilt-trip copy, asking before value delivered.

---

## 4. Paid Advertising

### Paid Ads Strategy (paid-ads)

- Platform selection: Google Ads (high-intent search), Meta (demand gen, visual), LinkedIn (B2B decision-makers), TikTok (younger demos), Twitter/X (tech audiences).
- Account structure: Campaign → Ad Set (targeting variation) → Ads (creative variations).
- Naming convention: `[Platform]_[Objective]_[Audience]_[Offer]_[Date]`.
- Budget: testing phase 70 % proven / 30 % testing; increase budgets 20–30 % at a time; wait 3–5 days between increases.
- Ad copy frameworks: Problem-Agitate-Solve (PAS), Before-After-Bridge (BAB), Social Proof Lead.
- Video ads (15–30 s): Hook (0–3 s) → Problem (3–8 s) → Solution (8–20 s) → CTA (20–30 s). Always include captions.
- Creative testing hierarchy: Concept/angle > Hook/headline > Visual style > Body copy > CTA.
- Retargeting: funnel-based (top/middle/bottom); segment by recency (1–7 d hot, 7–30 d warm, 30–90 d cold); exclude existing customers.
- Optimization: if CPA too high → check landing page first; if CTR low → test new creative; if CPM high → expand audience.
- Always compare platform attribution to GA4; use UTM parameters consistently; track blended CAC.

### Ad Creative (ad-creative)

- Two modes: generate from scratch / iterate from performance data.
- Platform character limits: Google RSA headlines 30 chars / descriptions 90 chars; Meta primary text 125 chars; LinkedIn intro 150 chars; TikTok 80 chars; Twitter 280 chars.
- Angle-based generation: pain point, outcome, social proof, curiosity, comparison, urgency, identity, contrarian.
- Batch generation workflow: research → angles → generate variants → review → export.
- Visual: use AI (Gemini/Flux) for image generation; Remotion for video; keep text under 20 % of ad image area.

---

## 5. Email Marketing

### Email Sequences (email-sequence)

- Core principles: one email = one job = one CTA; value before ask; relevance over volume.
- Sequence types & lengths: Welcome (5–7 emails / 12–14 days), Lead nurture (6–8 / 2–3 weeks), Re-engagement (3–4 / 2 weeks), Onboarding (5–7 / 14 days).
- Timing: welcome email immediately; early sequence 1–2 days apart; nurture 2–4 days; long-term weekly.
- Subject lines: clear > clever; 40–60 chars; patterns — Question, How-to, Number, Direct, Story tease.
- Email structure: Hook → Context → Value → CTA → Sign-off. Short paragraphs (1–3 sentences); mobile-first.
- Length: 50–125 words transactional; 150–300 educational; 300–500 story-driven.
- CTA: buttons for primary actions; links for secondary; button text = Action + Outcome.

### Cold Email (cold-email)

- Peer-level voice, not vendor tone. Personalization connected to their specific problem.
- Structure frameworks: Observation → Problem → Proof → Ask; or Compliment → Challenge → Solution → CTA.
- Subject lines: 2–4 words, lowercase.
- Follow-up sequences: 3–5 emails; space 2–4 days apart; each adds new angle, not just "checking in."

---

## 6. Growth & Retention

### Churn Prevention (churn-prevention)

- Two types: voluntary (customer decides to leave) and involuntary (payment failure).
- Cancel flow: Trigger → Exit Survey → Dynamic Save Offer → Confirmation → Post-Cancel follow-up.
- Map save offers to cancel reasons (too expensive → discount; not using → onboarding help; missing feature → roadmap preview).
- Health score model: product usage frequency, feature adoption, support tickets, NPS, billing history.
- Proactive interventions triggered by declining health scores before the customer decides to cancel.
- Dunning stack for involuntary churn: pre-dunning → smart retry → escalating emails → grace period → hard cancel.

### Referral & Affiliate Programs (referral-program)

- Referral loop: Trigger Moment → Share Action → Convert Referred → Reward → Loop.
- Best trigger moments: after "aha moment", milestone achievement, exceptional support, renewal/upgrade.
- Double-sided rewards (both parties get something) convert higher than single-sided.
- Share mechanisms ranked by effectiveness: in-product sharing > personalized link > email invitation > social sharing > referral code.
- Referred customers: 16–25 % higher LTV, 18–37 % lower churn, 2–3× referral rate.

### Launch Strategy (launch-strategy)

- ORB Framework: **Owned** channels (email, blog, community) → **Rented** channels (social, marketplaces) → **Borrowed** channels (guest content, influencers, speaking).
- Five phases: Internal → Alpha → Beta → Early Access → Full Launch.
- Product Hunt: build relationships pre-launch; optimize listing with compelling tagline + demo video; engage all day on launch day; convert traffic into owned relationships.
- Post-launch: onboarding email sequence, comparison pages, interactive demos, announcement in roundup.
- Every update is a launch opportunity: stagger announcements; major updates get full campaigns; medium updates get targeted emails; minor updates go to changelog.

### Marketing Ideas (marketing-ideas)

- 139 proven SaaS marketing ideas across categories: Content & SEO, Competitor, Free Tools, Paid Ads, Social & Community, Email, Partnerships, Events, PR, Launches, Product-Led, Content Formats, Unconventional, Platforms, International, Developer, Audience-Specific.
- Prioritize by stage: Pre-launch (waitlist, early access, Product Hunt), Early (content, SEO, community), Growth (paid, partnerships, events), Scale (brand, international).
- For each idea: name + why it fits + how to start + expected outcome + resources needed.

### Free Tool Strategy (free-tool-strategy)

- "Engineering as Marketing": build a free tool that solves a real problem adjacent to your core product.
- Tool types: Calculators, Generators, Analyzers, Testers, Libraries, Interactive.
- Lead capture: fully gated (max capture) vs. partially gated (balance) vs. ungated (max SEO/reach).
- Evaluation scorecard: search demand, audience match, uniqueness, path to product, build feasibility, maintenance burden, link-building potential, share-worthiness.
- MVP: core functionality only + basic UX + email capture. Skip accounts, saving, advanced features initially.

---

## 7. Pricing & Revenue Operations

### Pricing Strategy (pricing-strategy)

- Price based on value delivered, not cost to serve.
- Three axes: Packaging (what's included), Pricing Metric (what you charge for), Price Point (how much).
- Good value metrics align price with value, are easy to understand, scale with growth, are hard to game.
- Good-Better-Best tiers: Entry (core, limited) → Recommended (full, anchor) → Premium (everything, 2–3× of Recommended).
- Pricing psychology: anchoring (show higher price first), decoy effect (middle tier = best value), charm pricing ($49 for value, $50 for premium), Rule of 100 (% discount under $100, $ discount over $100).
- Signs to raise prices: competitors raised, prospects don't flinch, "it's so cheap" feedback, very high conversion (>40 %), low churn (<3 %).
- Pricing page: clear comparison table, recommended tier highlighted, monthly/annual toggle, FAQ, annual discount (17–20 %), money-back guarantee.

### Revenue Operations (revops)

- Single source of truth: one CRM as canonical system; sync everything to it.
- Lead lifecycle: Subscriber → Lead → MQL → SQL → Opportunity → Customer → Evangelist.
- MQL requires both fit (ICP match) and engagement (buying intent) — neither alone is sufficient.
- Lead scoring: explicit (who they are) + implicit (what they do) + negative (disqualifying signals). Recalibrate quarterly.
- Speed-to-lead is critical: contact within 5 minutes = 21× more likely to qualify; after 30 minutes, 10× drop.
- Pipeline stages: Qualified → Discovery → Demo/Evaluation → Proposal → Negotiation → Closed Won/Lost. Required fields per stage; stale deal alerts.
- MQL-to-SQL SLA: rep contacts within 4 hours, qualifies or rejects within 48 hours.
- Key metrics: Lead-to-MQL rate (5–15 %), MQL-to-SQL rate (30–50 %), SQL-to-Opp (50–70 %), Win rate (20–30 %), LTV:CAC > 3:1.

### Sales Enablement (sales-enablement)

- Sales uses what sales trusts — involve reps in creation; use their language.
- Asset types: pitch deck (10–12 slides, story arc not feature tour), one-pagers (scannable in 30 s), objection handling docs, ROI calculators, demo scripts, case study briefs, proposal templates, playbooks, buyer persona cards.
- Pitch deck flow: Current Problem → Cost of Problem → Market Shift → Your Approach → Product Walkthrough → Proof Points → Case Study → Implementation → ROI → Pricing → Next Steps.
- Customize by buyer: Technical buyer (architecture, security) vs. Economic buyer (ROI, payback) vs. Champion (internal selling points).
- Objection categories: Price, Timing, Competition, Authority, Status quo, Technical. For each: exact statement + real concern + response + proof point + follow-up question.

---

## 8. Marketing Psychology

### Key Mental Models (marketing-psychology)

- **First Principles**: Break problems to basics before copying competitors.
- **Jobs to Be Done**: People hire products for outcomes, not features.
- **Loss Aversion**: Losses feel 2× as painful as equivalent gains. Frame as "what you'll lose by not acting."
- **Anchoring**: First number seen heavily influences all subsequent judgments. Show premium price first.
- **Social Proof / Bandwagon**: Show customer counts, logos, reviews, testimonials. Numbers create confidence.
- **Scarcity / Urgency**: Limited availability increases perceived value. Only use when genuine.
- **Reciprocity**: Give value first (free content, tools, trials) → people want to give back.
- **Commitment & Consistency**: Get small commitments first (email signup, free trial) → larger ones follow.
- **Endowment Effect**: Free trials let customers "own" the product, making them reluctant to give it up.
- **Zero-Price Effect**: "Free" is psychologically different from any price — disproportionate appeal.
- **Paradox of Choice**: Fewer options → more decisions. Three tiers beat seven.
- **Goal-Gradient Effect**: People accelerate as they approach a goal. Show progress bars and "almost there" messaging.
- **Peak-End Rule**: Design memorable peaks and strong endings — people judge by best/worst moment + ending.
- **Decoy Effect**: Adding an inferior third option makes the preferred one look better.
- **Framing Effect**: Same facts, different frame = different perception. "90 % success rate" > "10 % failure rate."
- **IKEA Effect**: People value things more when they've built/customized them.

### Pricing Psychology (subset)

- Charm pricing: $99 feels much cheaper than $100 (left-digit effect).
- Round pricing signals premium ($100 > $99 for high-end).
- Rule of 100: under $100 use "% off"; over $100 use "$ off."
- Mental accounting: "$1/day" feels cheaper than "$30/month."

### Decision Frameworks

- **BJ Fogg**: Behavior = Motivation × Ability × Prompt. All three must be present.
- **EAST**: Make desired behaviors Easy, Attractive, Social, Timely.
- **Theory of Constraints**: Find the one bottleneck and fix it before optimizing elsewhere.
- **Pareto (80/20)**: 80 % of results come from 20 % of efforts. Focus on the vital few.

---

## 9. A/B Testing & Analytics

### A/B Testing (ab-test-setup)

- Hypothesis framework: "If we [change], then [metric] will [direction] because [rationale]."
- Test types: A/B, A/B/n, Multivariate (MVT), Split URL.
- Use sample size calculators before launching; don't stop tests early based on trending results.
- Metrics: Primary (one), Secondary (2–3), Guardrail (must not regress).
- Traffic allocation: 50/50 for speed; lower for risky changes.
- Analysis: wait for statistical significance (95 %+); check for segment differences; document everything.

### Analytics & Tracking (analytics-tracking)

- GA4 + GTM as standard implementation.
- Event naming: object-action format (e.g., `form_submit`, `button_click`, `page_view`).
- Essential marketing events: page_view, form_submit, cta_click, scroll_depth, video_play.
- Essential product events: signup_complete, feature_used, upgrade_started, subscription_created.
- UTM strategy: consistent source/medium/campaign naming; document in a shared convention.
- Privacy/compliance: cookie consent, GDPR, data retention policies.
- Debugging: use GA4 DebugView, GTM Preview mode; validate all events before launch.

---

## 10. Product Marketing

### Product Marketing Context (product-marketing-context)

- Create `.agents/product-marketing-context.md` as the single source of truth for all marketing skills.
- Sections: Product Overview, Target Audience, Personas, Problems & Pain Points, Competitive Landscape, Differentiation, Objections & Anti-Personas, Switching Dynamics (Push/Pull/Habit/Anxiety), Customer Language (verbatim quotes), Brand Voice, Proof Points, Goals.
- Two workflows: auto-draft from codebase (recommended) or guided interview.
- Push for verbatim customer language — exact phrases are more valuable than polished descriptions.
- All other marketing skills check for this file first before asking questions.

### Competitor & Alternatives Pages (competitor-alternatives)

- Four page formats: singular alternative ("Alternative to X"), plural alternatives ("Top X Alternatives"), you vs. competitor, competitor vs. competitor.
- SEO keywords: "[competitor] alternative", "[you] vs [competitor]", "best [category] tools".
- Centralize competitor data for reuse across pages; research process: features, pricing, reviews, positioning.

---

## 11. Design & UI/UX

### Comprehensive UI/UX (ui-ux-pro-max)

- 50+ design styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, 25 chart types.
- Rule priority: Accessibility (CRITICAL) → Touch targets (CRITICAL) → Performance (HIGH) → Style (HIGH) → Layout (HIGH) → Typography (MEDIUM) → Animation (MEDIUM) → Forms (MEDIUM) → Navigation (HIGH) → Charts (LOW).
- Search design references: `python3 skills/ui-ux-pro-max/scripts/search.py`.
- Design system generation with `--design-system` flag; Master + Overrides pattern with `--persist`.
- Pre-delivery checklists: Visual Quality, Interaction, Light/Dark Mode, Layout, Accessibility.

### UI Styling (ui-styling)

- Stack: shadcn/ui + Tailwind CSS + Radix UI primitives.
- Theme customization via CSS variables; responsive design with Tailwind breakpoints.
- Code patterns for forms, layouts, modals, accordions.
- Canvas design system for complex visual components.
- References for components, theming, accessibility, utilities, responsive, customization.

### Design System (design-system)

- Three-layer token architecture: Primitive → Semantic → Component.
- CSS variables for all tokens; strict compliance required.
- Slide system with Chart.js integration.
- Decision CSVs for strategies, layouts, typography, colors, backgrounds, copy, charts.
- Pattern breaking (Duarte Sparkline) for visual interest.

### Banner Design (banner-design)

- Multi-format system: 22 styles, social/ads/web/print.
- Workflow: gather requirements → research → design HTML/CSS → generate AI visuals → export PNG via chrome-devtools.
- Platform sizes: Facebook 820×312, Twitter 1500×500, LinkedIn 1584×396, Instagram 1080×1080, YouTube 2560×1440.
- Design rules: safe zones 70–80 %, max 2 fonts, text under 20 % for ad banners.

### Brand Identity (brand)

- Source of truth: `docs/brand-guidelines.md` → `assets/design-tokens.json/css`.
- Scripts: `inject-brand-context.cjs`, `sync-brand-to-tokens.cjs`, `validate-asset.cjs`, `extract-colors.cjs`.
- Manages brand voice, messaging, color palettes, typography, logo usage, and asset validation.

### Unified Design Routing (design)

- Routes to sub-skills: Logo, CIP, Slides, Banners, Icons, Social photos.
- Logo design: 55+ styles, Gemini AI generation.
- CIP (Corporate Identity Package): 50+ deliverables.
- Complete brand package workflow: Logo → CIP → Presentation.
- Scripts in `scripts/logo/`, `scripts/cip/`, `scripts/icon/`.

### Slides (slides)

- Strategic HTML presentations; subcommand: `create`.
- References for layout patterns, HTML templates, copywriting formulas, slide strategies.
- Integrated with the design-system token architecture and Chart.js.

---

## Cross-Skill Workflow Guidelines

- **Always check `.agents/product-marketing-context.md` first** — all marketing skills reference it for product, audience, and positioning context.
- **SEO is always the priority** — every page, every piece of content should be optimized for search.
- **After writing copy → run copy-editing** (Seven Sweeps).
- **After designing pages → run page-cro audit** (7-dimension framework).
- **After launching → set up analytics tracking** (GA4 + GTM events).
- **Before A/B testing → define hypothesis, primary metric, and sample size.**
- **For any signup/onboarding flow**: signup-flow-cro → onboarding-cro → email-sequence → paywall-upgrade-cro.
- **For landing pages**: copywriting → page-cro → form-cro → ab-test-setup → analytics-tracking.
- **For launches**: product-marketing-context → launch-strategy → email-sequence → social-content → paid-ads.

---

## 12. Product Catalog Pattern (product-catalog)

Use this standard whenever adding new products to the marketplace.

### Mandatory Architecture

- Source content (copy/images) comes from `../products/<Product Folder>/`.
- Public images must be copied to `public/products/<slug>/`.
- Product data must be registered in `src/data/products.ts` inside `products: Product[]`.
- Slug route must work automatically via `src/app/produto/[slug]/page.tsx` (`generateStaticParams` + `generateMetadata`).
- For production preview, always rebuild before start (catalog changes affect SSG pages).

### Slug and URL Rules

- Always use lowercase slugs with hyphens only (no spaces, no accents).
- Keep slug concise and descriptive, matching the product name intent.
- `id` and `slug` should be identical.
- Image paths must follow: `/products/<slug>/<index>.<ext>`.

### Required Product Object Contract

Every new item must include all fields from `Product`:

- `id`
- `slug`
- `name`
- `shortName`
- `brand`
- `category`
- `description`
- `details` (exactly 6 concise benefit-oriented bullets)
- `originalPrice`
- `promoPrice` (use `PROMO_PRICE`)
- `bulkPrice` (use `BULK_PRICE`)
- `images` (ordered array: first image is main card/SEO image)
- `imageExtension`
- `tags` (SEO-friendly, relevant, no spam)

### Pricing Rules

- Keep campaign pricing centralized: always reuse `PROMO_PRICE` and `BULK_PRICE`.
- Set `originalPrice` realistically higher than promo to preserve discount badge logic.

### SEO and Content Rules

- Product `name` must be unique and keyword-rich.
- `description` should be natural Portuguese copy, benefit-led, no keyword stuffing.
- `details` should highlight clear value and usage outcomes.
- `tags` should cover product type, brand, finish/effect, and use case.

### Image Rules

- Keep original extension (`png` or `jpeg`) and set `imageExtension` accordingly.
- Use sequential filenames (`1`, `2`, `3`...) and preserve deterministic ordering.
- Ensure first image is the best hero image (used in card and metadata).

### Creation Checklist (must pass)

1. Copy images to `public/products/<slug>/`.
2. Register product object in `src/data/products.ts`.
3. Confirm route loads at `/produto/<slug>`.
4. Confirm product card, details page, related products, and cart actions work.
5. Validate metadata/JSON-LD render from dynamic page.
6. Restart dev server (or run production preview) after catalog change.
7. Run build and ensure the new slug appears in generated SSG paths (`/produto/<slug>`).
8. Run lint/build checks before finalizing.

### Visibility Safeguards (anti “produto não aparece”)

- Never trust only data insertion; always validate visual rendering on home and slug page.
- If using `npm run start`, rebuild first (or use a start script that already runs build).
- If a product was added but not visible, verify in order:
	1) `products.ts` object syntax is valid and inside `products[]`
	2) image files exist under `public/products/<slug>/`
	3) build output lists `/produto/<slug>` in static routes
	4) server was restarted after changes

### Reusable Prompt Template

Use this prompt pattern to request product additions consistently:

"Adicione novos produtos no marketplace seguindo 100% o padrão do projeto. Analise os itens já existentes em `src/data/products.ts`, copie as imagens para `public/products/<slug>/`, gere slugs em minúsculo com hífen, e cadastre cada produto com todos os campos obrigatórios (`id`, `slug`, `name`, `shortName`, `brand`, `category`, `description`, `details` com 6 bullets, `originalPrice`, `promoPrice` usando `PROMO_PRICE`, `bulkPrice` usando `BULK_PRICE`, `images`, `imageExtension`, `tags`). No final, valide rota `/produto/<slug>`, SEO/meta/schema e me mostre resumo dos arquivos alterados."
