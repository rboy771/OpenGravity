# OpenGravity Integration & System Prompt Guide

This guide details how to attach **OpenGravity System Prompt** persistently to your Antigravity sessions.

---

## 📌 Attaching System Prompt Persistently in Antigravity

To ensure that OpenGravity instructions, candidate mapping profile, and autonomous form-filling rules are attached to prompt turns:

### Option 1: Global / Workspace Customization Rule (`AGENTS.md` / `GEMINI.md`)
Create or copy the contents of `system_prompt/OPENGRAVITY_SYSTEM_PROMPT.md` into your workspace `.agents/rules/opengravity.md` or global custom instructions folder:

```bash
# Path: ~/.gemini/config/rules/opengravity.md
```

### Option 2: Antigravity CLI Launcher Flag
When starting an Antigravity CLI session, include the system prompt flag:

```bash
agy session --system-prompt "./system_prompt/OPENGRAVITY_SYSTEM_PROMPT.md"
```

---

## 🛠 Features Enforced by the System Prompt

1. **Automatic Form Mapping**: Automatically maps `first_name`, `last_name`, `email`, `phone`, `postcode`, `education`, and `work_experience` from context without intermediate questions.
2. **Bottom Action Button Selection**: Filters out top header close icons (`#close`, `Save and close`) and targets primary bottom action buttons (`Continue`, `Submit`).
3. **Embedded Iframe Support**: Inspects inside embedded application modals (`smartapply.indeed.com`).
4. **Human-in-the-Loop Pre-Submission Safety**: Presents filled details for final confirmation before pressing the final `submit-application` button.
