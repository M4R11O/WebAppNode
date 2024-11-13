//Importa los módulos necesarios
const mysql = require('mysql'); // Módulo para conectar con MySQL
const fs = require('fs'); // Módulo para trabajar con el sistema de archivos

//Configura la conexión a la base de datos utilizando variables de entorno
const connection = mysql.createConnection({
	host: process.env.DB_HOST, // Host de la base de datos
	user: process.env.DB_USER, // Usuario de la base de datos
	password: process.env.DB_PASSWORD, // Contraseña del usuario de la base de datos
	database: process.env.DB_DATABASE, // Nombre de la base de datos
	port: process.env.DB_PORT, // Puerto de la base de datos
	ssl: {
		ca: fs.readFileSync("./ssl/DigiCertGlobalRootG2.crt.pem"), // Lee el certificado ssl desde el sistema de archivos
		rejectUnauthorized: false // Desactiva la verificacion del certificado
	}
});

// Conecta a ala base de datos y maneja errores de conexión
connection.connect((error) => {
	if (error) {
		console.log('El error de conexion es: ' + error); // Muestra el error de conexion
		return;
	}
	console.log('¡Conectado a la base de datos! :)'); // Confirma que la conexión fue exitosa
});

// Exportar la conexión para que se pueda utilizar en el resto de modulos.
module.exports = connection;