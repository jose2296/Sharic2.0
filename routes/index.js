var express = require('express');
var router = express.Router();

var firebase = require('firebase');

var datos;
var usuario;
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('Inicio');
});


router.get('/Registro', function (req, res, next) {
    res.render('Registro', {title: 'Registro'});
});


router.get('/Login', function (req, res, next) {
    console.log(req.session.userName);

    if (req.session.userName) {

        usuario = firebase.auth().currentUser;
        var usuarioUid = usuario.uid;

        firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {

            var datosUsuario = dataSnapshot.val()[usuarioUid];
            console.log(datosUsuario, usuarioUid);

            res.render('Perfil', {
                    datos: datosUsuario
                }
            );

        })
    } else {
        res.render('Login', {title: 'Login'});
    }
});

router.get('/Perfil', function (req, res, next) {
    if (req.session.userName) {
        console.log("PERFIL" + datos.nombre);
        res.render('Perfil', {datos: datos});
    } else {
        res.render("Login")
    }

});


router.get("/cerrar", function (req, res, next) {
    req.session.destroy();
    res.render("Login");
});


router.get("/eliminarUsuario", function (req, res, next) {

    usuario = firebase.auth().currentUser;

    firebase.database().ref("usuarios/" + usuario.uid).remove()
        .then(function (t) {
            console.log(t);
            usuario.delete()
                .then(function (t) {
                    console.log("Usuario Elimiando", t);
                    req.session.destroy();
                    res.render("Registro");
                })
        });


})


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
                    /*console.log(datosUsuario, usuarioUid);

                    console.log(datosUsuario.nombre);*/

                    if (!datosUsuario) {
                        res.render('DatosUsuario');
                    } else {
                        req.session.userName = datosUsuario.nombre;
                        datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

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


    var usuarios = firebase.database().ref("usuarios/" + usuario.uid);
    usuarios.set({
        "nombre": req.body.nombre,
        "descripcion": req.body.descripcion,
        "canciones": 0,
        "playlists": 0
    });


    usuario = firebase.auth().currentUser;
    var usuarioUid = usuario.uid;

    firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {

        var datosUsuario = dataSnapshot.val()[usuarioUid];
        /*console.log(datosUsuario, usuarioUid);

        console.log(datosUsuario.nombre);*/


        req.session.userName = datosUsuario.nombre;
        datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

        res.render('Perfil', {
                datos: datosUsuario
            }
        );

    })


});


//Acceso a la vista TopCanciones con los datos del usuario de firebase, encaso de no haber iniciado session se va al login
router.get("/TopCanciones", function (req, res, next) {

    if (req.session.userName) {
        usuario = firebase.auth().currentUser;
        var usuarioUid = usuario.uid;

        firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {

            var datosUsuario = dataSnapshot.val()[usuarioUid];
            /*console.log(datosUsuario, usuarioUid);

            console.log(datosUsuario.nombre);*/


            req.session.userName = datosUsuario.nombre;
            datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

            res.render("TopCanciones", {pagina: "Top Canciones", datos: datos})


        })
    } else {
        res.render("Login")
    }

})


//Post de la nueva cancion (TOPCANCIONES) del usuario a la base de datos
router.post("/TopCanciones", function (req, res, next) {

    //console.log(req.body);

    usuario = firebase.auth().currentUser;
    var usuarioUid = usuario.uid;


    var canciones = [];


    len = datos.canciones.length;
    for (i = 0; i < len; i += 1) {
        canciones.push(datos.canciones[i])

    }

    canciones.push(req.body.cancion);

    firebase.database().ref("usuarios/" + usuarioUid + "/canciones")
        .push(
            canciones
        )

    firebase.database().ref("usuarios/").once("value", function (dataSnapshot) {
        var datosUsuario = dataSnapshot.val()[usuarioUid];
        req.session.userName = datosUsuario.nombre;
        datos = datosUsuario;//Para poder enviar los datos al get de /Perfil

        res.render("TopCanciones", {pagina: "Top Canciones", datos: datos})
    })
})


module.exports = router;
