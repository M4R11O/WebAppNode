const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: true
}));

// Almacenamiento de usuarios
const users = {};

// Ruta para el formulario de registro
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/pages/register.html');
});

// Ruta para manejar el registro
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.send('El usuario ya existe. Elige otro nombre de usuario.');
    }

    users[username] = password;
    res.send(`Usuario ${username} registrado exitosamente! Puedes iniciar sesión ahora.`);
});

// Ruta para el formulario de login
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/pages/login.html');
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.send('Credenciales incorrectas. Inténtalo de nuevo.');
    }
});

// Ruta para verificar el estado del usuario
app.get('/user', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error al cerrar sesión.');
        }
        res.send('Has cerrado sesión.');
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/main.html');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});