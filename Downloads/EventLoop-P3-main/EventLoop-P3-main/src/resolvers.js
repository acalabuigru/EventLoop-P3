// src/resolvers.js
const { conectarDB } = require('./db');
const { ObjectId } = require('mongodb');

// Sesion activa en memoria (equivalente al localStorage del P2)
let usuarioActivo = "-no login-";

module.exports = {

    // --- QUERIES ---

    // Equivalente a almacenaje.obtenerUsuarios()
    obtenerUsuarios: async () => {
        const db = await conectarDB();
        const usuarios = await db.collection('usuarios').find().toArray();
        return usuarios.map(u => ({ id: u._id, nombre: u.nombre, email: u.email }));
    },

    // Equivalente a almacenaje.obtenerUsuarioActivo()
    obtenerUsuarioActivo: () => {
        return usuarioActivo;
    },

    // Equivalente a almacenaje.obtenerEmpleos()
    obtenerEmpleos: async () => {
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
    },

    // Equivalente a almacenaje.obtenerSeleccionados()
    obtenerSeleccionados: async () => {
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
    },

    // --- MUTATIONS DE USUARIOS ---

    // Equivalente a almacenaje.guardarUsuario()
    crearUsuario: async ({ nombre, email, password }) => {
        const db = await conectarDB();
        const existente = await db.collection('usuarios').findOne({ email });
        if (existente) {
            throw new Error("El email ya esta registrado");
        }
        const resultado = await db.collection('usuarios').insertOne({ nombre, email, password });
        return { id: resultado.insertedId, nombre, email };
    },

    // Equivalente a almacenaje.borrarUsuario()
    borrarUsuario: async ({ email }) => {
        const db = await conectarDB();
        const resultado = await db.collection('usuarios').deleteOne({ email });
        return resultado.deletedCount === 1;
    },

    // Equivalente a almacenaje.loguearUsuario()
    loguearUsuario: async ({ email, password }) => {
        const db = await conectarDB();
        const usuario = await db.collection('usuarios').findOne({ email, password });
        if (usuario) {
            usuarioActivo = usuario.nombre;
            return { ok: true, nombre: usuario.nombre };
        }
        return { ok: false, nombre: null };
    },

    // Equivalente a almacenaje.cerrarSesion()
    cerrarSesion: () => {
        usuarioActivo = "-no login-";
        return true;
    },

    // --- MUTATIONS DE EMPLEOS ---

    // Equivalente a almacenaje.agregarEmpleo()
    crearEmpleo: async ({ titulo, email, fecha, descripcion, tipo }) => {
        const db = await conectarDB();
        const resultado = await db.collection('empleos').insertOne({ titulo, email, fecha, descripcion, tipo });
        return { id: resultado.insertedId, titulo, email, fecha, descripcion, tipo };
    },

    // Equivalente a almacenaje.borrarEmpleo()
    borrarEmpleo: async ({ id }) => {
        const db = await conectarDB();
        const resultado = await db.collection('empleos').deleteOne({ _id: new ObjectId(id) });
        return resultado.deletedCount === 1;
    },

    // --- MUTATIONS DE SELECCIONADOS ---

    // Equivalente a almacenaje.guardarSeleccion() — upsert como el put() de IndexedDB
    guardarSeleccion: async ({ id, titulo, email, fecha, descripcion, tipo }) => {
        const db = await conectarDB();
        const _id = new ObjectId(id);
        await db.collection('seleccionados').replaceOne(
            { _id },
            { _id, titulo, email, fecha, descripcion, tipo },
            { upsert: true }
        );
        return { id, titulo, email, fecha, descripcion, tipo };
    }
};
