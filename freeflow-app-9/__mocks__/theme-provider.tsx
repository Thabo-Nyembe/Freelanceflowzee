const React = require('react')

const ThemeProvider = ({ children }) => {
  return React.createElement(React.Fragment, null, children)
}

const useTheme = () => {
  return {
    theme: 'light',
    setTheme: () => {},
    systemTheme: 'light'
  }
}

module.exports = {
  ThemeProvider,
  useTheme
} 