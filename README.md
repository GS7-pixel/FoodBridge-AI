# 🌱 FoodBridge AI
### Good Food. Better Futures.

**An AI-assisted food rescue platform connecting surplus food donors with NGOs and community organizations to reduce food waste and improve access to meals.**

[Overview](#-the-problem) · [Solution](#-our-solution) · [Features](#-key-features) · [Technology](#-technology-stack) · [Setup](#-getting-started) · [AI](#-how-smart-match-works)

---

## 🌍 The Problem

Food waste and food insecurity exist side by side. Restaurants, college canteens, hostels, and event organizers may have surplus food, while community organizations need timely access to food donations.

Coordination can be difficult when donors and potential recipients lack a shared system for discovering available food, assessing quantities, arranging collection, and tracking delivery.

**The challenge:** How can technology make surplus food easier to discover, match, collect, and distribute responsibly?

## 💡 Our Solution

FoodBridge AI is a web-based food rescue platform designed to simplify the journey from surplus food to a completed donation.

The platform helps donors publish available food, enables NGO partners to discover suitable donations, and provides an organized workflow for acceptance, collection, and delivery tracking.

Its Smart Match feature evaluates donation requirements against partner capacity, proximity, urgency, and pickup availability to recommend suitable matches.

> Our mission is simple: make food rescue more coordinated, accessible, and transparent.

## ✨ Key Features

- **Food Donation Management** — Create and manage food donation listings with quantity, category, location, preparation time, and collection deadline.
- **Smart Match** — Rank potential NGO partners using donation compatibility and explain the recommendation.
- **Urgency Prioritization** — Highlight donations that need attention soon based on their collection deadlines.
- **NGO Discovery** — Browse available donations and identify suitable collection opportunities.
- **Donation Lifecycle Tracking** — Track donations through Available, Accepted, Picked Up, and Delivered states.
- **Impact Dashboard** — View donation activity, completed collections, and estimated impact metrics.
- **Responsive UI** — Provide a clean, accessible interface across desktop and mobile screens.
- **Demo Mode** — Demonstrate the workflow using clearly labelled sample organizations and sample donation records.

*Note: Feature descriptions should reflect what is actually implemented in the submitted version.*

## 🧠 How Smart Match Works

Smart Match follows a compatibility-first approach:

1. Collect donation details, including quantity, location, category, and collection deadline.
2. Evaluate available partner information, including capacity, distance, and confirmed pickup availability.
3. Rank compatible partners and prioritize time-sensitive donations.
4. Explain the factors behind each recommendation.
5. Allow the donor or authorized operator to confirm the collection arrangement.

### AI and Responsible Recommendations

FoodBridge distinguishes between algorithmic matching and generative AI.

- **Matching algorithm:** Scores and ranks candidate NGOs using defined criteria.
- **Generative AI, if enabled:** Produces a natural-language explanation based on verified donation and matching data.
- **Fallback mode:** Keeps the core workflow usable when an external AI service is unavailable.

Recommendations support human decision-making. They do not guarantee food safety, NGO availability, or successful delivery.

## 🔄 How It Works

**Step 1 — Donate**

A restaurant, canteen, hostel, or event organizer publishes details of its surplus food.

**Step 2 — Match**

FoodBridge evaluates suitable collection partners and presents ranked recommendations.

**Step 3 — Accept**

An NGO or authorized collection partner reviews and accepts an available donation.

**Step 4 — Collect**

The donor and collection partner coordinate pickup within the agreed deadline.

**Step 5 — Track Impact**

The donation status is updated, and the dashboard reflects completed activities.

## 🛠️ Technology Stack

Update this list to match the actual implementation.

| Component | Technology |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Navigation | React Router |
| Data Visualization | Recharts |
| Application Logic | TypeScript / Python, as applicable |
| Storage | Browser localStorage or configured database |
| AI Integration | Configured AI API, if implemented |
| Version Control | Git and GitHub |

## 🏗️ Architecture

The application follows a modular design:

- **Presentation layer:** Donation forms, dashboards, listings, analytics, and role-specific views.
- **Application layer:** Input validation, donation management, matching, and status transitions.
- **Data layer:** Donation records, partner profiles, and application state.
- **AI/matching layer:** Compatibility scoring and optional natural-language explanations.

The initial prototype may use local browser storage and sample data. A production deployment would require a shared backend, persistent database, access control, and verified partner records.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed.
- Git installed.
- An AI API key only if the optional AI integration is enabled.

### Installation

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd foodbridge-ai
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Environment Configuration

If your implementation uses an AI API, configure the key through a secure backend environment variable.

```env
AI_API_KEY=your_api_key_here
```

Do not commit `.env` files or expose private API keys in frontend code. The variable name above is illustrative; use the name expected by your implementation.

### Build for Production

```bash
npm run build
```

Run these commands from the project directory. Follow the actual package scripts and setup instructions in the repository if they differ.

## 📊 Impact Measurement

FoodBridge is designed to help monitor:

- Donations created and accepted.
- Meals recorded in completed donations.
- Collection and delivery completion rates.
- Time remaining before collection deadlines.
- Estimated food waste avoided, when a defensible estimation method is available.

Impact numbers must come from recorded activity or clearly identified sample data. Estimated values should never be presented as independently verified outcomes.

## 🔐 Safety, Privacy, and Responsible Use

- Collect only the information needed to coordinate donations.
- Use verified partner information in real deployments.
- Apply appropriate food-handling, storage, transport, and local food-safety requirements.
- Confirm pickup arrangements with the relevant parties.
- Do not treat AI recommendations as proof that food is safe to consume.
- Protect API credentials and personal information.
- Clearly distinguish demonstration data from real-world outcomes.

## 🧪 Testing and Validation

Before a release, validate the following:

- Donation creation and required-field validation.
- Donation filtering and discovery.
- NGO acceptance and duplicate-acceptance prevention.
- Valid donation status transitions.
- Matching results for different quantities and deadlines.
- Dashboard consistency after status changes.
- Application behavior when an AI service is unavailable.
- Responsive layout and basic accessibility.

Document the tests that have actually been run and their results.

## 🔮 Future Scope

- Verified NGO and donor accounts.
- Shared backend and database.
- Location-based matching with a mapping service.
- Notifications for urgent donations and pickup confirmations.
- Improved demand and surplus forecasting using historical data.
- Multi-language support.
- Partner verification and audit trails.
- Deployment for a pilot on a college campus.

## 🎯 Hackathon Objective

FoodBridge AI explores how intelligent matching and a simple digital workflow can improve the coordination of surplus food donations.

The prototype focuses on three priorities: a working end-to-end donation flow, transparent partner recommendations, and measurable donation activity.

## 👥 Team

**Project:** FoodBridge AI  
**Team:** [Your Team Name]  
**Contributors:** [Add verified GitHub usernames and team members]  
**Event:** [Hackathon Name]  
**Institution:** [Institution Name]

## 📄 License

[Add the license selected for this repository.]

---

**FoodBridge AI — Turning Surplus into Support.**



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
