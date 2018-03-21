var express =  require('express');

var MWDAuth = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//==================================================
// OBTENER TODOS LOS HOSPITALES
//===================================================
app.get('', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({}).populate('usuario', 'nombre email')
	.skip(desde)
	.limit(5)
	.exec((err, hospitales) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando hospitales',
				errors: err
			})
		}
		Hospital.count({}, ( err, conteo ) => {
			res.status(200).json({
				ok: true,
				hospitales: hospitales,
				total: conteo
			});		
		});
	});
});


//==================================================
// ACTUALIZAR HOSPITAL
//===================================================
app.put('/:id', MWDAuth.verificaToken, (req, res) =>{
	var id = req.params.id;
	var body = req.body;

	Hospital.findById(id, (err, hospital) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}
		if (!hospital){
			return res.status(400).json({
				ok: false,
				mensaje: 'El hospital con el id '+id+' no existe',
				errors: {message: 'No existe un hospital con ese ID'}
			});
		}
		hospital.nombre = body.nombre;
		hospital.usuario = req.usuario._id;
		hospital.save( (err, hospitalGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar hospital',
					errors: err
				});
			}
			res.status(200).json({
				ok: true,
				hospital: hospitalGuardado
			});
		});
	});
});

//==================================================
// CREAR NUEVO HOSPITAL
//===================================================
app.post('/', MWDAuth.verificaToken, (req, res) =>{
	var body = req.body;
	var hospital = new Hospital({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id
	});

	hospital.save( (err, hospitalGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error cargando hospital',
				errors: err
			})
		}
		res.status(201).json({
			ok: true,
			hospital: hospitalGuardado
		});
	});
});

//==================================================
// BORRAR UN HOSPITAL POR ID
//===================================================
app.delete('/:id', MWDAuth.verificaToken, (req, res) => {
	var id = req.params.id;
	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar el hospital',
				errors: err
			})
		}
		if (!hospitalBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un hospital con ese ID',
				emessage: {message: 'No existe un hospital con ese ID'}
			})
		}
		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado
		});
	});
});


module.exports = app;