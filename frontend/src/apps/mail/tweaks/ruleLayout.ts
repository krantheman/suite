import { ref } from 'vue'

/**
 * A look still to be chosen at review: how the rule editor lays out a condition or an action. Only the
 * dev build's Tweak panel (see tweaks.ts) ever changes this, so a production build always draws the
 * default.
 */
export type RuleLayout = 'sentence' | 'stacked'

export const ruleLayout = ref<RuleLayout>('sentence')
