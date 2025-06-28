"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WeatherData {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "stormy"
  description: string
  icon: string
  recommendation: string
}

interface WeatherContextType {
  weather: WeatherData | null
  loading: boolean
  getWeatherForDate: (date: string) => WeatherData | null
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock weather API call
    const fetchWeather = async () => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock weather data
      const mockWeather: WeatherData = {
        temperature: 25,
        condition: "sunny",
        description: "Ensolarado",
        icon: "☀️",
        recommendation: "Ótimo dia para lavagem! O sol ajudará na secagem.",
      }

      setWeather(mockWeather)
      setLoading(false)
    }

    fetchWeather()
  }, [])

  const getWeatherForDate = (date: string): WeatherData | null => {
    // Mock weather prediction for future dates
    const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy"]
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

    const weatherMap = {
      sunny: {
        temperature: 28,
        condition: "sunny" as const,
        description: "Ensolarado",
        icon: "☀️",
        recommendation: "Perfeito para lavagem! O sol ajudará na secagem.",
      },
      cloudy: {
        temperature: 22,
        condition: "cloudy" as const,
        description: "Nublado",
        icon: "☁️",
        recommendation: "Bom dia para lavagem, sem sol forte.",
      },
      rainy: {
        temperature: 18,
        condition: "rainy" as const,
        description: "Chuvoso",
        icon: "🌧️",
        recommendation: "Chuva prevista. Considere reagendar para outro dia.",
      },
    }

    return weatherMap[randomCondition]
  }

  return (
    <WeatherContext.Provider
      value={{
        weather,
        loading,
        getWeatherForDate,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider")
  }
  return context
}
