import { onMounted, onUnmounted, ref } from 'vue'

/**
 * How much of the on-screen keyboard is covering the layout viewport, as insets for holding a
 * full-screen pane clear of it.
 *
 * iOS leaves the layout viewport full-height when the keyboard opens and slides the visible part
 * around underneath it, so `position: fixed; inset: 0` runs on behind the keyboard and has to be
 * held off it by hand:
 *
 * - `bottom` is the strip the keyboard covers, so a pane ends where the keyboard starts.
 * - `top` is how far iOS has panned to reveal a focused field, so the pane rides that pan instead of
 *   being dragged off the top of the screen.
 *
 * `interactive-widget=resizes-content` (index.html) is supposed to make both of these unnecessary by
 * shrinking the layout viewport itself. It did not, on the iOS this was built against: dropping the
 * `bottom` inset put the toolbar straight back behind the keyboard. Treat these as load-bearing.
 */
export const useKeyboardInsets = () => {
	const top = ref(0)
	const bottom = ref(0)
	/** The visible height — what's left of the screen once the keyboard has taken its share. */
	const height = ref(window.innerHeight)

	const update = () => {
		const viewport = window.visualViewport
		if (!viewport) return

		height.value = viewport.height
		top.value = viewport.offsetTop
		// Against the layout viewport, not innerHeight: innerHeight tracks the visual viewport on iOS,
		// which would make this always 0 and the fallback a no-op on the browsers that need it.
		const covered = document.documentElement.clientHeight - viewport.height - viewport.offsetTop
		bottom.value = Math.max(0, Math.round(covered))
	}

	onMounted(() => {
		update()
		// `resize` is the keyboard opening and closing; `scroll` is iOS panning what's left of the
		// viewport. Missing the second is what lets a pane drift off the top of the screen.
		window.visualViewport?.addEventListener('resize', update)
		window.visualViewport?.addEventListener('scroll', update)
		window.addEventListener('resize', update)
	})

	onUnmounted(() => {
		window.visualViewport?.removeEventListener('resize', update)
		window.visualViewport?.removeEventListener('scroll', update)
		window.removeEventListener('resize', update)
	})

	return { top, bottom, height }
}
