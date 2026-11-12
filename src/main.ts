import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initTimerEffects } from './lib/timer.svelte'
import { initSettingsEffects } from './lib/settings.svelte'

initSettingsEffects()
initTimerEffects()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
