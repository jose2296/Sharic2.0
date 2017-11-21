var express = require('express');
var router = express.Router();

var firebase= require('firebase');

/* GET home page. */
router.get('/', function (req, res, next) {

    var usuarios = [];

    firebase.database().ref("usuarios/").once("value").then(function (snapshot) {
        console.log(snapshot.val())
        //res.render('Inicio', {title: 'Inicio',usuarios: snapshot.val()});
    });



});


router.get('/Registro', function (req, res, next) {
    res.render('Registro', {title: 'Registro'});
});

router.post('/registroComp', function (req, res, next) {
    console.log(req.body);
    var usuarios = firebase.database().ref("usuarios/");
    usuarios.push({
        "nombre": req.body.nombre,
        "contraseña": req.body.contraseña
    });

    res.render('Registro', {title: 'Registro'});
});

module.exports = router;
