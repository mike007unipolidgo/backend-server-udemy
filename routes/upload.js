var express =  require('express');
var fileUpload = require('express-fileupload');
var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

var fs = require('fs');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {
	var tipo = req.params.tipo;
	var id = req.params.id;

	//Tipos de colección
	var tiposValidos = ['usuarios', 'hospitales', 'medicos'];

	if(tiposValidos.indexOf( tipo ) < 0){
		return res.status(400).json({
			ok: false,
			mensaje: 'Tipo de colecció no es válida',
			errors: {message: 'Tipo de colecció no es válida'}
		});
	}

	if(!req.files){
		return res.status(400).json({
			ok: false,
			mensaje: 'No seleccionó nada',
			errors: {message: 'Debe seleccionar ua imagen'}
		});
	}
	// Obtener nombre del archivo
	var archivo = req.files.imagen;
	var nombreCortado = archivo.name.split('.');
	var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

	//Solo estas extenciones aceptamos
	var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if(extensionesValidas.indexOf( extensionArchivo ) < 0){
		return res.status(400).json({
			ok: false,
			mensaje: 'Extensión no válida',
			errors: {message: 'Las extesiones validas son ' + extensionesValidas.join(', ')}
		});
	}

	//Nombre de archivo personalizado
	var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

	//Mover el archivo a un path
	var path = `./uploads/${tipo}/${nombreArchivo}`;

	archivo.mv( path, err => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al mover archivo',
				errors: err
			});
		}

		subirPorTipo( tipo, id, nombreArchivo, res );

	});
});

//==================== FUNCIÓN =====================>
function subirPorTipo( tipo, id, nombreArchivo, res ){
	
	if(tipo == 'usuarios'){		
		Usuario.findById( id, ( err, usuario ) =>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar usuario en la DB',
					errors: err
				});
			}
			
			if (!usuario){
				return res.status(400).json({
					ok: false,
					mensaje: 'Usuario no existe',
					errors: {message: 'Usuario no existe'}
				});
			}

			var pathViejo = './uploads/usuarios/' + usuario.img;
			//Si esxiste, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}
			usuario.img = nombreArchivo;
			usuario.save( ( err, usuarioActualizado ) => {
				if(err){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al guardar la imagen del usuario',
						errors: err
					});
				}
				usuarioActualizado.password = ':)';
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de usuario actualizada',
					usuario: usuarioActualizado	
				});
			});
			
		});
	}

	if(tipo == 'hospitales'){
		Hospital.findById( id, ( err, hospital ) =>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar hospital en la DB',
					errors: err
				});
			}
			
			if (!hopital){
				return res.status(400).json({
					ok: false,
					mensaje: 'Hospital no existe',
					errors: {message: 'Hospital no existe'}
				});
			}

			var pathViejo = './uploads/hospitales/' + hospital.img;
			//Si esxiste, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}
			hospital.img = nombreArchivo;
			hospital.save( ( err, hopitalActualizado ) => {
				if(err){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al guardar la imagen del hospital',
						errors: err
					});
				}
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de hospital actualizada',
					hospital: hopitalActualizado	
				});
			});
			
		});
	}

	if(tipo == 'medicos'){
		Medico.findById( id, ( err, medico ) =>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar medico en la DB',
					errors: err
				});
			}

			if (!medico){
				return res.status(400).json({
					ok: false,
					mensaje: 'Medico no existe',
					errors: {message: 'Medico no existe'}
				});
			}

			var pathViejo = './uploads/medicos/' + medico.img;
			//Si esxiste, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}
			medico.img = nombreArchivo;
			medico.save( ( err, medicoActualizado ) => {
				if(err){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al guardar la imagen del medico',
						errors: err
					});
				}
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de medico actualizada',
					medico: medicoActualizado	
				});
			});
			
		});
	}
}

module.exports = app;