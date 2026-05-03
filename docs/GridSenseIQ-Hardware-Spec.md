# GridSenseIQ — Hardware Architecture & BOM

> Companion to the GridSenseIQ Web App. Reference document for slide deck, pitch video, and any future build phase. All component pricing reflects Malaysian retail (Cytron, Myduino, Shopee MY, Lazada MY) as of April 2026.

---

## 1. Architecture Overview

GridSenseIQ uses a **four-layer hardware-software stack**:

```
LAYER 1 — Physical Sensing      (smart plugs, energy meters, environmental sensors)
LAYER 2 — Local Gateway         (ESP32 microcontroller, edge aggregation)
LAYER 3 — Cloud + AI            (MQTT broker, time-series DB, recommendation engine)
LAYER 4 — Enforcement           (relays, smart switches, industrial contactors)
```

**Data flow:**
`Sensors → Gateway (ESP32) → MQTT/TLS → Cloud → AI Engine → User App → Approved Command → Hardware Cutoff`

The full schematic is in `GridSenseIQ-Hardware-Schematic.svg` — drop it into your slides at any size.

---

## 2. Layer 1 — Physical Sensing

### 2.1 Smart Plug (Sonoff S26 / Tuya)

The starting point for every Residential and Commercial deployment. Plug a device into it, plug the smart plug into the wall — that device is now monitored and remotely controllable.

- **Operating range:** 230VAC, 16A max load (~3,600W)
- **Communication:** WiFi 2.4GHz → MQTT (or Tuya Cloud)
- **Reports:** Active power (W), cumulative energy (kWh), on/off state, every 10 seconds
- **Sample use:** Air-conditioner, kettle, fridge, water heater
- **Why this part:** Zero-install, plug-and-play, cheap, widely available in Malaysia
- **Price:** RM 35–55 each on Shopee MY

### 2.2 Circuit-level Energy Meter (PZEM-004T V3)

For whole-circuit measurement — the entire kitchen, lighting circuit, or HVAC line — instead of per-device.

- **Operating range:** 80–260VAC, up to 100A via included split-core CT clamp
- **Measures:** Voltage, current, active power, power factor, frequency, cumulative energy
- **Communication:** TTL/Modbus-RTU via UART → ESP32
- **Accuracy class:** 1.0 (industrial-grade)
- **Why this part:** The de-facto module for DIY energy monitoring; works with the standard `PZEM004Tv30` Arduino library
- **Price:** RM 60–90 with open CT clamp (Cytron MY, Myduino, Shopee)

### 2.3 Temperature/Humidity (DHT22 / AM2302)

Drives HVAC efficiency calculations and informs the comfort-vs-cost dashboard for the Commercial tier.

- **Range:** -40 to 80°C, 0–100% RH
- **Accuracy:** ±0.5°C, ±2% RH
- **Sample rate:** 0.5 Hz (every 2 seconds)
- **Interface:** OneWire to ESP32
- **Price:** RM 12–18

### 2.4 PIR Motion Sensor (HC-SR501)

Drives zone occupancy — central to the room/zone heatmap on the dashboard.

- **Detection:** 7m range, 110° cone
- **Output:** Digital high/low to ESP32 GPIO
- **Adjustable:** Sensitivity and hold-time potentiometers
- **Price:** RM 5–10

---

## 3. Layer 2 — Local Gateway

### 3.1 ESP32-WROOM-32 (the brain)

Single ESP32 board acts as the local aggregator: polls all sensors, buffers readings, runs basic edge anomaly detection, and forwards to the cloud over MQTT.

**Specs:**
- Dual-core Xtensa LX6 @ 240 MHz
- 520 KB SRAM, 4 MB flash
- WiFi 802.11 b/g/n + Bluetooth 4.2 LE
- 38 GPIO pins, ADC, I²C, SPI, UART
- Programmable via Arduino IDE / PlatformIO / ESP-IDF
- **Price:** RM 20–30 (Cytron MY)

**Firmware responsibilities (written in C++ via PlatformIO):**

1. **Modbus-RTU master** polling PZEM-004T every 1 second
2. **OneWire driver** reading DHT22 every 2 seconds
3. **GPIO interrupt handler** for PIR motion events
4. **Local 60-second aggregation buffer** — averages, peaks, totals
5. **MQTT publisher** with TLS over WiFi to the cloud broker
6. **Edge anomaly detection** — z-score against rolling baseline
7. **OTA firmware update** receiver
8. **Local relay control** (the "act" layer) when commands arrive
9. **Watchdog timer** with fail-safe shutdown if comms drop

### 3.2 Power Supply

- 5V/2A USB-C adapter, regulated down to 3.3V on-board
- ~RM 15–25

### 3.3 Enclosure

- Plastic project box (IP54 for indoor commercial environments)
- DIN-rail mountable for industrial deployments
- ~RM 25–60 depending on size

---

## 4. Layer 3 — Cloud + AI

This layer is software running on cloud infrastructure (no physical hardware to buy on the customer side, but listed here so judges see the full picture).

| Component | Role | Tech |
|---|---|---|
| **MQTT Broker** | TLS-encrypted ingest from gateways | Mosquitto / HiveMQ Cloud |
| **Time-series DB** | 1-second granularity, downsampled hourly/daily/monthly. 90-day raw retention, 5-year aggregates | InfluxDB |
| **AI Engine** | Anomaly detection, recommendation ranking, AI Twin scenario simulation | Python + FastAPI + scikit-learn |
| **App backend** | Dashboard data API, approval workflow, audit log | Node.js (or Python) REST + WebSocket |

---

## 5. Layer 4 — Enforcement & Actuation

Where insight becomes action. Software recommends → user approves → hardware actually cuts the load.

### 5.1 4-Channel Relay Module
- 5V trigger, 250VAC/10A per channel
- Optoisolated for safe ESP32 GPIO triggering
- Toggles lighting, AC, signage, equipment
- **RM 18–30**

### 5.2 Sonoff Smart Wall Switch (1/2/3-gang)
- Replaces existing wall switches; 230VAC/10A
- WiFi-direct or via gateway
- **RM 50–90 each**

### 5.3 Industrial Contactor (Industry tier only)
- Schneider Electric LC1D series, 32A–100A
- Coil-driven by ESP32 + relay
- Hard cutoff for HVAC, compressors, production-zone power
- **RM 180–450 per zone**

### 5.4 The User App (this prototype)
- React + Vite web app
- Live dashboard, floor plan heatmap, AI Twin scenarios, ROI calculator, approval workflow

---

## 6. Bill of Materials by Tier

### Residential — total ≈ **RM 200–350**

| Item | Qty | Unit price (RM) | Subtotal |
|---|---|---|---|
| Sonoff smart plug | 2–3 | 35–55 | 70–165 |
| ESP32-WROOM-32 dev board | 1 | 20–30 | 20–30 |
| DHT22 temperature/humidity | 1 | 12–18 | 12–18 |
| PIR motion sensor (HC-SR501) | 1–2 | 5–10 | 5–20 |
| 5V/2A USB-C power supply | 1 | 15–25 | 15–25 |
| Plastic enclosure | 1 | 25–35 | 25–35 |
| Cabling, header pins, misc. | – | – | 30–50 |

**Use case:** Single-home deployment monitoring AC + water heater + key plug loads, plus 2 motion-sensed zones.

---

### Commercial (SME / café / clinic) — total ≈ **RM 800–1,500**

| Item | Qty | Unit price (RM) | Subtotal |
|---|---|---|---|
| PZEM-004T V3 with CT clamp | 1 | 60–90 | 60–90 |
| Sonoff smart plug | 4 | 35–55 | 140–220 |
| ESP32-WROOM-32 (gateway) | 1 | 20–30 | 20–30 |
| 4-channel relay module | 1 | 18–30 | 18–30 |
| Sonoff smart wall switch (2-gang) | 2 | 50–90 | 100–180 |
| DHT22 sensors | 2 | 12–18 | 24–36 |
| PIR motion sensors | 3 | 5–10 | 15–30 |
| Power supplies + enclosure | – | – | 60–120 |
| Cabling + installation supplies | – | – | 80–150 |
| Electrician install (half-day) | 1 | 250–500 | 250–500 |

**Use case:** Café with 1 main panel meter, 4 plug-monitored appliances, automated closing-time lighting + signage shutdown.

---

### Industry (factory / warehouse / facility) — total ≈ **RM 3,500–8,000+**

| Item | Qty | Unit price (RM) | Subtotal |
|---|---|---|---|
| PZEM-004T V3 panel meters | 3–6 | 60–90 | 180–540 |
| ESP32-WROOM-32 gateways (redundant) | 2 | 20–30 | 40–60 |
| Schneider LC1D contactors (32A) | 4–8 | 180–300 | 720–2,400 |
| Schneider LC1D contactors (100A for HVAC) | 1–2 | 350–450 | 350–900 |
| 8-channel relay modules | 2 | 35–60 | 70–120 |
| DHT22 zone sensors | 6–10 | 12–18 | 72–180 |
| PIR motion sensors | 8–12 | 5–10 | 40–120 |
| DIN-rail industrial enclosure | 1 | 200–400 | 200–400 |
| 24V industrial power supply | 1 | 80–150 | 80–150 |
| Ethernet backhaul (gateway → router) | – | – | 50–100 |
| Cabling, conduit, terminals | – | – | 300–600 |
| Licensed electrician install (1–2 days) | 1 | 1,200–2,500 | 1,200–2,500 |

**Use case:** Multi-zone factory with HVAC enforcement, after-hours compressor lockout, production-line monitoring, AI Twin–driven optimization.

---

## 7. Where to Source in Malaysia

Verified Malaysian distributors (used for the pricing above):

- **Cytron Technologies** — `my.cytron.io` — ESP32, sensors, relays. Local stock, fast delivery, official documentation.
- **Myduino** — `myduino.com` — ESP32 dev boards and starter kits
- **Shopee Malaysia** — broad selection of PZEM-004T, Sonoff, generic sensors
- **Lazada Malaysia** — Sonoff smart switches and plugs
- **Industrial-grade contactors:** RS Components Malaysia, Element14, local Schneider distributors

---

## 8. What Makes This Buildable, Not Just a Concept

A few specific decisions that make this a real, deployable system rather than a slideware idea:

1. **Off-the-shelf parts only.** No custom PCBs, no exotic components. Every part on the BOM is in stock at multiple Malaysian retailers right now.
2. **Open protocols.** MQTT, Modbus-RTU, WiFi — all widely supported. No vendor lock-in.
3. **Tier-aligned cost structure.** Residential cost scales with home size, Commercial with operating-hours value, Industry with safety-cutoff requirements.
4. **Retrofit-friendly.** Smart plugs require zero install. Smart switches replace existing wall switches in 15 minutes per gang. Only Industry-tier work needs an electrician.
5. **Fail-safe by design.** ESP32 watchdog ensures relays revert to a safe state on comms failure. Approval-gated automation means no autonomous high-risk shutdowns without human sign-off.

---

## 9. Talking Points for the Pitch

If a judge asks **"how do you know this works?"**, point to:

- The PZEM-004T + ESP32 stack is documented in thousands of Instructables / GitHub projects since 2018
- Sonoff devices ship with Tasmota-compatible firmware out of the box — direct MQTT, no cloud dependency
- Schneider contactors are the industrial standard in Malaysian factories already

If a judge asks **"what's stopping you from rolling this out tomorrow?"**, the honest answer is:

- The web app is a prototype (this codebase). Production hardening takes ~2 months.
- Cloud infrastructure setup (MQTT broker, time-series DB, AI engine) ~1 month.
- First pilot install (electrician + 1 facility) ~1 week.
- TNB doesn't currently expose a real-time API — we'd start by reading meter pulses or installing our own panel meter, with TNB integration later.

---

## 10. Files in this Folder

- `GridSenseIQ-Hardware-Schematic.svg` — full architecture diagram, drag-and-drop into PowerPoint or Keynote at any size
- `GridSenseIQ-Hardware-Spec.md` — this document
