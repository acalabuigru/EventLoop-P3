/**
 * @fileoverview Esquema GraphQL de EventLoop - Producto 3.
 * Define Types, Queries y Mutations. Los tipos coinciden con los objetos
 * de almacenaje.js del Producto 2: Usuario, Empleo y Seleccionado.
 * @module schema
 */

const { buildSchema } = require('graphql');

/**
 * Esquema GraphQL (SDL). Types:
 *  - Usuario: usuario registrado (id, nombre, email)
 *  - Empleo: oferta o demanda de voluntariado (id, titulo, email, fecha, descripcion, tipo)
 *  - Seleccionado: empleo favorito del administrador (mismos campos que Empleo)
 *  - SesionResult: resultado del login (ok, nombre)
 * @type {import('graphql').GraphQLSchema}
 */
module.exports = buildSchema(`

  type Usuario {
    id: ID
    nombre: String
    email: String
  }

  type Empleo {
    id: ID
    titulo: String
    email: String
    fecha: String
    descripcion: String
    tipo: String
  }

  type Seleccionado {
    id: ID
    titulo: String
    email: String
    fecha: String
    descripcion: String
    tipo: String
  }

  type SesionResult {
    ok: Boolean
    nombre: String
  }

  type Query {
    obtenerUsuarios: [Usuario]
    obtenerUsuarioActivo: String
    obtenerEmpleos: [Empleo]
    obtenerSeleccionados: [Seleccionado]
  }

  type Mutation {
    crearUsuario(nombre: String!, email: String!, password: String!): Usuario
    borrarUsuario(email: String!): Boolean
    loguearUsuario(email: String!, password: String!): SesionResult
    cerrarSesion: Boolean

    crearEmpleo(titulo: String!, email: String!, fecha: String!, descripcion: String!, tipo: String!): Empleo
    actualizarEmpleo(id: ID!, titulo: String, email: String, fecha: String, descripcion: String, tipo: String): Empleo
    borrarEmpleo(id: ID!): Boolean

    guardarSeleccion(id: ID!, titulo: String!, email: String!, fecha: String!, descripcion: String!, tipo: String!): Seleccionado
    borrarSeleccion(id: ID!): Boolean
  }
`);
