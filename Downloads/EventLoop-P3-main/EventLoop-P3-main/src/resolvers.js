/**
 * @fileoverview Resolvers GraphQL para el backend de EventLoop - Producto 3.
 * Implementa todas las Queries y Mutations del esquema.
 * Es el equivalente backend de almacenaje.js del Producto 2:
 *   - Usuarios: localStorage -> coleccion MongoDB 'usuarios'
 *   - Empleos:  IndexedDB store 'empleos' -> coleccion MongoDB 'empleos'
 *   - Seleccionados: IndexedDB store 'seleccionados' -> coleccion MongoDB 'seleccionados'
 * Las contrasenas se almacenan hasheadas con bcrypt (nunca en texto plano).
 * @module resolvers
 */

const { conectarDB } = require('./db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

/** @constant {number} Numero de rondas de sal para el hash de bcrypt */
const SALT_ROUNDS = 10;

/**
 * Sesion activa en memoria del servidor.
 * Equivalente a localStorage.getItem('usuarioActivo') del Producto 2.
 * Se pierde al reiniciar el servidor (sin JWT en este producto es el comportamiento esperado).
 * @type {string}
 */
let usuarioActivo = '-no login-';

// ---------------------------------------------------------------------------
// Helpers de validacion
// ---------------------------------------------------------------------------

/**
 * Valida que un email tenga un formato basico correcto.
 * @param {string} email - Email a validar.
 * @returns {boolean} true si el formato es valido.
 */
function esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida que una cadena no este vacia ni sea solo espacios.
 * @param {string} valor - Cadena a validar.
 * @returns {boolean} true si tiene contenido.
 */
function noEstaVacio(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------

module.exports = {

    // =========================================================================
    // QUERIES
    // =========================================================================

    /**
     * Devuelve todos los usuarios registrados en la base de datos.
     * Equivalente a almacenaje.obtenerUsuarios() del Producto 2.
     * No devuelve el campo password por seguridad.
     *
     * @async
     * @returns {Promise<Array<{id: string, nombre: string, email: string}>>}
     * @throws {Error} Si falla la consulta a MongoDB.
     */
    obtenerUsuarios: async () => {
        try {
            const db = await conectarDB();
            const usuarios = await db.collection('usuarios').find().toArray();
            return usuarios.map(u => ({ id: u._id, nombre: u.nombre, email: u.email }));
        } catch (error) {
            throw new Error('Error al obtener usuarios: ' + error.message);
        }
    },

    /**
     * Devuelve el nombre del usuario actualmente autenticado.
     * Equivalente a almacenaje.obtenerUsuarioActivo() del Producto 2.
     *
     * @returns {string} Nombre del usuario activo o '-no login-' si no hay sesion.
     */
    obtenerUsuarioActivo: () => {
        return usuarioActivo;
    },

    /**
     * Devuelve todos los empleos/voluntariados almacenados.
     * Equivalente a almacenaje.obtenerEmpleos() del Producto 2.
     *
     * @async
     * @returns {Promise<Array<{id: string, titulo: string, email: string, fecha: string, descripcion: string, tipo: string}>>}
     * @throws {Error} Si falla la consulta a MongoDB.
     */
    obtenerEmpleos: async () => {
        try {
            const db = await conectarDB();
            const empleos = await db.collection('empleos').find().toArray();
            return empleos.map(e => ({
                id: e._id,
                titulo: e.titulo,
                email: e.email,
                fecha: e.fecha,
                descripcion: e.descripcion,
                tipo: e.tipo
            }));
        } catch (error) {
            throw new Error('Error al obtener empleos: ' + error.message);
        }
    },

    /**
     * Devuelve todos los empleos guardados como seleccionados/favoritos.
     * Equivalente a almacenaje.obtenerSeleccionados() del Producto 2.
     *
     * @async
     * @returns {Promise<Array<{id: string, titulo: string, email: string, fecha: string, descripcion: string, tipo: string}>>}
     * @throws {Error} Si falla la consulta a MongoDB.
     */
    obtenerSeleccionados: async () => {
        try {
            const db = await conectarDB();
            const seleccionados = await db.collection('seleccionados').find().toArray();
            return seleccionados.map(s => ({
                id: s._id,
                titulo: s.titulo,
                email: s.email,
                fecha: s.fecha,
                descripcion: s.descripcion,
                tipo: s.tipo
            }));
        } catch (error) {
            throw new Error('Error al obtener seleccionados: ' + error.message);
        }
    },

    // =========================================================================
    // MUTATIONS - USUARIOS
    // =========================================================================

    /**
     * Registra un nuevo usuario en la base de datos.
     * Equivalente a almacenaje.guardarUsuario() del Producto 2.
     * La contrasena se hashea con bcrypt antes de persistirse.
     *
     * @async
     * @param {object} args
     * @param {string} args.nombre - Nombre completo del usuario.
     * @param {string} args.email - Email unico del usuario.
     * @param {string} args.password - Contrasena en texto plano (minimo 6 caracteres).
     * @returns {Promise<{id: string, nombre: string, email: string}>} Usuario creado (sin password).
     * @throws {Error} Si el email ya existe, el formato es invalido o los campos estan vacios.
     */
    crearUsuario: async ({ nombre, email, password }) => {
        if (!noEstaVacio(nombre)) throw new Error('El nombre no puede estar vacio.');
        if (!noEstaVacio(email) || !esEmailValido(email)) throw new Error('El email no tiene un formato valido.');
        if (!noEstaVacio(password) || password.length < 6) throw new Error('La contrasena debe tener al menos 6 caracteres.');
        try {
            const db = await conectarDB();
            const existente = await db.collection('usuarios').findOne({ email: email.toLowerCase() });
            if (existente) throw new Error('El email ya esta registrado.');
            const hash = await bcrypt.hash(password, SALT_ROUNDS);
            const resultado = await db.collection('usuarios').insertOne({
                nombre: nombre.trim(),
                email: email.toLowerCase(),
                password: hash
            });
            return { id: resultado.insertedId, nombre: nombre.trim(), email: email.toLowerCase() };
        } catch (error) {
            throw new Error('Error al crear usuario: ' + error.message);
        }
    },

    /**
     * Elimina el usuario con el email indicado.
     * Equivalente a almacenaje.borrarUsuario() del Producto 2.
     *
     * @async
     * @param {object} args
     * @param {string} args.email - Email del usuario a eliminar.
     * @returns {Promise<boolean>} true si se elimino correctamente, false si no se encontro.
     * @throws {Error} Si el email esta vacio o falla la operacion en MongoDB.
     */
    borrarUsuario: async ({ email }) => {
        if (!noEstaVacio(email)) throw new Error('El email no puede estar vacio.');
        try {
            const db = await conectarDB();
            const resultado = await db.collection('usuarios').deleteOne({ email: email.toLowerCase() });
            return resultado.deletedCount === 1;
        } catch (error) {
            throw new Error('Error al borrar usuario: ' + error.message);
        }
    },

    /**
     * Autentica un usuario comprobando email y contrasena con bcrypt.
     * Equivalente a almacenaje.loguearUsuario() del Producto 2.
     *
     * @async
     * @param {object} args
     * @param {string} args.email - Email del usuario.
     * @param {string} args.password - Contrasena en texto plano.
     * @returns {Promise<{ok: boolean, nombre: string|null}>} Resultado de la autenticacion.
     * @throws {Error} Si los campos estan vacios o falla la consulta.
     */
    loguearUsuario: async ({ email, password }) => {
        if (!noEstaVacio(email)) throw new Error('El email no puede estar vacio.');
        if (!noEstaVacio(password)) throw new Error('La contrasena no puede estar vacia.');
        try {
            const db = await conectarDB();
            const usuario = await db.collection('usuarios').findOne({ email: email.toLowerCase() });
            if (!usuario) return { ok: false, nombre: null };
            const coincide = await bcrypt.compare(password, usuario.password);
            if (coincide) {
                usuarioActivo = usuario.nombre;
                return { ok: true, nombre: usuario.nombre };
            }
            return { ok: false, nombre: null };
        } catch (error) {
            throw new Error('Error al iniciar sesion: ' + error.message);
        }
    },

    /**
     * Cierra la sesion activa limpiando el usuario en memoria.
     * Equivalente a almacenaje.cerrarSesion() del Producto 2.
     *
     * @returns {boolean} Siempre devuelve true.
     */
    cerrarSesion: () => {
        usuarioActivo = '-no login-';
        return true;
    },

    // =========================================================================
    // MUTATIONS - EMPLEOS
    // =========================================================================

    /**
     * Crea un nuevo empleo/voluntariado en la base de datos.
     * Equivalente a almacenaje.agregarEmpleo() del Producto 2.
     *
     * @async
     * @param {object} args
     * @param {string} args.titulo - Titulo del empleo.
     * @param {string} args.email - Email de contacto.
     * @param {string} args.fecha - Fecha en formato string.
     * @param {string} args.descripcion - Descripcion del puesto.
     * @param {string} args.tipo - Tipo: 'Oferta' o 'Demanda'.
     * @returns {Promise<{id: string, titulo: string, email: string, fecha: string, descripcion: string, tipo: string}>}
     * @throws {Error} Si algun campo obligatorio esta vacio o falla MongoDB.
     */
    crearEmpleo: async ({ titulo, email, fecha, descripcion, tipo }) => {
        if (!noEstaVacio(titulo)) throw new Error('El titulo no puede estar vacio.');
        if (!noEstaVacio(email) || !esEmailValido(email)) throw new Error('El email de contacto no tiene un formato valido.');
        if (!noEstaVacio(fecha)) throw new Error('La fecha no puede estar vacia.');
        if (!noEstaVacio(descripcion)) throw new Error('La descripcion no puede estar vacia.');
        if (!['Oferta', 'Demanda'].includes(tipo)) throw new Error('El tipo debe ser "Oferta" o "Demanda".');
        try {
            const db = await conectarDB();
            const doc = {
                titulo: titulo.trim(),
                email: email.toLowerCase(),
                fecha,
                descripcion: descripcion.trim(),
                tipo
            };
            const resultado = await db.collection('empleos').insertOne(doc);
            return { id: resultado.insertedId, ...doc };
        } catch (error) {
            throw new Error('Error al crear empleo: ' + error.message);
        }
    },

    /**
     * Actualiza los campos de un empleo existente (operacion UPDATE del CRUD).
     * No existia en el Producto 2; se anade para completar el CRUD completo.
     *
     * @async
     * @param {object} args
     * @param {string} args.id - ID del empleo a actualizar.
     * @param {string} [args.titulo] - Nuevo titulo (opcional).
     * @param {string} [args.email] - Nuevo email de contacto (opcional).
     * @param {string} [args.fecha] - Nueva fecha (opcional).
     * @param {string} [args.descripcion] - Nueva descripcion (opcional).
     * @param {string} [args.tipo] - Nuevo tipo: 'Oferta' o 'Demanda' (opcional).
     * @returns {Promise<{id: string, titulo: string, email: string, fecha: string, descripcion: string, tipo: string}>}
     * @throws {Error} Si el id es invalido, no existe el empleo, o falla MongoDB.
     */
    actualizarEmpleo: async ({ id, titulo, email, fecha, descripcion, tipo }) => {
        if (!id) throw new Error('El id del empleo es obligatorio.');
        if (tipo && !['Oferta', 'Demanda'].includes(tipo)) throw new Error('El tipo debe ser "Oferta" o "Demanda".');
        try {
            const db = await conectarDB();
            const cambios = {};
            if (titulo) cambios.titulo = titulo.trim();
            if (email) {
                if (!esEmailValido(email)) throw new Error('El email de contacto no tiene un formato valido.');
                cambios.email = email.toLowerCase();
            }
            if (fecha) cambios.fecha = fecha;
            if (descripcion) cambios.descripcion = descripcion.trim();
            if (tipo) cambios.tipo = tipo;
            if (Object.keys(cambios).length === 0) throw new Error('Debes indicar al menos un campo a actualizar.');
            const resultado = await db.collection('empleos').findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: cambios },
                { returnDocument: 'after' }
            );
            if (!resultado) throw new Error('No se encontro ningun empleo con id ' + id);
            return {
                id: resultado._id,
                titulo: resultado.titulo,
                email: resultado.email,
                fecha: resultado.fecha,
                descripcion: resultado.descripcion,
                tipo: resultado.tipo
            };
        } catch (error) {
            throw new Error('Error al actualizar empleo: ' + error.message);
        }
    },

    /**
     * Elimina el empleo con el id indicado.
     * Equivalente a almacenaje.borrarEmpleo() del Producto 2.
     *
     * @async
     * @param {object} args
     * @param {string} args.id - ID (ObjectId) del empleo a eliminar.
     * @returns {Promise<boolean>} true si se elimino, false si no se encontro.
     * @throws {Error} Si el id es invalido o falla MongoDB.
     */
    borrarEmpleo: async ({ id }) => {
        if (!id) throw new Error('El id del empleo es obligatorio.');
        try {
            const db = await conectarDB();
            const resultado = await db.collection('empleos').deleteOne({ _id: new ObjectId(id) });
            return resultado.deletedCount === 1;
        } catch (error) {
            throw new Error('Error al borrar empleo: ' + error.message);
        }
    },

    // =========================================================================
    // MUTATIONS - SELECCIONADOS
    // =========================================================================

    /**
     * Guarda o actualiza (upsert) un empleo en la lista de seleccionados/favoritos.
     * Equivalente a almacenaje.guardarSeleccion() del Producto 2 (store.put() en IndexedDB).
     * Si el empleo ya estaba seleccionado, lo sobreescribe; si no, lo inserta.
     *
     * @async
     * @param {object} args
     * @param {string} args.id - ID del empleo original (clave del documento).
     * @param {string} args.titulo - Titulo del empleo.
     * @param {string} args.email - Email de contacto.
     * @param {string} args.fecha - Fecha.
     * @param {string} args.descripcion - Descripcion.
     * @param {string} args.tipo - Tipo: 'Oferta' o 'Demanda'.
     * @returns {Promise<{id: string, titulo: string, email: string, fecha: string, descripcion: string, tipo: string}>}
     * @throws {Error} Si el id es invalido o falla MongoDB.
     */
    guardarSeleccion: async ({ id, titulo, email, fecha, descripcion, tipo }) => {
        if (!id) throw new Error('El id del empleo es obligatorio para guardar la seleccion.');
        try {
            const db = await conectarDB();
            const _id = new ObjectId(id);
            await db.collection('seleccionados').replaceOne(
                { _id },
                { _id, titulo, email, fecha, descripcion, tipo },
                { upsert: true }
            );
            return { id, titulo, email, fecha, descripcion, tipo };
        } catch (error) {
            throw new Error('Error al guardar seleccion: ' + error.message);
        }
    },

    /**
     * Elimina un empleo de la lista de seleccionados.
     * Complemento de guardarSeleccion para una gestion completa de favoritos.
     *
     * @async
     * @param {object} args
     * @param {string} args.id - ID del seleccionado a eliminar.
     * @returns {Promise<boolean>} true si se elimino, false si no se encontro.
     * @throws {Error} Si el id es invalido o falla MongoDB.
     */
    borrarSeleccion: async ({ id }) => {
        if (!id) throw new Error('El id del seleccionado es obligatorio.');
        try {
            const db = await conectarDB();
            const resultado = await db.collection('seleccionados').deleteOne({ _id: new ObjectId(id) });
            return resultado.deletedCount === 1;
        } catch (error) {
            throw new Error('Error al borrar seleccionado: ' + error.message);
        }
    }
};
