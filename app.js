// Requires
var express = require('express');
var mongoose =  require('mongoose');
var bodyParser = require('body-parser')

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquesRoutes = require('./routes/busqueda');
var loginRoutes = require('./routes/login');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', ( err, res) => {
	if (err) throw err;

	console.log('Base da datos \x1b[32m%s\x1b[0m', 'online');

});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquesRoutes);
app.use('/upload', uploadRoutes);
app.use('/login', loginRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);//Esta debe ser la ultima ruta

// Escuchar peticiones
app.listen(3000, () => console.log('Express server puerto 3000 \x1b[32m%s\x1b[0m', 'online'));