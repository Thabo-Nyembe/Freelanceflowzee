export const testUsers = {
  admin: {
    email: 'admin@freeflowzee.com',
    password: 'admin123',
    role: 'admin'
  },
  user: {
    email: 'user@freeflowzee.com', 
    password: 'user123',
    role: 'user'
  },
  premium: {
    email: 'premium@freeflowzee.com',
    password: 'premium123',
    role: 'premium'
  }
};

export const testProjects = [
  {
    id: 'test-project-1',
    title: 'Test Premium Project',
    status: 'active',
    price: 2900, // $29.00 in cents
    accessCode: 'PREMIUM2024',
    password: 'test123'
  },
  {
    id: 'test-project-2', 
    title: 'Test Free Project',
    status: 'active',
    price: 0,
    accessCode: null,
    password: null
  }
];

export const testPaymentCards = {
  valid: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123'
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/25', 
    cvc: '123'
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/25',
    cvc: '123'
  }
};

export const testMessages = {
  success: {
    login: 'Successfully logged in',
    payment: 'Payment completed successfully',
    access: 'Access granted'
  },
  error: {
    invalidLogin: 'Invalid email or password',
    paymentFailed: 'Payment failed',
    accessDenied: 'Access denied'
  }
};
