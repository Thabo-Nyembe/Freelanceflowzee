export const testUsers = {
  admin: {
    email: &apos;admin@freeflowzee.com&apos;,
    password: &apos;admin123&apos;,
    role: &apos;admin&apos;
  },
  user: {
    email: &apos;user@freeflowzee.com&apos;, 
    password: &apos;user123&apos;,
    role: &apos;user&apos;
  },
  premium: {
    email: &apos;premium@freeflowzee.com&apos;,
    password: &apos;premium123&apos;,
    role: &apos;premium&apos;
  }
};

export const testProjects = [
  {
    id: &apos;test-project-1&apos;,
    title: &apos;Test Premium Project&apos;,
    status: &apos;active&apos;,
    price: 2900, // $29.00 in cents
    accessCode: &apos;PREMIUM2024&apos;,
    password: &apos;test123&apos;
  },
  {
    id: &apos;test-project-2&apos;, 
    title: &apos;Test Free Project&apos;,
    status: &apos;active&apos;,
    price: 0,
    accessCode: null,
    password: null
  }
];

export const testPaymentCards = {
  valid: {
    number: &apos;4242424242424242&apos;,
    expiry: &apos;12/25&apos;,
    cvc: &apos;123&apos;
  },
  declined: {
    number: &apos;4000000000000002&apos;,
    expiry: &apos;12/25&apos;, 
    cvc: &apos;123&apos;
  },
  insufficientFunds: {
    number: &apos;4000000000009995&apos;,
    expiry: &apos;12/25&apos;,
    cvc: &apos;123&apos;
  }
};

export const testMessages = {
  success: {
    login: &apos;Successfully logged in&apos;,
    payment: &apos;Payment completed successfully&apos;,
    access: &apos;Access granted&apos;
  },
  error: {
    invalidLogin: &apos;Invalid email or password&apos;,
    paymentFailed: &apos;Payment failed&apos;,
    accessDenied: &apos;Access denied&apos;
  }
};
