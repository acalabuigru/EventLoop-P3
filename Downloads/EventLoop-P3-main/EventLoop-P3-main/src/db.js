/**
 * @fileoverview Modulo de conexion a MongoDB Atlas.
 * Gestiona la conexion unica (singleton) a la base de datos mediante el driver nativo de MongoDB.
 * Las credenciales se cargan desde variables de entorno definidas en el archivo .env.
 * No se utiliza Mongoose (requisito del Producto 3).
 * @module db
 */

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

/** @type {string} URI de conexion a MongoDB Atlas, leida desde MONGODB_URI */
const uri = process.env.MONGODB_URI;

/** @type {string} Nombre de la base de datos (MONGODB_DB o 'empleoProDB' por defecto) */
const dbName = process.env.MONGODB_DB || 'empleoProDB';

/**
 * Cliente MongoDB configurado con Stable API v1.
 * @type {MongoClient}
 */
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

/**
 * Instancia singleton de la base de datos.
 * Se inicializa en la primera llamada a conectarDB y se reutiliza en las siguientes.
 * @type {import('mongodb').Db|null}
 */
let db = null;

/**
 * Establece y devuelve la conexion a la base de datos MongoDB.
 * Implementa el patron singleton: si ya existe conexion activa, la reutiliza.
 *
 * @async
 * @function conectarDB
 * @returns {Promise<import('mongodb').Db>} Instancia de la base de datos conectada.
 * @throws {Error} Si la conexion falla (credenciales incorrectas, red no disponible, etc.).
 *
 * @example
 * const db = await conectarDB();
 * const usuarios = await db.collection('usuarios').find().toArray();
 */
async function conectarDB() {
    if (db) return db;
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('Conexion establecida con MongoDB Atlas correctamente.');
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
        throw new Error('No se pudo conectar a la base de datos: ' + error.message);
    }
}

module.exports = { conectarDB };
