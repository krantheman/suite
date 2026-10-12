// PROTOTYPE (wayfinder/mail-ux, "A clean inbox"): where the menu that clears a tab sits. Throwaway;
// switched from ClearMenuTweaks, the bottom-right Tweak panel.
import { ref } from 'vue'

export const PLACEMENTS = [
  { value: 'toolbar', label: 'Toolbar' },
  { value: 'tab', label: 'On tab' },
  { value: 'row', label: 'Row end' },
  { value: 'context', label: 'Right-click' },
] as const

export type Placement = (typeof PLACEMENTS)[number]['value']

const KEY = 'prototype:clear-menu-placement'
const valid = (value: unknown): value is Placement => PLACEMENTS.some((p) => p.value === value)
const initial = (() => {
  const fromUrl = new URLSearchParams(location.search).get('placement')
  if (valid(fromUrl)) return fromUrl
  try {
    const stored = localStorage.getItem(KEY)
    if (valid(stored)) return stored
  } catch {}
  return 'toolbar' as Placement
})()

export const placement = ref<Placement>(initial)

export const setPlacement = (value: Placement) => {
  placement.value = value
  try {
    localStorage.setItem(KEY, value)
  } catch {}
}
