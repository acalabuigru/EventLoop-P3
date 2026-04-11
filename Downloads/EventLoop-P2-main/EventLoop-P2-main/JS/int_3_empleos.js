import { almacenaje } from './almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEmpleo');
    const tabla = document.getElementById('tablaEmpleos');
    const userActivoSpan = document.getElementById('usuarioActivo');
    const canvas = document.getElementById('graficoEmpleos');
    const ctx = canvas.getContext('2d');

    userActivoSpan.textContent = almacenaje.obtenerUsuarioActivo();

    const dibujarGrafico = (empleos) => {
        const ofertas = empleos.filter(e => e.tipo === 'Oferta').length;
        const demandas = empleos.filter(e => e.tipo === 'Demanda').length;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar Barra Ofertas (Azul)
        ctx.fillStyle = '#0d6efd';
        ctx.fillRect(50, 150 - ofertas * 20, 50, ofertas * 20);
        ctx.fillText("Ofertas (" + ofertas + ")", 40, 170);

        // Dibujar Barra Demandas (Naranja)
        ctx.fillStyle = '#fd7e14';
        ctx.fillRect(150, 150 - demandas * 20, 50, demandas * 20);
        ctx.fillText("Demandas (" + demandas + ")", 140, 170);
    };

    const cargarDatos = async () => {
        const empleos = await almacenaje.obtenerEmpleos();
        tabla.innerHTML = '';
        empleos.forEach(e => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${e.titulo}</td>
                <td><span class="badge ${e.tipo === 'Oferta' ? 'bg-primary' : 'bg-warning'}">${e.tipo}</span></td>
                <td><button class="btn btn-danger btn-sm" onclick="eliminar(${e.id})">Borrar</button></td>
            `;
            tabla.appendChild(fila);
        });
        dibujarGrafico(empleos);
    };

    window.eliminar = async (id) => {
        await almacenaje.borrarEmpleo(id);
        cargarDatos();
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevo = {
            titulo: document.getElementById('titulo').value,
            email: document.getElementById('emailEmpleo').value,
            fecha: document.getElementById('fecha').value,
            descripcion: document.getElementById('descripcion').value,
            tipo: document.getElementById('tipo').value
        };
        await almacenaje.agregarEmpleo(nuevo);
        form.reset();
        cargarDatos();
    });

    cargarDatos();
});
