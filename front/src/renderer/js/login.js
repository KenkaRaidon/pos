/**
 * Login Module - Manejo de autenticación
 */

const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.classList.remove('show');

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError('Por favor completa todos los campos');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const user = await response.json();

    // Guardar usuario en sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    // Redirigir a la aplicación principal
    window.location.href = 'index.html';

  } catch (error) {
    showError(error.message || 'Error al iniciar sesión');
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}

// Verificar si ya hay sesión activa
const currentUser = sessionStorage.getItem('currentUser');
if (currentUser) {
  window.location.href = 'index.html';
}
