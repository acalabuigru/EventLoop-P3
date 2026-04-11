// JS/int_4_usuarios.js
import { almacenaje } from './almacenaje.js';

document.addEventListener('DOMContentLoaded', () => {
    const formUsuario = document.getElementById('formUsuario');
    const tablaUsuarios = document.getElementById('tablaUsuarios');
    const userActivoSpan = document.getElementById('usuarioActivo');

    // 1. Mostrar usuario activo en el navbar
    userActivoSpan.textContent = almacenaje.obtenerUsuarioActivo();

    // 2. Función para pintar la tabla de usuarios
    const renderizarTabla = () => {
        const usuarios = almacenaje.obtenerUsuarios();
        tablaUsuarios.innerHTML = ''; // Limpiar tabla

        usuarios.forEach(usuario => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-borrar" data-email="${usuario.email}">
                        Borrar
                    </button>
                </td>
            `;
            tablaUsuarios.appendChild(fila);
        });

        // Añadir evento a los botones de borrar creados
        document.querySelectorAll('.btn-borrar').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const emailABorrar = e.target.getAttribute('data-email');
                if (confirm(`¿Seguro que quieres borrar a ${emailABorrar}?`)) {
                    almacenaje.borrarUsuario(emailABorrar);
                    renderizarTabla(); // Actualizar tabla tras borrar
                }
            });
        });
    };

    // 3. Manejar el evento de envío del formulario (Alta)
    formUsuario.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevoUsuario = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            almacenaje.guardarUsuario(nuevoUsuario);
            alert('Usuario registrado correctamente.');
            formUsuario.reset(); // Limpiar campos
            renderizarTabla();   // Actualizar tabla
        } catch (error) {
            alert(error.message); // Muestra error si el email ya existe
        }
    });

    // Cargar la tabla al entrar en la página
    renderizarTabla();
});
