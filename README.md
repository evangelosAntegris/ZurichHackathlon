# 📈 DialogueIQ — Turning Client Conversations Into Growth  
### *AI-powered assistant for UBS wealth advisors*

DialogueIQ transforms unstructured client conversations into **clear, prioritized, and growth-driving advisor actions**.  
By automating admin work and surfacing the most meaningful opportunities, it helps advisors spend more time where it matters: **building stronger client relationships**.

Built for the **UBS challenge** at the **Swiss AI Weeks Hackathon 2025**.


## 🚨 Why DialogueIQ?

Wealth advisors lose hours every week to:

- Manual notes  
- CRM updates  
- Scattered insights  
- Missed opportunities hidden inside conversations  
- Lack of time for deeper client connections  

DialogueIQ solves this by analyzing conversations and showing advisors exactly **where — and how — to focus**.


## 🧠 What DialogueIQ Does

- Ingests client conversations (transcripts or notes)  
- Runs a **multi-agent AI pipeline** to extract:  
  - Action items  
  - Opportunities  
  - Follow-ups  
  - Risk signals  
  - Client concerns  
- Prioritizes tasks based on urgency, impact, and relationship relevance  
- Updates the system automatically  
- Presents a clear dashboard showing:  
  - What to do  
  - Why it matters  
  - Which client needs attention next  

**It turns conversations into growth.**

## ✨ Features

### 🔹 Multi-Agent Intelligence  
A coordinated system of AI agents handles extraction, classification, prioritization, and rationale generation.

### 🔹 Advisor-Focused Dashboard  
Frontend built with **v0 + TypeScript**, optimized for clarity and signal over noise.

### 🔹 Automated Admin  
Insights, summaries, and follow-ups are persisted in **Supabase**.

### 🔹 Instant Deployment  
Hosted on **Vercel** for low-latency demos and testing.

## 🛠 Tech Stack

- **Frontend:** v0 (AI-generated UI), TypeScript  
- **AI Engine:** Multi-agent system (OpenAI API)  
- **Database:** Supabase  
- **Hosting:** Vercel

## 🧭 Architecture Overview

```
Conversation Transcript
          ↓
  Multi-Agent AI Pipeline
  (Extraction → Classification → Prioritization)
          ↓
   Supabase (Clients, Insights, Actions)
          ↓
      v0/TypeScript Dashboard
          ↓
 Advisor sees top priorities instantly
```

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/dialogueiq
cd dialogueiq
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Create a `.env` file:

```
OPENAI_API_KEY=<your-key>
SUPABASE_URL=<your-url>
SUPABASE_KEY=<your-key>
```

### 4. Run the dev server
```bash
npm run dev
```
