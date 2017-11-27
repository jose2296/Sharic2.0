/*
    Autor: Jose Manuel Jerez Muñoz
    Fecha: 27/11/2017
    Licencia: gpl30
    Version: 1.0
    Descripccion: 
 */
function buscar() {
	document.getElementById("respuesta").innerHTML="";
	$.ajax({
		type: 'GET',
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: document.getElementById("buscar").value,
			type:"track",
			limit:"5"

		},beforeSend : function( xhr ) {
			xhr.setRequestHeader( 'Authorization', ' Bearer ' + "BQC67jWrsjAOXvHyjc7wApvodDUB-Tz_mqY_SWoWQdDDsFP7c-lqodBnyRqJV9UQH0m78SsYXUZqHZtDJS26e88UULu9W88kVHFhSOd2kD7z7TmEiNh921shitbKUg1lzkGIEIUsF8Zu2J0" );
		},
		success: function (reply) {
			for (var i = 0; i < reply.tracks.items.length; i++) {
				document.getElementById("respuesta").innerHTML+="<h1>"+i+" "+reply.tracks.items[i].name+ " Artista: " + reply.tracks.items[i].album.artists[0].name +"</h1>"

			}

		}
	});

}


console.log(data.token);