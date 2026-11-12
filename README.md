# Focus Timer

A minimal, browser-only Pomodoro timer for Chrome. No backend, no accounts.

- Focus and break sessions, with a long break after every 4th focus
- Stays accurate in background tabs; time shows in the tab title
- Chime when a session ends
- *Coming next:* presets and custom durations, ambient sounds, Picture-in-Picture mini window

## Run it

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # unit tests
npm run build   # static site in dist/, deployable to GitHub Pages
```

Built with Svelte 5, Vite and TypeScript. All timer logic lives in [`src/lib/timer.svelte.ts`](src/lib/timer.svelte.ts).
