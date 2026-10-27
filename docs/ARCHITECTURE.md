# OpenGravity System Architecture & Protocol Spec

OpenGravity provides a seamless real-time bridge connecting **Google Antigravity** agents to live web browsers (Chrome, Edge, Brave, Vivaldi).

---

## 🏛 System Topology

```
+-------------------------------------------------------------------------+
|                              USER DESKTOP                               |
|                                                                         |
|   +-------------------+                     +-----------------------+   |
|   |  Chrome / Edge    |                     |   Google Antigravity  |   |
|   |  Browser Session  |                     |      Agent CLI        |   |
|   +---------+---------+                     +-----------+-----------+   |
|             |                                           |               |
|             | (Injected Content Script)                 | (MCP / HTTP)  |
|             v                                           v               |
|   +-------------------+                     +-----------------------+   |
|   | OpenGravity MV3   |                     | OpenGravity System    |   |
|   | Relay Extension   |                     | Prompt & Tool Client  |   |
|   +---------+---------+                     +-----------+-----------+   |
|             |                                           |               |
|             +-------------------+   +-------------------+               |
|                                 |   |                                   |
|                                 v   v                                   |
|                      +--------------------------+                       |
|                      |  OpenGravity Relay Server|                       |
|                      |  ws://127.0.0.1:9223     |                       |
|                      |  http://127.0.0.1:9224   |                       |
|                      +--------------------------+                       |
+-------------------------------------------------------------------------+
```

---

## 🔄 Message Protocol Sequence

```
Antigravity Agent           OpenGravity Server             Browser Extension             Target Web Page
      |                             |                             |                             |
      |--- browser_find_elements -->|                             |                             |
      |    ("search box")           |-- FIND_ELEMENTS command --->|                             |
      |                             |   (requestId: og_req_1)     |-- inspect DOM & bounds ---->|
      |                             |                             |<-- node targets & coords ---|
      |                             |<-- RESPONSE (success: true)-|                             |
      |<-- Array of Element IDs ----|                             |                             |
      |    [og_el_1, og_el_2]       |                             |                             |
      |                             |                             |                             |
      |--- browser_type_text ------>|                             |                             |
      |    (og_el_1, "Antigravity") |-- TYPE_TEXT command ------->|                             |
      |                             |                             |-- highlight element overlay |
      |                             |                             |-- simulate key events ----->|
      |                             |<-- RESPONSE (success: true)-|                             |
      |<-- Result Success ----------|                             |                             |
```

---

## 🔒 Security Sandbox Principles

1. **Local Loopback Only**: The OpenGravity WebSocket relay server binds strictly to `127.0.0.1` to prevent unauthorized network access.
2. **Visual Transparency Overlay**: Every automated click, scroll, and text typing action renders a prominent green visual border overlay (`.opengravity-target-highlight`) on the user's active viewport so the user remains aware of all automated operations in real-time.
3. **Explicit Extension Permission**: The Chrome extension can be toggled on/off instantly via the extension popup UI badge.
