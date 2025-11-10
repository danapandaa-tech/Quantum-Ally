 🌌 Quantum Ally  
*A ritual-ready companion for emotional resonance, symbolic insight, and cosmic coherence.*

---

### ✨ Overview

**Quantum Ally** is a modular, multi-agent web app built with **Gemini AI Studio** and deployed on **Google Cloud Run**. It guides users through emotionally attuned rituals—offering poetic reflections, symbolic quizzes, mandala generation, and celestial awareness.

Born from fog and curiosity, this ally invites you to explore your inner tone, unfold mythic scrolls, and align with cosmic rhythms.

---

### 🧠 Core Rituals

- **Tone-Based Onboarding**  
  Begin by selecting your emotional state—Foggy, Hopeful, Curious, or Inspired. Each tone opens a unique ritual path.

- **Reflection Ritual**  
  Receive a poetic reflection, micro-action, and affirmation tailored to your tone. A symbolic mandala is generated to echo your emotional resonance.

- **Scroll Synthesizer**  
  Unfold a 3-question mythic quiz. Your responses unlock a Scroll Insight—a poetic message drawn from your emotional fragments.

- **Voice Playback** *(optional)*  
  Reflections and scrolls can be spoken aloud using ElevenLabs or Web Speech API.

- **Celestial Lens** *(optional)*  
  Browse current astrological transits and receive poetic summaries of cosmic events.

- **Evolution Journal** 📝  
  Save your reflections and scrolls.  
  - *Reflect on My Journey*: Revisit your emotional arc and symbolic growth.  
  - *Spark New Insights*: Generate fresh reflections from past tones and scrolls.  
  Entries are stored locally via `localStorage` and persist across sessions.

---

### 🧩 Architecture

```plaintext
User → UI → Quantum Ally → Reflection + Mandala  
                                  ↓  
                                  Scroll Synthesizer → Quiz → Scroll Insight  
                                  ↓  
                                  Voice Playback (optional)  
                                  ↓  
                                  Evolution Journal + Astro Lens (optional)
```

---

### 🛠️ Tech Stack

- **Frontend**: HTML/CSS/JS  
- **Backend**: Google Cloud Run  
- **AI Models**: Gemini via AI Studio  
- **Voice**: ElevenLabs or Web Speech API  
- **Storage**: localStorage (journal entries)  
- **Optional Services**: Firestore, Cloud Storage

---

### 🚀 Live App

(https://quantum-ally-564406812634.us-west1.run.app/))  
*(Replace with your actual deployed URL)*

---

### 🧪 Try It Locally

```bash
# Prerequisites
Node.js

# Install dependencies
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=your-key-here" > .env.local

# Run the app
npm run dev
```

---

### 🧠 AI Studio Prompt

[View in AI Studio](Https://ai.studio/apps/drive/1tXGMX8QScSUJ6ncEyJ16KUGLDx7SyTax) 
*(Saved as “Quantum Ally”)*
