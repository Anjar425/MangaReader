import { useState, useEffect } from "react"

const useUIControls = () => {
	const [showControls, setShowControls] = useState(true)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [isChapterListOpen, setIsChapterListOpen] = useState(false)

	// Auto-hide controls after 3 seconds of inactivity
	useEffect(() => {
		if (!showControls) return

		const timer = setTimeout(() => {
			setShowControls(false)
		}, 3000)

		return () => clearTimeout(timer)
	}, [showControls])

	// Show controls on mouse movement
	const handleMouseMove = () => {
		setShowControls(true)
	}

	const toggleSettings = () => {
		if (isChapterListOpen) {
			setIsChapterListOpen(false)
		}
		setIsSettingsOpen(!isSettingsOpen)
	}

	const toggleChapterList = () => {
		if (isSettingsOpen) {
			setIsSettingsOpen(false)
		}
		setIsChapterListOpen(!isChapterListOpen)
	}

	return {
		showControls,
		isSettingsOpen,
		isChapterListOpen,
		handleMouseMove,
		toggleSettings,
		toggleChapterList,
	}
}

export { useUIControls }