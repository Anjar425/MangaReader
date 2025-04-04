import { useState, useEffect } from "react"

const useThemeToggle = () => {
	const [darkMode, setDarkMode] = useState<boolean>(true)
	

	// Initialize dark mode on component mount
	useEffect(() => {
		// Apply dark class to the html element
		if (darkMode) {
			document.documentElement.classList.add("dark")
		} else {
			document.documentElement.classList.remove("dark")
		}
	}, [darkMode])

	// Toggle dark mode function
	const toggleDarkMode = () => {
		const newDarkMode = !darkMode
		setDarkMode(newDarkMode)

		// Apply dark class to the html element
		if (newDarkMode) {
			document.documentElement.classList.add("dark")
		} else {
			document.documentElement.classList.remove("dark")
		}
	}

	return { darkMode, toggleDarkMode }
}

export { useThemeToggle }