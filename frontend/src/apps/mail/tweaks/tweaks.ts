/**
 * The Tweak panel, for looks still to be chosen at review. It only exists on a dev server opened with
 * `?tweaks`: the check is on `import.meta.env.DEV`, so a production build drops the panel entirely.
 */
export const tweaksOn = () =>
  import.meta.env.DEV && new URLSearchParams(location.search).has('tweaks')
