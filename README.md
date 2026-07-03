# 🌌 Phoneme Gravity

> **Africa Deep Tech Challenge Entry**  
> *An interactive 2D orbital gravity engine for real-time phonological alignment, accent calibration, and cognitive rehabilitation.*

---

## 💡 Inspiration & Vision

Speech therapy for cognitive conditions like dyslexia, dyspraxia, or accent divergence is traditionally static, repetitive, and isolating. Children with reading and speaking difficulties struggle to visualize the structural relationship between phonetic targets and their actual voice output. 

**Phoneme Gravity** revolutionizes this by combining **orbital physics** with **phonology**. By representing targeted phonemes as gravitational attractors and the user's vocal real-time attempts as dynamic orbital bodies, we create a spatial, cognitive playground. 

The core architectural mission of our master plan is **Privacy-by-Design**. By executing lightweight vector comparison and signal rendering on the client side, we bypass heavy server reliance, making cognitive rehabilitation scalable, private, and accessible even in low-bandwidth areas of Africa.

---

## 🛠️ How It Works (The Physics & ML Pipeline)

The system works by establishing an orbital arena:
1. **Target Generation**: A central sun/node represents the target word or phonological goal (e.g., `"Spectacle"`, parsed phonetically).
2. **Gravitational Fields**: Sub-phonemes generate localized gravitational fields in a 2D Canvas stage.
3. **Vocal Ingress & Force Vectors**: As the user speaks, our browser **Web Audio Pipeline** extracts audio frequencies, mapping voice triggers to kinematic velocity.
4. **Orbital Alignment**: The user's spoken phonemes are projected as orbital vectors. If the pronunciation is mathematically correct, the orbit stabilizes around the correct phoneme attractor. If an inversion occurs (e.g., `"Pestacle"` instead of `"Spectacle"`), a destabilizing gravitational force drags the node into a black-hole visual boundary, signaling a cognitive misalignment.

$$\vec{F}_g = G \frac{m_1 m_2}{r^2} \hat{r}$$

*Where $m_1$ represents the phonological accuracy score dynamically computed, and $r$ represents the structural distance between the targeted phonemic sound-wave and the user's vocal output.*

---

## ⚡ Key Features

* **Real-time Acoustic Analysis**: Zero-latency capture using custom browser `AudioContext` and dynamic waveform visualization.
* **Dual-Axis Physics Engine**: Real-time gravitational simulations built on custom HTML5 Canvas tracking orbit velocity, mass, and drag coefficients.
* **Stealth Control Layer**: Advanced viewport hotkeys (`Double Ctrl` triggers, `Ctrl+B` recovery) for swift diagnostic switching.
* **Dynamic Grounding**: Powered by advanced context alignment to parse phonetic transcripts into visual target orbits.

---

## 💻 Tech Stack

* **Framework**: React 18+ & Vite (TypeScript)
* **Animation**: `motion/react` for smooth physical transitions and UI kinetics.
* **Styling**: Tailwind CSS (Cosmic Slate Dark Theme)
* **Audio Layer**: Web Audio API (Live Audio Analyzer, spectral frequency monitors)
* **Physics**: Standard custom Verlet Integration rendering on high-frame-rate canvas.

---

## 🚀 Running Locally

Clone this repository and spin up the development engine in seconds:

```bash
# Install dependencies
npm install

# Run Vite dev server (binds on port 3000)
npm run dev
