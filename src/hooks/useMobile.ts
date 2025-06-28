"use client"

import { useState, useEffect } from "react"

// Hook para detectar se está em dispositivo móvel
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth
      const userAgent = navigator.userAgent
      
      // Detecta por largura da tela
      const isMobileWidth = width < 768
      
      // Detecta por user agent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      
      setIsMobile(isMobileWidth || isMobileDevice)
    }

    // Check initially
    checkIfMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return isMobile
}

// Hook para orientação da tela
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return orientation
}

// Hook para detectar toque/touch
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
  }, [])

  return isTouch
}

// Utilitário para classes responsivas otimizadas
export const mobileOptimizedClasses = {
  // Padding e margin responsivos
  padding: "p-3 sm:p-4 md:p-6",
  paddingX: "px-3 sm:px-4 md:px-6",
  paddingY: "py-3 sm:py-4 md:py-6",
  margin: "m-3 sm:m-4 md:m-6",
  
  // Gap responsivo
  gap: "gap-3 sm:gap-4 md:gap-6",
  
  // Grid responsivo otimizado
  gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  gridAutoFit: "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
  
  // Flex responsivo
  flexCol: "flex flex-col sm:flex-row",
  flexColReverse: "flex flex-col-reverse sm:flex-row",
  
  // Texto responsivo
  textBase: "text-sm sm:text-base",
  textLg: "text-base sm:text-lg",
  textXl: "text-lg sm:text-xl",
  text2xl: "text-xl sm:text-2xl",
  text3xl: "text-2xl sm:text-3xl",
  
  // Altura responsiva
  height: "h-auto min-h-screen",
  minHeight: "min-h-[60vh] sm:min-h-[70vh]",
  
  // Container responsivo
  container: "w-full max-w-none sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl mx-auto",
  
  // Botões responsivos
  button: "px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base",
  buttonLg: "px-4 py-3 sm:px-6 sm:py-3 text-base sm:text-lg",
  
  // Cards responsivos
  card: "p-4 sm:p-6",
  cardHeader: "p-4 sm:p-6 pb-2 sm:pb-3",
  cardContent: "p-4 sm:p-6 pt-0",
}

// Função para combinar classes responsivas
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
