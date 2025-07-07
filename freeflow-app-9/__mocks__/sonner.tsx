const React = require('react')

const Toaster = () => null

const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
  promise: jest.fn()
}

module.exports = {
  Toaster,
  toast
} 