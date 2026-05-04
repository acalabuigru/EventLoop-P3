/**
 * @fileoverview Punto de entrada del servidor backend de EventLoop - Producto 3.
 * Configura y arranca un servidor Express con un unico endpoint GraphQL en /graphql.
 * En este producto no hay frontend: todas las peticiones se realizan con Postman o GraphiQL.
 *
 * Uso:
 *   node src/server.js
 *
 * Variables de entorno requeridas (archivo .env):
 *   MONGODB_URI  - URI de conexion a MongoDB Atlas
 *   MONGODB_DB   - Nombre de la base de datos (por defecto: empleoProDB)
 *   PORT         - Puerto del servidor (por defecto: 4000)
 *
 * @module server
 */

require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const resolvers = require('./resolvers');

/**
 * Puerto en el que escucha el servidor.
 * Se lee de la variable de entorno PORT, o se usa 4000 por defecto.
 * @type {number}
 */
const PORT = process.env.PORT || 4000;

/**
 * Instancia de la aplicacion Express.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Middleware de parseo de JSON para peticiones entrantes.
 */
app.use(express.json());

/**
 * Endpoint unico de GraphQL.
 * - GET /graphql  -> abre GraphiQL (interfaz interactiva para pruebas en desarrollo).
 * - POST /graphql -> recibe queries y mutations desde Postman u otros clientes.
 *
 * Los errores se formatean con mensaje, ubicacion y ruta para facilitar el debugging.
 *
 * @name GET/POST /graphql
 */
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
    customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
    }),
}));

/**
 * Arranca el servidor en el puerto indicado.
 */
app.listen(PORT, () => {
    console.log('Servidor EventLoop corriendo en http://localhost:' + PORT + '/graphql');
    console.log('GraphiQL disponible en   http://localhost:' + PORT + '/graphql');
});
