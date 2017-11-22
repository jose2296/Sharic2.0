var express = require('express');
var router = express.Router();

var firebase = require('firebase');


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('Inicio')

});


router.get('/Registro', function (req, res, next) {
    res.render('Registro', {title: 'Registro'});
});


router.get('/Login', function (req, res, next) {
    res.render('Login', {title: 'Login'});
});

router.get('/Perfil', function (req, res, next) {
    res.render('Perfil', {title: 'Login'});
});

// router.get('/DatosUsuario', function (req, res, next) {
//     res.render('DatosUsuario', {title: 'DatosUsuario'});
// });


router.post('/registroComp', function (req, res, next) {
    //console.log(req.body);

    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.contraseña)
        .then(function (t) {
            usuario = firebase.auth().currentUser;


            usuario.sendEmailVerification()
                .then(function () {
                    console.log(req.body);
                    res.render('Login', {title: 'Login'});
                    // Email sent.
                }).catch(function (error) {
                // An error happened.
            });

        })
        .catch(function (error) {
            console.log(error);
            res.render('Registro', {title: 'Registro'});
        });


    // var usuarios = firebase.database().ref("usuarios/");
    // usuarios.push({
    // 	"nombre": req.body.nombre,
    // 	"contraseña": req.body.contraseña
    // });


});


router.post('/login', function (req, res, next) {
    //console.log(req.body);

    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.contraseña)
        .then(function (t) {
            //console.log(t);
            usuario = firebase.auth().currentUser;
            var usuarioUid = usuario.uid
            if (usuario.emailVerified) {

                firebase.database().ref("usuarios/").on("value", function (dataSnapshot) {

                    var datosUsuario = dataSnapshot.val()[usuarioUid];

                    console.log(datosUsuario,usuarioUid);

                    if (datosUsuario === undefined) {
                        res.render('DatosUsuario');
                    }else{
                        res.render('Perfil', {
                                datos: datosUsuario
                            }
                        );
                    }



                })


            } else {
                console.log("No verif");
                res.render('Login', {title: 'Login', warning: "Correo no verificado"});
            }
        })
        .catch(function (error) {
            console.log(error);
            res.render('Login', {title: 'Login', error: "Usuario no encontrado"});
        });


});

router.post('/datosUsuario', function (req, res, next) {
    console.log(req.body);


    var usuarios = firebase.database().ref("usuarios/"+usuario.uid);
    usuarios.set({
    	"nombre": req.body.nombre,
    	"descripcion": req.body.descripcion,
        "canciones": {"cancion1": "", "cancion2":""},
        "playlists": {"playlist1": "", "playlist2":""}
    });


    res.render('Login', {title: 'Login'});
});


module.exports = router;
