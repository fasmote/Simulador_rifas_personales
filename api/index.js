// Vercel Serverless Function Entry Point
// Este archivo es el punto de entrada para todas las rutas del API en Vercel

const app = require('../backend/app');

// Exportar para Vercel Serverless
module.exports = app;
