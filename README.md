# 🥬 FreshFleet — Grocery Supply Chain Management

Vercel : fresh-fleet-grocery-supply-chain-ma.vercel.app

> A fully responsive, multi-page SaaS web application for warehouse managers and retail store operators to track inventory, manage stock transfers, monitor low-stock alerts, and view supplier details.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pages](#pages)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Inventory Data](#inventory-data)
- [JavaScript Architecture](#javascript-architecture)
- [Design System](#design-system)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Tech Stack](#tech-stack)

---

## Overview

FreshFleet is a front-end grocery supply chain management platform built with pure HTML5, CSS3, and vanilla JavaScript. It simulates a real-world inventory management system with live stock alerts, inter-location stock transfers, a supplier directory, and a SaaS subscription contact page — all running entirely in the browser with `localStorage` for data persistence.

---

## Pages

| Page | File | Description |
|------|------|-------------|
| **Home** | `index.html` | Hero section, live KPI counters, low-stock ticker, feature cards, CTA banner |
| **Inventory** | `inventory.html` | Inventory table with search, filter, inline quantity update, and alert panel |
| **Transfers** | `transfers.html` | Stock transfer form with live preview, validation, and transfer log |
| **Suppliers** | `suppliers.html` | Supplier profile cards with contact info, tags, delivery schedules, and category filter |
| **Contact** | `contact.html` | Inquiry form, support details, FAQ accordion, and SaaS subscription plans |

---

## Features

- **Live Inventory Tracking** — 12 SKUs across 5 locations with real-time quantity updates
- **Smart Stock Alerts** — Colour-coded Critical / Low Stock / In Stock badges with animated indicators
- **Stock Transfer Management** — Form-based transfers with live preview and persistent transfer log
- **Supplier Directory** — 6 supplier profiles with delivery schedules and category filtering
- **SaaS Subscription Plans** — Starter ($49/mo), Professional ($149/mo), Enterprise ($399/mo)
- **Data Persistence** — Inventory and transfer log saved to `localStorage`
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Animations** — Scroll-triggered fade-ins, ticker loop, pulsing critical alerts

---

## Project Structure

```
freshfleet/
├── index.html          # Home page
├── inventory.html      # Inventory management
├── transfers.html      # Stock transfers
├── suppliers.html      # Supplier directory
├── contact.html        # Contact & subscriptions
├── style.css           # Shared stylesheet
├── script.js           # Shared JavaScript logic
├── favicon.png         # App icon
└── video.mp4           # Hero background video
```

---

## Getting Started

No build tools or dependencies required. Just open any HTML file in a browser.

```bash
# Clone or download the project
git clone https://github.com/your-username/freshfleet.git

# Open in browser
open index.html
```

Or serve locally with any static server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .
```

Then visit `http://localhost:3000`.

---

## Inventory Data

The default inventory is defined in `script.js` as `defaultInventory` — an array of 12 product objects:

```js
{
  id: 'P001',
  name: 'Organic Tomatoes',
  sku: 'VEG-0012',
  category: 'Vegetables',
  qty: 340,
  threshold: 100,
  store: 'Warehouse A',
  unit: 'kg'
}
```

**Stock status is determined by the threshold ratio:**

| Ratio | Status |
|-------|--------|
| `qty / threshold <= 0.3` | 🔴 Critical |
| `qty / threshold <= 1.0` | 🟡 Low Stock |
| `qty / threshold > 1.0` | 🟢 In Stock |

To reset all inventory to defaults, click the **Reset to Defaults** button on the Inventory page (or clear `localStorage`).

---

## JavaScript Architecture

All logic lives in a single shared `script.js` file, organized by page:

```
script.js
├── Inventory Data Store       # defaultInventory array + localStorage helpers
├── Utility Helpers            # getStockStatus(), getStatusLabel(), showToast()
├── initNav()                  # Mobile hamburger menu
├── initHomePage()             # Counter animations, ticker bar, hero stats
├── renderAlertsPanel()        # Shared alert panel renderer (used on inventory page)
├── initInventoryPage()        # Table render, search, filter, quantity update
├── initTransfersPage()        # Transfer form, live preview, log render
├── initSuppliersPage()        # Category filter
└── initContactPage()          # Form submit, plan selection, FAQ accordion
```

All `init*` functions are called on `DOMContentLoaded`. Functions gracefully no-op if their target elements are not present on the current page.

---

## Design System

Built with CSS custom properties for consistent theming:

```css
--green-dark:  #1a2e1a   /* Navigation, headings */
--green-mid:   #2d5a27   /* Buttons, section titles */
--green-light: #4a8c3f   /* Accents, progress bars */
--amber:       #e8a020   /* CTA buttons, logo accent */
--cream:       #faf6ee   /* Page background */
--red-alert:   #c0392b   /* Critical stock */
```

**Typography:** Playfair Display (headings) · DM Sans (body) · DM Mono (SKU codes)

---

## Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| `<= 1024px` | Hero visual hidden, grids collapse to 2 columns, footer stacks |
| `<= 768px` | Hamburger nav, single-column layout, alert columns stack |
| `<= 480px` | Stats bar 2-column, inventory controls stack vertically |

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Semantic structure (`header`, `nav`, `section`, `article`, `footer`) |
| CSS3 | Flexbox, CSS Grid, custom properties, keyframe animations |
| JavaScript (ES6) | DOM manipulation, event handling, localStorage |
| Bootstrap Icons v1.11.3 | UI icons throughout the application |
| Google Fonts | Playfair Display, DM Sans, DM Mono |

---

## License

This project was created as an academic case study.  
© 2026 FreshFleet Inc. All rights reserved.
