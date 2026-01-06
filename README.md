**Habit Tracker PWA**

A minimal, offline-first habit tracker designed to help users build consistency without pressure.
The app focuses on daily execution, goal-based habits, and streaks, presented through a calm, Notion-inspired interface.

✨ Features

  Goal-based habit organization
  Daily tracker showing only today’s tasks
  Streak system based on completed scheduled days

  Two calendar views:
    Habit × Date matrix
    Overview calendar summary

  Centralized task editing via Goals
  First-time onboarding hints (non-intrusive)
  Offline-first Progressive Web App (PWA)
  Google authentication with user-scoped data
  Minimal, distraction-free UI

🧠 Product Philosophy

  Calm over gamification – no aggressive rewards or guilt-driven UX
  Derived state over stored state – streaks and insights are computed, not persisted
  Offline-first – the app should remain usable without connectivity
  Clarity over complexity – editing, tracking, and reviewing are clearly separated

🛠️ Tech Stack

  Frontend
    React (Vite)
    Custom CSS (design system, no UI framework)

  Backend / Platform
    Firebase Authentication (Google Sign-In)
    Cloud Firestore (user-scoped data model)
    Firebase Hosting

  PWA & Offline
    Service Worker (app shell caching)
    Firestore IndexedDB persistence
