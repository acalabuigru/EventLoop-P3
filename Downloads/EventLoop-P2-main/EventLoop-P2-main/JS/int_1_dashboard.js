// JS/int_1_dashboard.js
import { almacenaje } from './almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userActivoSpan = document.getElementById('usuarioActivo');
    const contenedorTarjetas = document.getElementById('tarjetas');
    const contenedorSeleccionados = document.getElementById('seleccionados');
    
    // 1. Mostrar usuario activo y verificar sesión
    const nombreUsuario = almacenaje.obtenerUsuarioActivo();
    if (userActivoSpan) userActivoSpan.textContent = nombreUsuario;

    if (nombreUsuario === "-no login-") {
        window.location.href = "login.html";
        return;
    }

    // 2. Función interna para crear las tarjetas
    const crearTarjeta = (empleo) => {
        const div = document.createElement('div');
        div.className = `card card-empleo shadow-sm mb-2 border-start border-4 ${empleo.tipo === 'Oferta' ? 'border-primary' : 'border-warning'}`;
        div.draggable = true;
        div.id = `empleo-${empleo.id}`;
        div.innerHTML = `
            <div class="card-body p-2">
                <h6 class="card-title mb-1">${empleo.titulo}</h6>
                <p class="small mb-0 text-muted">${empleo.tipo}</p>
            </div>
        `;

        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(empleo));
            div.style.opacity = '0.5';
        });

        div.addEventListener('dragend', () => {
            div.style.opacity = '1';
        });

        return div;
    };

    // 3. Función de carga con manejo de errores (EL PLAN DE RESCATE)
    const cargarDashboard = async () => {
        try {
            console.log("Iniciando carga de datos desde IndexedDB...");
            const todos = await almacenaje.obtenerEmpleos();
            const seleccionados = await almacenaje.obtenerSeleccionados();
            
            // Si llegamos aquí, la DB ha respondido
            contenedorTarjetas.innerHTML = '';
            contenedorSeleccionados.innerHTML = '';

            if (todos.length === 0) {
                contenedorTarjetas.innerHTML = '<p class="text-muted p-3">No hay ofertas disponibles. Créalas en "Ofertas y Demandas".</p>';
                return;
            }

            const idsSeleccionados = seleccionados.map(s => s.id);
            
            todos.forEach(emp => {
                if (!idsSeleccionados.includes(emp.id)) {
                    contenedorTarjetas.appendChild(crearTarjeta(emp));
                }
            });

            seleccionados.forEach(emp => {
                contenedorSeleccionados.appendChild(crearTarjeta(emp));
            });

            console.log("Dashboard renderizado con éxito.");

        } catch (error) {
            console.error("ERROR CRÍTICO:", error);
            contenedorTarjetas.innerHTML = '<p class="text-danger p-3">Error técnico: Revisa que estés usando Live Server.</p>';
        }
    };

    // 4. Configurar Drag & Drop
    contenedorSeleccionados.addEventListener('dragover', (e) => e.preventDefault());
    
    contenedorSeleccionados.addEventListener('drop', async (e) => {
        e.preventDefault();
        const datos = e.dataTransfer.getData('text/plain');
        if (datos) {
            const empleo = JSON.parse(datos);
            await almacenaje.guardarSeleccion(empleo);
            cargarDashboard(); // Recargar la vista
        }
    });

    // Iniciar la carga
    await cargarDashboard();
});