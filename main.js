const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const session = require('express-session'); // Necesitarás un paquete diferente para manejar sesiones sin Express

const PORT = 3000;

// Almacenamiento de usuarios
const users = {};

// Crear un servidor HTTP
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Manejo de rutas
    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile('./pages/main.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Página no encontrada');
                return;
            }
            res.end(data);
        });
    } else if (pathname === '/register') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile('./pages/register.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Página no encontrada');
                return;
            }
            res.end(data);
        });
    } else if (pathname === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile('./pages/login.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Página no encontrada');
                return;
            }
            res.end(data);
        });
    } else if (pathname === '/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir Buffer a string
        });
        req.on('end', () => {
            const { username, password } = querystring.parse(body);

            if (users[username]) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('El usuario ya existe. Elige otro nombre de usuario.');
            }

            users[username] = password;
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Usuario ${username} registrado exitosamente! Puedes iniciar sesión ahora.`);
        });
    } else if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir Buffer a string
        });
        req.on('end', () => {
            const { username, password } = querystring.parse(body);

            if (users[username] && users[username] === password) {
                // Aquí deberías manejar la sesión de manera diferente
                res.writeHead(302, { Location: '/' });
                res.end();
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Credenciales incorrectas. Inténtalo de nuevo.');
            }
        });
    } else if (pathname === '/user') {
        // Aquí deberías manejar la sesión de manera diferente
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ loggedIn: false })); // Cambia esto según tu lógica de sesión
    } else if (pathname === '/logout') {
        // Aquí deberías manejar la sesión de manera diferente
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Has cerrado sesión.'); // Cambia esto según tu lógica de sesión
    } else {
        res.writeHead(404);
        res.end('Página no encontrada');
    }
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});