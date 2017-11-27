var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');
var firebase = require('firebase');

var datos;
var usuario;


var clientId = "22f91a46b6aa44ed93001f9230b9abff";
var clientSecret = "7eba33c8ac1a43a99f670324b3df8938";
var redirect = "http://localhost:3000/DatosUsuario";


var https = require('https');
var auth = 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64');
var data = {
	grant: 'grant_type=authorization_code&',
	code: "",
	refresh_token: "",
	token: "",
	uri: "redirect_uri=" + redirect
};

var options = {
	hostname: 'accounts.spotify.com',
	path: '/api/token',
	method: 'POST',
	headers: {
		'Authorization': auth,
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded'
	}
};

// var r = https.request(options, function (res) {
// 	console.log(res.statusCode);
// 	res.on('data', function (c) {
// 		console.log(JSON.parse(c));
//
// 	});
// });
//
// r.write(data.grant + data.code + data.uri);
// r.end();

// credentials are optional
// var spotifyApi = new SpotifyWebApi({
//     clientId: clientId,
//     clientSecret: clientSecret,
//     redirectUri: redirect
// });

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('Inicio');
});

/* GET Pagina de registro */
router.get('/Registro', function (req, res, next) {
	res.render('Registro', {title: 'Registro'});
});


function cogerDatosUsuarioDByRendePerfil(req, res, session) {
	usuario = firebase.auth().currentUser;
	var usuarioUid = usuario.uid;

	firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {
		var datosUsuario = dataSnapshot.val()[usuarioUid];
		datos = datosUsuario;
		if (session) {
			req.session.userName = datosUsuario.nombre;
		}
		res.render('Perfil', {datos: datosUsuario}
		);
	})
}


/* GET Pagina de login.
*       Si ya hay un usuario logeado renderizar su perfil
*       No hay usuario logeado render Login*/
router.get('/Login', function (req, res, next) {
	if (req.session.userName) {

		cogerDatosUsuarioDByRendePerfil(req, res, false)
	} else {
		res.render('Login', {title: 'Login'});
	}
});

router.get('/Perfil', function (req, res, next) {
	if (req.session.userName) {
		res.render('Perfil', {datos: datos});
	} else {
		res.render("Login", {title: 'Login'})
	}

});


router.get("/cerrar", function (req, res, next) {
	firebase.auth().signOut().then(function () {
		console.log("Session cerrada con firebase");
	}).catch(function (error) {
		// An error happened.
	});
	req.session.destroy();
	res.render("Login");
});

router.get("/eliminarUsuario", function (req, res, next) {
	usuario = firebase.auth().currentUser;

	firebase.database().ref("usuarios/" + usuario.uid).remove();

	usuario.delete()
		.then(function (t) {
			console.log("Usuario Elimiando", t);
			req.session.destroy();
			res.render("Registro");
		})
})


router.post('/registroComp', function (req, res, next) {

	firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.contraseña)
		.then(function (t) {
			usuario = firebase.auth().currentUser;
			usuario.sendEmailVerification()
				.then(function () {
					console.log(req.body);
					res.render('Login', {title: 'Login'});
					// Email sent.
				}).catch(function (error) {
				console.log(error);
			});

		})
		.catch(function (error) {
			console.log(error);
			res.render('Registro', {title: 'Registro', error: "Ya existe un usuario con ese correo"});
		});
});


router.post('/Login', function (req, res, next) {
	//console.log(req.body);
	firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.contraseña)
		.then(function (t) {
			//console.log(t);
			usuario = firebase.auth().currentUser;
			var usuarioUid = usuario.uid;
			if (usuario.emailVerified) {

				firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {

					var datosUsuario = dataSnapshot.val()[usuarioUid];

					if (!datosUsuario) {


						res.redirect("https://accounts.spotify.com/authorize/?" +
							"client_id=" + clientId +
							"&response_type=code&" +
							"redirect_uri=" + redirect
						);
						// res.render('DatosUsuario',{title:"DatosUsuario"});
					} else {
						req.session.userName = datosUsuario.nombre;
						datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

						res.render('Perfil', {datos: datosUsuario});
					}
				})
			} else {
				console.log("Correo no verificado");
				res.render('Login', {title: 'Login', warning: "Correo no verificado"});
			}
		})
		.catch(function (error) {
			console.log(error);
			res.render('Login', {title: 'Login', error: "Usuario no encontrado"});
		});
});

router.get("/DatosUsuario", function (req, res, next) {


	data.code = "code=" + req.query.code + "&";


	var r = https.request(options, function (res) {
		console.log(res.statusCode);
		res.on('data', function (c) {

			c = JSON.parse(c);
			data.token = "access_token=" + c.access_token + "&";
			data.refresh_token = "refresh_token=" + c.refresh_token + "&";

			console.log(data.token)
			console.log(data.refresh_token)


		})
	});

	r.write(data.grant + data.code + data.uri);
	r.end();
	res.render('DatosUsuario', {title: "DatosUsuario"})

});

router.post('/datosUsuario', function (req, res, next) {
	var usuarios = firebase.database().ref("usuarios/" + usuario.uid);
	usuarios.set({
		"nombre": req.body.nombre,
		"descripcion": req.body.descripcion,
		"canciones": 0,
		"playlists": 0
	});

	cogerDatosUsuarioDByRendePerfil(req, res, true);
});


//TopCaniones y playlist del Perfil añadir y visualizar los datos de la base de datos
function cogerDatosUsuarioRenderVista(req, res, vista) {
	usuario = firebase.auth().currentUser;
	var usuarioUid = usuario.uid;

	firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {

		var datosUsuario = dataSnapshot.val()[usuarioUid];
		req.session.userName = datosUsuario.nombre;
		datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

		res.render(vista, {pagina: vista, datos: datos,data:data.token})
	})
}

//Acceso a la vista TopCanciones con los datos del usuario de firebase, encaso de no haber iniciado session se va al login
router.get("/TopCanciones", function (req, res, next) {
	if (req.session.userName) {
		cogerDatosUsuarioRenderVista(req, res, "TopCanciones");
	} else {
		res.render("Login", {title: "Login"})
	}
});


router.get("/Playlists", function (req, res, next) {
	if (req.session.userName) {
		cogerDatosUsuarioRenderVista(req, res, "Playlists");
	} else {
		res.render("Login", {title: "Login"})
	}
});


function añadirDatosDB(req, res, vista, elementoDB, variablePost) {
	usuario = firebase.auth().currentUser;
	var usuarioUid = usuario.uid;
	firebase.database().ref("usuarios/" + usuarioUid + "/" + elementoDB)
		.push(
			req.body[variablePost]
		);

	firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {
		var datosUsuario = dataSnapshot.val()[usuarioUid];
		req.session.userName = datosUsuario.nombre;
		datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

		res.render(vista, {pagina: vista, datos: datos})
	})
}


//Post de la nueva cancion (TOPCANCIONES) del usuario a la base de datos
router.post("/TopCanciones", function (req, res, next) {
	añadirDatosDB(req, res, "TopCanciones", "canciones", "cancion")
});

router.post("/Playlists", function (req, res, next) {
	añadirDatosDB(req, res, "Playlists", "playlists", "playlist")
});


module.exports = router;
