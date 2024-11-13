// 1. Se invoca a express
const express = require('express');
const app = express(); // Crea una instancia de la aplicación Express

//2. Se setea el urlencoded para poder capturar datos desde formulario
app.use(express.urlencoded({ extended: false })); // Permite capturar datos codificados en URL desde formulario
app.use(express.json()); // Permite capturar datos en formato JSON

//3. Se invoca a dotenv para utilizar variables de entorno
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' }); // Carga las variables de entorno desde el archivo .env

//4. Se setea el Directorio public
app.use('/resources', express.static('public')); // Sirve archivos estaticos desde el directorio public'
app.use('/resources', express.static(__dirname + '/public')); // Sirve archivos estaticos desde el directorio dirname + 'public´

//5. Establecer el motor de plantillas
app.set('view engine', 'ejs'); // Configura EJS como el motor de plantillas para renderizar vistas

//6. Invocamos a bcyrptjs para gestionar passwords
const bcryptjs = require('bcryptjs'); // Importa bcryptjs para manejar el hashing de contraseñas

//7. Var. de session
const session = require('express-session');
app.use(session({
	secret: 'secret', // Clave secreta para firmar la sesión
	resave: true, // Fuerza la sesión a ser guardada en la tienda incluso si no ha sido modificada
	saveUninitialized: true // Guarda una sesión no inicializada
}));

//8. Invocamos al modulo de conexión de la DB
const connection = require('./database/db'); // Importa el módulo de conexión a la base de datos

//9. Establecer rutas
app.get('/', (req, res) => {
	res.render('index.ejs'); // Renderiza la vista 'index.ejs' cuando se accede a la raiz
})

app.get('/register', (req, res) => {
	res.render('register.ejs'); // Renderiza la vista 'register.ejs' cuando se accede a '/register'
})

app.get('/login', (req, res) => {
	res.render('login.ejs'); // Renderiza la vista 'login.ejs' cuando se accede a '/login'
})

app.get('/subscripciones', (req, res) => {
    res.render('subscripciones.ejs'); // Renderiza la vista 'subscripciones.ejs'
})

app.get('/tablero', (req, res) => {
	res.render('tablero.ejs'); // Renderiza la vista 'login.ejs' cuando se accede a '/login'
})

// Registro de Usuarios
app.post('/register', async (req, res) => {
	// Extrae los datos del cuerpo de la solicitud
	const rut = req.body.rut;
	const nombre = req.body.nombre;
	const rol = req.body.rol;
	const pass = req.body.pass;

	// Hashea la contraseña usando bcryptjs con una sal de longitud 8
	let passwordHaash = await bcryptjs.hash(pass, 8);

	// Inserta el nuevo usuario en la base de datos
	connection.query('INSERT INTO usuario SET ?', {Rut: rut, Nombre: nombre, Rol: rol, Password: passwordHaash}, (error, results) => {
		if (error) {
			// Muestra errores en la consola
			console.log(error);
		} else {
			// Renderiza una vista de éxito en el registro
			res.render('register', {
				alert: true,
				alertTitle: "Registro",
				alertMessage: "Usuario registrado con éxito :)",
				alertIcon: 'success',
				showConfirmButton: false,
				timer: 3500,
				ruta: 'login'
			});
		}
	});
});

app.post('/auth', async (req, res) => {
    // Extrae los datos del cuerpo de la solicitud
    const rut = req.body.rut;
    const pass = req.body.pass;

    // Verifica que se hayan proporcionado tanto el rut como la contraseña
    if (rut && pass) {
        // Busca el usuario en la base de datos
        connection.query('SELECT * FROM usuario WHERE Rut = ?', [rut], async function (error, results) {
            if (error) {
                console.log(error);
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error en la base de datos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else if (results.length == 0) {
                // Si el rut no existe, renderiza una vista de error
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Rut y/o contraseña incorrectas :(",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                // Si el usuario existe, verifica que la contraseña esté definida
                const hashedPassword = results[0].Password;
                if (!hashedPassword) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Error al verificar la contraseña",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                    return;
                }

                // Compara la contraseña ingresada con la contraseña hasheada
                const isMatch = await bcryptjs.compare(pass, hashedPassword);
                if (!isMatch) {
                    // Si la contraseña es incorrecta, renderiza una vista de error
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Rut y/o contraseña incorrectas :(",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    // Si el login es correcto, guarda el nombre del usuario en la sesión
                    req.session.name = results[0].Nombre;

                    // Renderiza una vista de éxito en el login
                    res.render('index', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "!LOGIN CORRECTO BIENVENIDO¡",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        ruta: '/'
                    });
                }
            }
        });
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Por favor ingresa rut y contraseña",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
});


// Autenticacion de Paginas
app.get('/', (req, res) => {
	// Verifica si el usuario esta autenticado
	if (req.session.loggedin) {
		//si esta autenticado, renderiza la vista 'index' con el estado de login y el nombre del usuario
		res.render('index', {
			login: true,
			name: req.session.name
		});
	} else {
		// Si no está autenticado, renderiza la vista 'login' con un mensaje indicando que debe iniciar sesion
		res.render('login', {
			login: false,
			name: 'Debe iniciar sesion'
		});
	}
});

// Inicio del Servidor
app.listen(3000, (req, res) => {
	console.log('SERVER RUNNING IN http://localhost:3000');
});