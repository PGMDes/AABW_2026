# 09_DEPLOYMENT.md

## Purpose

This document explains how to build, preview, validate, and package the current `SymbiontOS` MVP for static deployment.

Phase 10 keeps the app frontend-only. It prepares the existing React/Vite demo for static hosting without adding backend code, authentication, a database, APIs, real agents, or external services.

## Frontend-only deployment scope

The deployable app is the compiled frontend in:

```bash
app/dist
```

That folder can be hosted by a static frontend host. It contains the built HTML, CSS, JavaScript, static assets, sample demo data, and deterministic frontend logic for:

- task intake
- recommendation
- governance
- marketplace option selection
- lightweight execution state
- lifecycle and audit trail display
- browser-local custom tasks and Human review decisions

## What is not included yet

This deployment does not include:

- backend
- auth
- database
- real agents
- APIs
- durable shared storage

The app is a static frontend MVP demo, not a production multi-user platform.

## LocalStorage caveat

Custom local tasks and Human review decisions are stored only in each browser's `localStorage`.

That means:

- the data stays in the browser that created it
- another browser or device will not see the same custom tasks or review decisions
- clearing browser storage removes local custom work
- the Dashboard `Reset local demo state` button clears local custom tasks and review decisions
- built-in demo scenarios remain deterministic sample data

This is useful for the demo, but it is not durable shared storage.

## Build command

From the repository root on Windows:

```bash
npm.cmd --prefix app run build
```

Expected output folder:

```bash
app/dist
```

On non-Windows systems or most static hosting providers, use `npm` instead of `npm.cmd`.

## Scenario validation command

Run this before packaging or deploying:

```bash
npm.cmd --prefix app run validate:scenarios
```

The expected Phase 10 result is:

```text
11/11 scenarios passed
```

## Local preview command

Build first, then preview the built static app:

```bash
npm.cmd --prefix app run preview -- --host 127.0.0.1
```

Open the local URL printed by Vite. It is usually:

```text
http://127.0.0.1:4173/
```

`vite preview` is a local static preview server for the built files. It is not a backend for the product.

## Static deployment options

High-level options for this frontend-only build:

- Vercel
- Netlify
- GitHub Pages
- any static file host that can serve the contents of `app/dist`

For most hosts, the important settings are:

- install/build from the repo root or the `app` folder
- build command: `npm --prefix app run build` if building from the repo root
- output or publish directory: `app/dist`

Some hosts may need an install step first:

```bash
npm --prefix app install
```

## GitHub Pages caveat

GitHub Pages often serves project sites from a subpath like:

```text
https://USERNAME.github.io/REPOSITORY_NAME/
```

The Vite config uses:

```js
base: "./"
```

That keeps built asset links relative, which makes the static build more portable for subpath hosting. If the app later needs a specific absolute GitHub Pages path, update `app/vite.config.js` carefully and rebuild.

Do not add deployment secrets or GitHub Actions unless that becomes an explicit project task.

## Release checklist

Before final submission:

- [ ] `git status` is clean
- [ ] `npm.cmd --prefix app run build` passes
- [ ] `npm.cmd --prefix app run validate:scenarios` passes
- [ ] `npm.cmd --prefix app run preview -- --host 127.0.0.1` starts successfully
- [ ] Dashboard loads
- [ ] New Task scenario picker works
- [ ] custom local task persistence works
- [ ] reset local demo state works
- [ ] `task_001` Agent path works
- [ ] `task_002` Human review works
- [ ] `task_003` blocked path does not launch
- [ ] `docs/08_DEMO_WALKTHROUGH.md` is ready

