// JS/int_2_login.js
import { almacenaje } from './almacenaje.js';

document.addEventListener('DOMContentLoaded', () => {
    const userActivoSpan = document.getElementById('usuarioActivo');
    const loginButton = document.getElementById('loginButton');

    // Mostrar el usuario activo (si existe en localStorage) al cargar
    userActivoSpan.textContent = almacenaje.obtenerUsuarioActivo();

    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            // Evitamos que el formulario se envíe de la forma tradicional (recargando página)
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Intentar loguear a través del módulo de almacenaje
            const exito = almacenaje.loguearUsuario(email, password);

            if (exito) {
                alert(`¡Bienvenido, ${almacenaje.obtenerUsuarioActivo()}!`);
                // Actualizamos el nombre en la barra de navegación inmediatamente
                userActivoSpan.textContent = almacenaje.obtenerUsuarioActivo();
                // Redirigir al Dashboard tras el éxito
                window.location.href = 'dashboard.html';
            } else {
                alert('Error: Usuario no encontrado o contraseña incorrecta.');
            }
        });
    }
});
