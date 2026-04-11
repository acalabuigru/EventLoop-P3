// JS/almacenaje.js

export const almacenaje = {
    // --- GESTIÓN DE USUARIOS (localStorage) ---
    obtenerUsuarios: () => {
        const usuarios = localStorage.getItem('usuarios');
        return usuarios ? JSON.parse(usuarios) : [];
    },

    guardarUsuario: (usuario) => {
        const usuarios = almacenaje.obtenerUsuarios();
        // Comprobamos si el email ya existe
        if (usuarios.find(u => u.email === usuario.email)) {
            throw new Error("El email ya está registrado");
        }
        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    },

    borrarUsuario: (email) => {
        let usuarios = almacenaje.obtenerUsuarios();
        usuarios = usuarios.filter(u => u.email !== email);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    },

    loguearUsuario: (email, password) => {
        const usuarios = almacenaje.obtenerUsuarios();
        const usuario = usuarios.find(u => u.email === email && u.password === password);
        if (usuario) {
            localStorage.setItem('usuarioActivo', usuario.nombre);
            return true;
        }
        return false;
    },

    obtenerUsuarioActivo: () => {
        return localStorage.getItem('usuarioActivo') || "-no login-";
    },

    cerrarSesion: () => {
        localStorage.removeItem('usuarioActivo');
    },

    // --- GESTIÓN DE EMPLEOS (IndexedDB) ---
    abrirDB: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('empleosDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('empleos')) {
                    db.createObjectStore('empleos', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('seleccionados')) {
                    db.createObjectStore('seleccionados', { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Error al abrir IndexedDB');
        });
    },

    agregarEmpleo: async (empleo) => {
        const db = await almacenaje.abrirDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['empleos'], 'readwrite');
            const store = transaction.objectStore('empleos');
            const request = store.add(empleo);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject('Error al guardar empleo');
        });
    },

    obtenerEmpleos: async () => {
        const db = await almacenaje.abrirDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(['empleos'], 'readonly');
            const store = transaction.objectStore('empleos');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    },

    borrarEmpleo: async (id) => {
        const db = await almacenaje.abrirDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(['empleos'], 'readwrite');
            const store = transaction.objectStore('empleos');
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
        });
    }
};
