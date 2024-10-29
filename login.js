const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

// Middleware
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
    res.send(`
        <form method="POST" action="/register">
            <label for="username">Usuario:</label>
            <input type="text" id="username" name="username" required>
            <br>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <button type="submit">Registrar</button>
        </form>
    `);
});

// Ruta para manejar el registro
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.send('El usuario ya existe. Elige otro nombre de usuario.');
    }

    // Registrar el nuevo usuario
    users[username] = password;
    res.send(`Usuario ${username} registrado exitosamente! Puedes iniciar sesión ahora.`);
});

// Ruta para el formulario de login
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <label for="username">Usuario:</label>
            <input type="text" id="username" name="username" required>
            <br>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <button type="submit">Iniciar sesión</button>
        </form>
    `);
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.redirect('/'); // Redirige a la página principal
    } else {
        res.send('Credenciales incorrectas. Inténtalo de nuevo.');
    }
});

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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});