// src/schema.js
const { buildSchema } = require('graphql');

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
    borrarEmpleo(id: ID!): Boolean

    guardarSeleccion(id: ID!, titulo: String!, email: String!, fecha: String!, descripcion: String!, tipo: String!): Seleccionado
  }
`);
