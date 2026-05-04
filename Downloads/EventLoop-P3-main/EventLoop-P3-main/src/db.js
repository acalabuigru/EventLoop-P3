// src/db.js
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'empleoProDB';

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

async function conectarDB() {
    if (db) return db;
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Conexion establecida con MongoDB Atlas correctamente.");
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error);
        throw error;
    }
}

module.exports = { conectarDB };
