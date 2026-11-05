import { ref } from 'vue'

/**
 * A look still to be chosen at review: how a muted conversation's row says so. Only the dev build's
 * Tweak panel (see tweaks.ts) ever changes this, so a production build always draws the default.
 */
export type MuteRowMark = 'icon' | 'label' | 'none'

export const muteRowMark = ref<MuteRowMark>('icon')
