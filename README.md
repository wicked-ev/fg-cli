# fg — React Development CLI Tool

A lightweight CLI tool to speed up React development.  
With `fg`, you can quickly scaffold components, hooks, routes, and list files in your project — all from the terminal.

---

## Installation

```bash
npm install -g fg
```

Or use locally in a project:

```bash
npm install fg --save-dev
```

---

##  Usage

Run the following to see available commands:

```bash
fg --help
```

---

## 📖 Commands

### 1 Create a React Component
```bash
fg cr <ComponentName> [options]
```
**Options**:
- `-t, --typescript` → Creates `.tsx` instead of `.jsx`
- `-f, --force` → Overwrite if component already exists
- `-i, --ignore` → Skip default template (create empty)
- `-s, --style <style>` → CSS style type: `css` | `scss` | `module` (default: `css`)

**Example**:
```bash
fg cr Navbar -t -s module
```
Creates:
```
Navbar.tsx
Navbar.module.css
```

---

### 2 Create a Custom React Hook
```bash
fg hr <HookName> [options]
```
**Options**:
- `-i, --ignore` → Skip hooks directory check

**Example**:
```bash
fg hr useFetch
```
Creates:
```
useFetch.js
```

---

### 3 Add a Route to React Router
```bash
fg arr <routerFile> <path> <component>
```
Adds a route to the specified router file (if found).

**Example**:
```bash
fg arr src/AppRouter.jsx /about About
```
Adds:
```jsx
<Route path="/about" element={<About />} />
```
to `src/AppRouter.jsx`.

---

### 4 List Files
```bash
fg list [options]
```
**Options**:
- `-n, --name <name>` → Search files by name
- `-e, --ext <ext...>` → One or more extensions to search for (default `.jsx`)

**Examples**:
```bash
fg list -n Button
fg list -e jsx tsx
```

---
## 🛠 Development

Clone and install dependencies:

```bash
git clone https://github.com/yourusername/fg.git
cd fg
npm install
```

Run locally:
```bash
node bin/index.js <command>
```

Link globally (optional):
```bash
npm link
```

---

## ✅ TODO (Planned Features)

- [ ] **Config file support** (`.fgconfig.json`) for default directories, styles, extensions.
- [ ] **Auto-import into barrel files** when creating components.
- [ ] **JSX Element identifier rename command** (search and replace).
- [ ] **More templates** (context providers, higher-order components, test files).

---
