'use client';

import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    console.log('useEffect running...');
    
    // Add vanilla JavaScript event handler after component mounts
    const button = document.getElementById('login-btn');
    console.log('Button found in useEffect:', !!button);
    
    const handleClick = () => {
      console.log('Button clicked!');
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const email = emailInput?.value;
      const password = passwordInput?.value;
      
      console.log('Direct login attempt:', { email, password: password ? '***' : 'empty' });
      
      if (email?.includes('@') && password?.length > 0) {
        console.log('Setting localStorage...');
        localStorage.setItem('kazi-auth', 'true');
        localStorage.setItem('kazi-user', JSON.stringify({ email, name: 'Test User' }));
        console.log('Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        alert('Please enter valid email and password');
      }
    };
    
    if (button) {
      console.log('Adding event listener...');
      button.addEventListener('click', handleClick);
      return () => {
        console.log('Removing event listener...');
        button.removeEventListener('click', handleClick);
      };
    } else {
      console.log('Button not found, retrying...');
      const timer = setTimeout(() => {
        const retryButton = document.getElementById('login-btn');
        if (retryButton) {
          console.log('Retry successful, adding event listener...');
          retryButton.addEventListener('click', handleClick);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>KAZI Login</h1>
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label>Email:</label>
          <input
            id="email"
            type="email"
            placeholder="thabo@kaleidocraft.co.za"
            style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label>
          <input
            id="password"
            type="password"
            placeholder="password1234"
            style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <button 
          id="login-btn"
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Sign In
        </button>
      </div>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Test credentials:</p>
        <p>Email: thabo@kaleidocraft.co.za</p>
        <p>Password: password1234</p>
      </div>
    </div>
  );
}