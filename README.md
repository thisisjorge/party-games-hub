# Party Games Hub & Jungle Gap

A zero-backend, browser-native multiplayer arcade and deterministic League of Legends tactical trainer, powered by PeerJS WebRTC peer-to-peer networking.

---

## Overview

Party Games Hub is a collection of 7 real-time multiplayer party games and a tactical decision trainer (**Jungle Gap**) running entirely client-side. The architecture requires no dedicated game server: state synchronization, matchmaking, and clock coordination run directly over WebRTC data channels with host-authoritative logic.

```
                  ┌──────────────────────────────┐
                  │    Host Peer (Authoritative)  │
                  │  State Machine & Game Loop   │
                  └──────────────┬───────────────┘
                                 │
                 WebRTC P2P DataChannels (PeerJS)
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Peer A  │     │  Client Peer B  │     │  Client Peer C  │
│  (Sanitized VM) │     │  (Sanitized VM) │     │  (Sanitized VM) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Architecture & Technical Highlights

### 1. Peer-to-Peer Networking (WebRTC / PeerJS)
- **Host-Authoritative State**: The player who creates the room serves as the authoritative host node, executing round timers, score aggregation, and state transitions.
- **5-Character Room Codes**: Cryptographic human-friendly codes generated with collision retry logic (`createHost(code, playerInfo, attempt)`).
- **Message Deduplication**: Sliding-window Set cache (`seenIds`, cap 800 entries with LRU eviction of 200) ensuring idempotent packet delivery over unreliable network conditions.
- **Clock & Latency Synchronization**: Periodic heartbeat synchronization (`Rooms.broadcastFullSync()` every 10s) and ping/pong round-trip measurements to calculate client time offsets for synchronized round countdowns.
- **Reconnection Tolerance**: Automatic peer re-handshake on transient signaling disconnects with session persistence (`PGHStorage.saveSession`) and state rehydration.
- **Realtime Chat & Reactions**: Floating emoji reactions and room chat with anti-spam throttling and audio cue triggering.

### 2. Zero-Login Client Persistence
- **Zero-Login Architecture**: No authentication server or database required.
- **Local Player Profile**: Persistent identity stored in browser `localStorage`, including handle, customized retro avatar, XP, level progression, cosmetics, and virtual tokens.
- **Achievements & Streaks**: Local achievement engine (`js/achievements.js`) tracking 15+ game milestones with token grants, fanfare audio, and confetti effects.
- **Daily Challenges**: Deterministic daily missions (`js/daily.js`) seeded by calendar day for solo and group replayability.

### 3. Game Suite (2–12 Players)
| Game | Capacity | Description |
| --- | --- | --- |
| **Fake Answer** | 3–12 players | Bluffing trivia game where players invent convincing lies to fool opponents. |
| **Reflex Rush** | 2–12 players | High-speed reaction minigames testing spatial, audio, and visual timing. |
| **WordBomb** | 2–12 players | Fast-paced syllable bomb-passing game validated against a 310,000+ word dictionary. |
| **STOP! (Adedonha)** | 2–8 players | Classical letter category sprint with host-validated rounds. |
| **Termo Co-op** | 2–12 players | Real-time Brazilian word-guessing race with simultaneous letter feedback. |
| **Riftle** | 2–12 players | Wordle-inspired League of Legends champion attribute deduction game. |
| **Jungle Gap (Co-op)** | 2–12 players | Multiplayer tactical triage where players evaluate Summoner's Rift map states. |
| **Jungle Gap (Solo)** | 1 player | Daily 5-scenario challenge and unlimited tactical practice mode. |

---

## Jungle Gap: Tactical Spatial Model

Jungle Gap is a tactical decision simulator modeling macro-game states on Summoner's Rift.

```
   Canonical Scenario State (Hidden Knowledge, True Enemy Coordinates)
                               │
                [ Network Sanitization Boundary ]
                     publicState() Projection
                               │
                               ▼
   Sanitized Client ViewModel (Fog of War: "LAST_SEEN" / "MISSING" Only)
                               │
               Lane Wave Geometry Engine (t ∈ [0, 1])
                               │
                               ▼
                Interactive SVG Map & Evaluation
```

### Key Engineering Pillars
- **Deterministic Scenarios**: 52 production scenarios (`jg-01` to `jg-52`) encoding real competitive match states, wave formations, and objective timers.
- **Parametric Lane Geometry**: Wave positions modeled along continuous normalized curves ($t \in [0, 1]$) with explicit physical landmark anchors (crashed, frozen, slow-pushing).
- **Structure State Constraints**: Exact turret tier progression, plates remaining, and destroyed tower fallback offsets.
- **Fog-of-War Sanitization (`publicState`)**: At the network/view boundary, hidden enemy coordinates are strictly stripped. Clients receive only coarse visibility states (`MISSING`, `LAST_SEEN`, `UNKNOWN`), preventing client-side inspection or network snooping.
- **Daily Challenge Engine**: Daily 5-round gauntlet deterministically seeded by date (`YYYY-MM-DD`), resetting globally at midnight with client-side score verification.

---

## Verification & Automated Testing

The repository features comprehensive regression test suites running via Node.js and Playwright:

```bash
npm test
```

### Test Coverage Results
- **Jungle Gap Regression** (`tests/jungle-regression.cjs`):
  - **52 / 52 Production Scenarios Verified** (`jg-01` through `jg-52`: 100% PASS)
  - **9,835 Automated Invariant Checks** across wave formations, objective timers, champion coordinates, and structure states.
  - **10 Fixtures**, **45 Wave Absence Cases**, **21 Special Tactical States**.
- **Hub Regression** (`tests/hub-regression.cjs`):
  - **192 Automated System Checks** covering game definitions, secret catalogs, and champion databases.
  - **WordBomb Lexicon**: 310,710 validated Portuguese words loaded in under 1ms.
- **Optional Browser & Integration Tests**:
  - `npm run test:browser` — Playwright headless browser navigation and rendering checks.
  - `npm run test:multiplayer` — Live 3-peer WebRTC connection and synchronization test.
  - `npm run test:responsive` — Viewport layout checks across mobile and desktop breakpoints.

---

## Local Setup

### Prerequisites
- Node.js 20+ (Node.js 22+ recommended)

### Running Locally
```bash
# 1. Install dev dependencies
npm install

# 2. Start the local server
npm start
```
The game will be available at:
- **Party Games Hub**: `http://127.0.0.1:8080/index.html`
- **Jungle Gap Solo**: `http://127.0.0.1:8080/jungle.html`

### Building for Production
```bash
npm run build
```
Builds optimized standalone bundles into `dist/hub` and `dist/jungle` with SHA-256 asset manifests.

---

## Third-Party Components & Licenses

| Component | Purpose | Origin | License |
| --- | --- | --- | --- |
| **PeerJS 1.5.4** | WebRTC P2P Data Networking | [PeerJS](https://github.com/peers/peerjs) | MIT |
| **Lucide Icons** | SVG UI Icons | [Lucide](https://github.com/lucide-icons/lucide) | ISC |
| **Palavras PT-BR** | WordBomb Lexicon (310k words) | [pythonprobr/palavras](https://github.com/pythonprobr/palavras) | MPL-2.0 |
| **Google Fonts** | Retro/Arcade Typography | Press Start 2P, Chakra Petch, Share Tech Mono, Space Grotesk | SIL OFL 1.1 |

---

## Legal & Intellectual Property Disclaimer

*Jungle Gap isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.*

- League of Legends champion names, portraits, and icons are the intellectual property of Riot Games, Inc.
- Champion portraits are locally bundled 120x120 assets sourced from Riot Data Dragon 15.1.1 under Riot Games' *Legal Jibber-Jabber* policy.
- No remote calls to Riot Games API or dynamic Data Dragon endpoints are made during runtime.
