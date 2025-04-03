"use client"

import { useState, useEffect } from "react"

export function useThemeToggle() {
  const [darkMode, setDarkMode] = useState(true)

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

