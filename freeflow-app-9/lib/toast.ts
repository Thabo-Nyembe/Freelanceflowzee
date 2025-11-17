/**
 * Simple Toast Notification Utility
 * Replaces alert() dialogs with non-blocking toast messages
 */

export const toast = {
  success: (message: string) => {
    showToast(message, 'success')
  },
  error: (message: string) => {
    showToast(message, 'error')
  },
  info: (message: string) => {
    showToast(message, 'info')
  },
  warning: (message: string) => {
    showToast(message, 'warning')
  }
}

function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${getToastStyles(type)}`
  toast.textContent = message
  toast.style.animation = 'slideIn 0.3s ease-out'

  // Add to document
  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

function getToastStyles(type: string) {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'warning':
      return 'bg-yellow-500 text-white'
    case 'info':
    default:
      return 'bg-blue-500 text-white'
  }
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
