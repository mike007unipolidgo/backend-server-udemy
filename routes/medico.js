var express =  require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var MWDAuth = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//===================================================
// OBTENER TODOS LOS MÉDICOS
//===================================================
app.get('', (req, res) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Medico.find({}).populate('usuario', 'nombre email').populate('hospital')
	.skip(desde)
	.limit(5)
	.exec( (err, medicos) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando medicos',
				errors: err
			})
		}
		Medico.count( {}, ( err, conteo ) => {
			res.status(200).json({
				ok: true,
				medicos: medicos,
				total: conteo
			});		
		} );
	});
});


//==================================================
// ACTUALIZAR MÉDICO
//===================================================
app.put('/:id', MWDAuth.verificaToken, (req, res) =>{
	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar medico',
				errors: err
			});
		}
		if (!medico){
			return res.status(400).json({
				ok: false,
				mensaje: 'El medico con el id '+id+' no existe',
				errors: {message: 'No existe un medico con ese ID'}
			});
		}
		medico.nombre = body.nombre;
		medico.hospital = body.hospitalID;
		medico.usuario = req.usuario._id;
		medico.save( (err, medicoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar médico',
					errors: err
				});
			}

			return res.status(200).json({
				ok: true,
				medico: medicoGuardado
			});
		});
	});
});

//==================================================
// CREAR NUEVO MÉDICO
//===================================================
app.post('/', MWDAuth.verificaToken, (req, res) =>{
	var body = req.body;
	var medico = new Medico({
		nombre: body.nombre,
		img: body.img,
		hospital: body.hospitalID,
		usuario: req.usuario._id
	});

	medico.save( (err, medicoGuardado) => {

		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error cargando medicos',
				errors: err
			})
		}
		res.status(201).json({
			ok: true,
			medico: medicoGuardado,
			usuariotoken: req.usuario
		});
	});
});

//==================================================
// BORRAR UN MÉDICO POR ID
//===================================================
app.delete('/:id', MWDAuth.verificaToken, (req, res) => {
	var id = req.params.id;
	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar el medico',
				errors: err
			})
		}
		if (!medicoBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un médico con ese ID',
				emessage: {message: 'No existe un médico con ese ID'}
			})
		}
		res.status(200).json({
			ok: true,
			medico: medicoBorrado
		});
	});
});


module.exports = app;