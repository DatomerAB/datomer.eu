<p align="center">
  <img src="/get-started/par-banner.webp" alt="Pär — Your AI. Your device. Your data." width="100%" style="border-radius: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.35);" />
</p>

# <img src="/get-started/par-logo.webp" alt="Pär logo" width="40" height="40" style="border-radius: 10px; vertical-align: middle; margin-right: 6px;" />Pär

**Your AI. Your device. Your data.**

Pär runs locally on your device, without a central Pär server for your conversations or personal context. You choose whether to use web search or connected services, which may send information to their providers.

You'll be chatting in about **10 minutes** — most of that is just waiting for a download.

---

## What can you do with Pär?

Ask questions, explore ideas and draft replies with local AI. Features depend on your plan, setup and version; conversation history between sessions requires Plus or higher. Here is a guide to the app:

Financial-assessment and confidential contract-review workflows are in development, not dependable features of the current beta. You review the results and decide what happens next.

### 1. 💬 Chat — More than just conversation
- **Pin your favorite answers & chats** — Star important replies or pin entire conversations to the top of your list so you never lose them.
- **Switch speaking tones** — Match your mood or goal with one click: pick *Friendly*, *Professional*, *Concise*, *Persuasive*, or *Executive*.
- **Live web search** — Choose web search when you need current information. Search requests go to external providers. Local chat can work offline after setup; web search and connected services need an internet connection.
- **Attach documents & notes** — Drag in notes or PDFs and ask questions directly about what is inside them.
- **Smart memory** — Pär remembers your name, goals, and style across sessions, so you don't have to explain yourself every time.

<p align="center">
  <img src="/get-started/chat-screen.webp" alt="Pär Chat Interface with Tone Selection and Pinned Chats" width="100%" style="border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</p>

### 2. ⚡ Act — Automate your day
- **Run handy routines** — Turn rough meeting notes into action items, draft executive summaries, or get a daily briefing with a single click.
- **Turn ideas into tasks** — Whenever a routine spots things you need to do, it can automatically create to-dos for you.
- **Personal personas** — Teach Pär different roles (like *Writing Coach*, *Tech Advisor*, or *Study Buddy*) that tailor how it helps you.

<p align="center">
  <img src="/get-started/act-screen.webp" alt="Pär Act Screen — Routines and Automation" width="100%" style="border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</p>

### 3. 📝 Tasks — Keep yourself organized
- **Capture to-dos right from your chat** — Save action items that come up in your conversations directly into your task list.
- **Simple, clean tracking** — Organize tasks by High, Medium, or Low priority, check them off as you finish, and see what is due today or tomorrow.
- **Export anytime** — Export your to-do lists whenever you want to share them or take them elsewhere.

<p align="center">
  <img src="/get-started/tasks-screen.webp" alt="Pär Tasks Screen — Action Items and To-Dos" width="100%" style="border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</p>

### 4. 🔗 Integrations — Choose which tools to connect
- **Bring your world together** — Connect popular tools like Google Calendar, Gmail, Notion, Todoist, and more.
- **Connect on your terms** — Review each service’s permissions before connecting it. Requests and information needed to use that service may be sent to its provider.
- **Context-aware help** — Ask questions like *"What do I have scheduled today?"* or *"Summarize my recent unread emails"* without jumping between ten different apps.

---

## Before you start

**On a Mac**

| You need | Why |
|---|---|
| A Mac with Apple Silicon (M1, M2, M3, M4…) | Pär uses your Mac's chip to think |
| macOS 11 (Big Sur) or newer | Click  → *About This Mac* to check |
| ~10 GB free disk space | For the app and your AI model |
| Internet access for setup and online features | Local chat can work offline once the app and a model are installed |

> **Not sure which Mac you have?** Click the Apple logo  → *About This Mac*. If it says "Apple M1/M2/M3/M4", you're good.

**On Windows** — *beta*

| You need | Why |
|---|---|
| A 64-bit PC running Windows 10 (21H2) or Windows 11 | Pär uses your PC's processor to think |
| Microsoft Visual C++ 2015–2022 Redistributable (64-bit) | Needed by the part of Pär that runs your AI model. It's a free download from Microsoft |
| ~10 GB free disk space | For the app and your AI model |
| Internet access for setup and online features | Local chat can work offline once the app and a model are installed |

> **Windows support is in beta.** Expect a few extra security prompts the first time you install and launch Pär — the steps below walk you through each one.

---

## 1. Install — 1 minute

### On a Mac

1. **Double-click** the downloaded `.dmg` file. (A `.dmg` is Apple's standard disk image format).
2. A window opens showing the **Pär icon** and your **Applications folder**:

<p align="center">
  <img src="/get-started/par-logo.webp" alt="Pär App Icon" width="80" height="80" style="border-radius: 18px; vertical-align: middle; margin-right: 14px;" />
  <span style="font-size: 28px; vertical-align: middle; color: #888;">➔</span>
  <span style="font-size: 32px; vertical-align: middle; margin-left: 14px;">📁 <b>Applications</b></span>
</p>

3. **Drag Pär onto the Applications folder** ➔ that's the whole installation!
4. Close the window and **eject** the disk image (click ⏏ next to "Pär" in Finder's sidebar)

> **First time opening?** macOS may ask *"Pär is an app downloaded from the Internet. Are you sure you want to open it?"*
> Click **Open**. This is normal — Pär is signed and verified by Apple.

### On Windows — *beta*

1. **Unblock the download first.** Right-click the file you downloaded → **Properties** → tick **Unblock** at the bottom → **OK**. Skip this and Windows carries its "downloaded from the internet" mark into everything you unpack from it.
2. If the download is a `.zip`, **extract it**, then run the Pär installer inside.
3. **"Windows protected your PC"?** Click **More info** → **Run anyway**.
   *You see this because the Windows beta installer isn't code-signed yet. The macOS build already is, and Windows signing is on its way.*
4. Follow the installer, then launch **Pär** from the Start menu.
5. **Allow the Windows Firewall prompt** on first launch. **Private networks** is enough — you only need **Public networks** if you plan to use Pär Home Hub from your phone.

> **The first launch is slow — that's expected.** Pär unpacks its AI engine and Windows Defender scans it, which can take a few minutes. A small console window may appear and disappear. Give it a moment before deciding something is wrong.

> **If Windows Defender removes part of Pär**, open **Windows Security** → *Virus & threat protection* → *Manage settings* → *Exclusions* → **Add an exclusion** → **Folder**, pick the folder Pär was installed into, then install again. Antivirus tools sometimes flag self-unpacking apps like Pär's AI engine by mistake.

---

## 2. Meet Pär — 2 minutes

Open **Pär** — from **Launchpad** or your Applications folder on a Mac, or from the **Start menu** on Windows. A short setup walks you through four quick steps:

<p align="center">
  <img src="/get-started/welcome-screen.webp" alt="Welcome to Pär Setup Screen" width="65%" style="border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</p>

**1 · Welcome**
Pär uses local AI models and an encrypted local vault. Optional online services have their own permissions and privacy policies. Click **Continue →**

**2 · Tell Pär about you**
Your name, language, country, and — optionally — what you're working toward.
*This helps Pär tailor answers to you. Your profile is saved locally. Review what you share when using connected services.* Click **Continue →**

**3 · Choose your AI model** ← *the important one, see below*

**4 · You're all set**
Click **Start using Pär →** and you're in.

---

## 3. Download your brain 🧠 — 5–15 minutes

An **AI model** is the part that actually thinks. It's a single big file you download **once** and keep forever.

### Option A: During first-time setup (Easiest)
On **Step 3 (Choose your AI model)** of the welcome wizard, Pär pre-selects the best fit for your hardware. Click:

> ### **`Download recommended model`**

While it downloads, Pär shows you a short interactive tour of what it can do. ☕️

---

### Option B: From the Models page (Any time)
You can explore, download, and switch models whenever you want:

1. Click **Profile** (bottom-left corner of the sidebar)
2. In the popup menu, click **⬡ Models**
3. You'll see the full model catalog with recommendations tailored to your computer's RAM and disk:

<p align="center">
  <img src="/get-started/models-screen.webp" alt="Pär Models Catalog Screen" width="100%" style="border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</p>

4. Find the model with the blue **`Download`** button (e.g. **Qwen 7B** or **Qwen 14B**) and click it.
5. Once downloaded, the badge turns green with **✓ Ready**.

**Available model sizes:**

| Model | Size | Best for | Your computer needs |
|---|---|---|---|
| **Tiny / Compact** (e.g. Qwen 3B) | ~2.0 GB | Fast, lightweight answers | 4 GB+ RAM |
| **Standard** ★ (e.g. Qwen 7B) | ~5.1 GB | Best balance — writing & research | 8 GB+ RAM |
| **Performance** (e.g. Qwen 14B) | ~9.4 GB | Deep reasoning, complex tasks | 16 GB+ RAM |
| **Coder** (e.g. Qwen Coder 7B) | ~4.4 GB | Coding, SQL, scripts | 8 GB+ RAM |

> **Download speed depends on your Wi-Fi, not your computer.** On typical broadband expect 3–10 minutes. You can keep using your computer while it downloads.
>
> **Already have Ollama?** Click the **Ollama** tab next to **GGUF (local)** to use models you've already pulled.

---

## 4. Say hello 👋

Type in the box at the bottom and press **Enter**.

Try one of these:
- *"Help me write a polite email declining a meeting."*
- *"Explain compound interest like I'm twelve."*
- *"What should I ask when buying a used car?"*

> 💡 **Helpful tips:**
> - Press `Enter` to send, or `Shift + Enter` for a new line.
> - Press `⌘K` to open the quick actions palette.
> - Switch tone anytime using the tone selector pill (*Friendly*, *Professional*, *Concise*, *Persuasive*, *Executive*) right next to the input box.

**Pull the plug on your Wi-Fi and try again.** It still works. That's the whole point. ✈️

---

## Got a license key?

If you received a license key or invitation code (a long line of letters and numbers), unlock the extras:

**Menu ☰ → License → paste your key → Activate**

You'll see *"Activated — welcome to Pär…"* and your new badge appears instantly. No account, no login, no email needed.

---

## How Pär works: Private Mode & Home Hub

Pär was designed from day one with a simple principle: **your data stays yours**.

### 1. Private Mode (On Your Computer)
Pär’s local AI models run on your computer. Saved conversations and personal context are stored in an encrypted local vault, not on a central Pär server. Local chat can work offline after setup. If you choose web search or connected services, information needed for those requests may be sent to their providers. Review permissions before sharing confidential information.

![Pär Private Mode Architecture](/get-started/par-private-mode.svg)

### 2. Home Hub Mode (On Your Phone or Tablet)
When you turn on **Home Hub**, your computer runs Pär for your paired devices at home. Your phone or tablet connects directly to it over your local home Wi-Fi network using a single-use 6-digit PIN or QR code.
- **Your computer does all the heavy thinking:** The AI models never leave it.
- **Your phone connects to your computer:** Home Hub uses your local network rather than a central Pär server. Optional web search and connected services can still send information to their providers.
- **Family privacy:** In Pär Pro, each family member gets their own private conversation history and memory that others cannot see.

![Pär Home Hub Architecture](/get-started/par-home-hub-mode.svg)

---

## 5. Pär Home Hub — Connect your phone or tablet 📱

With Pär Plus, you can pair **1 companion device** (like your phone) to your computer. With Pär Pro, your computer becomes a full **Family Home Hub** supporting up to **10 paired devices** and **10 household member profiles** with separate, private conversation histories.

### Step 1: Turn on Home Hub on your computer
1. Open **Profile** (click your profile card at the bottom of the sidebar → **Profile** → select the **Home Hub** tab).
2. Click **Enable Hub** (it will turn green: **Hub Active 🟢**).
3. Under **Pair New Device**, choose the household member who will use the device, then click **Generate PIN**. A 6-digit PIN will appear on screen. The PIN connects that device only to the selected member's private profile.

### Step 2: Connect from your mobile device
1. Connect your phone or tablet to the same home Wi-Fi as the computer running Pär.
2. **Scan the QR code** shown on that computer's screen with your phone camera, or open Safari/Chrome and type the address shown in Home Hub:
   ```text
   http://<your-computer-ip>:7433/pair
   ```
  *(e.g. `http://192.168.1.50:7433/pair` as displayed in the Home Hub tab). If Home Hub shows a **Secure HTTPS Address**, use that address instead.)*
   > **Note for Android / Chrome users**: Always use the **QR code** or **Direct IP**. Android and Chrome do not support `.local` mDNS hostnames (such as `par.local`) and will return `DNS_PROBE_FINISHED_NXDOMAIN`.
3. Enter the 6-digit PIN and tap **Connect Device**.

Once paired, the device remains connected until you disconnect it from the Home Hub on your computer. You do not need to enter the PIN each time.

### Dictation and microphone access

- On a Mac with the Pär desktop app, select the microphone beside the message box and allow the macOS permission prompt the first time you use it. Dictation must also be enabled in macOS Settings.
- In a companion browser, allow microphone access when prompted. Browser dictation requires the **Secure HTTPS Address** shown in Home Hub.
- On iPhone and iPad, use the microphone on the iOS keyboard to dictate into the message field. Mobile Safari cannot start the system keyboard dictation control from a web page.

### Step 3: Install as an App
- **iPhone (Safari)**: Tap the Share button (square with arrow pointing up) → tap **Add to Home Screen**.
- **Android (Chrome)**: Tap the three dots menu ⋮ → tap **Install app** or **Add to Home screen**.

Pär opens full-screen on your phone or tablet. Your paired computer runs the local AI models and holds the encrypted vault.

---

## Where your stuff lives

Pär’s local vault is stored in a hidden folder on your computer:

- **Mac**: `~/.peer/`
- **Windows**: `%USERPROFILE%\.peer\`

Pär does not upload this vault to a central Pär server. If you choose web search, connected services or exports, information you share may leave your device. Review the destination, permissions and privacy policy first. Encryption helps protect stored information; keep your device and backups protected too.

---

## If something feels stuck

| What you see | What to do |
|---|---|
| Download seems frozen | Check your Wi-Fi, then wait — big files pause and resume |
| "Pär can't be opened" (Mac) | Right-click the app → **Open** → **Open** |
| "Windows protected your PC" | Click **More info** → **Run anyway** |
| Answers are slow | Go to **Models** and switch to a smaller model |
| Blank screen on launch | Quit Pär completely (⌘Q on Mac) and reopen |
| Setup can't save your profile (Windows) | Quit Pär, open **Task Manager** and end any leftover Pär processes, then start Pär again and give it a minute |
| Ran out of disk space | Go to **Models** and delete a model you don't use |

Still stuck or need a hand? Reach out to **[par@datomer.eu](mailto:par@datomer.eu)**.

---

## Good to know

**Pär is a helpful assistant, not a professional.** It isn't a doctor, lawyer, therapist, or financial adviser. For anything serious, talk to a real one. If you're in crisis, contact local emergency services.

---

### Quick reference

| | |
|---|---|
| **Install** | Mac: drag to Applications. Windows: run the installer |
| **Setup** | 4 screens, ~2 minutes |
| **Model** | One click, one-time download |
| **Works offline** | Local chat after setup; online services need internet access |
| **Your data** | Saved locally; you choose what to share through connected services or exports |
| **Help** | [par@datomer.eu](mailto:par@datomer.eu) |

---

<p align="center">
  <img src="/get-started/par-logo.webp" alt="Pär" width="48" height="48" style="border-radius: 12px; vertical-align: middle; margin-right: 8px;" />
  <br/>
  <em>Pär — by Datomer AB. Built in the EU for local AI and clearer choices about your information.</em>
</p>
