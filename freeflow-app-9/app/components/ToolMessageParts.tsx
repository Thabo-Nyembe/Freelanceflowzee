// Define the tool types
interface WeatherToolInput {
  location: string
  units?: 'metric' | 'imperial'
}

interface ConfirmationToolInput {
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
}

interface ToolMessagePartsProps {
  tool: {
    name: string
    input: WeatherToolInput | ConfirmationToolInput
  }
  onResponse: (response: string) => void
}

export function ToolMessageParts({ tool: unknown, onResponse }: ToolMessagePartsProps) {
  const handleWeatherRequest = async (location: string, units: string = 'metric') => {
    try {
      // In a real app, you would make an API call to a weather service
      const mockWeather = {
        temperature: 20,
        condition: 'sunny',
      }
      onResponse(`Weather in ${location}: ${mockWeather.temperature}°${units === 'metric' ? 'C' : 'F'}, ${mockWeather.condition}`)
    } catch (error) {
      console.error('Weather request error: ', error)
      onResponse('Failed to get weather information')
    }
  }

  const handleConfirmation = (message: string, confirmed: boolean, confirmText?: string, cancelText?: string) => {
    onResponse(
      confirmed
        ? `User confirmed: ${message}`
        : `User cancelled: ${message}`
    )
  }

  switch (tool.name) {
    case 'getWeatherInformation':
      const weatherInput = tool.input as WeatherToolInput
      return (
        <div className="space-y-2">
          <p>Getting weather for: {weatherInput.location}</p>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>Fetching weather data...</span>
          </div>
          <button
            onClick={() => handleWeatherRequest(weatherInput.location, weatherInput.units)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Get Weather
          </button>
        </div>
      )

    case 'askForConfirmation':
      const confirmInput = tool.input as ConfirmationToolInput
      return (
        <div className="space-y-2">
          <p>{confirmInput.message}</p>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                handleConfirmation(
                  confirmInput.message,
                  true,
                  confirmInput.confirmButtonText,
                  confirmInput.cancelButtonText
                )
              }
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {confirmInput.confirmButtonText || 'Confirm'}
            </button>
            <button
              onClick={() =>
                handleConfirmation(
                  confirmInput.message,
                  false,
                  confirmInput.confirmButtonText,
                  confirmInput.cancelButtonText
                )
              }
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {confirmInput.cancelButtonText || 'Cancel'}
            </button>
          </div>
        </div>
      )

    default:
      return <p>Unknown tool: {tool.name}</p>
  }
}