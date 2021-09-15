function gerarToken() {
    var usuariosip = document.getElementById("usuariosip").value;
    var usertoken = document.getElementById("usertoken").value;
    localStorage.setItem('usersip', usuariosip);
    var data = "username=" + usuariosip + "&password=" + usertoken + "&grant_type=password";
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            debugger
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            localStorage.setItem('access_token', obj.access_token);
            document.getElementById("accesstoken").value = obj.access_token;
            ConsultarSaldo();
        }
    });
    xhr.open("POST", "https://api.nvoip.com.br/v2/oauth/token");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic TnZvaXBBcGlWMjpUblp2YVhCQmNHbFdNakl3TWpFPQ==");
    xhr.send(data);
}
var access_token_global = localStorage.getItem('access_token')
var usuario_sip_global = localStorage.getItem('usersip')
function realizarChamada() {
    var request = new XMLHttpRequest();
    var calledCall = document.getElementById("calledCall").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/calls/');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("retornaruuid").value = obj.callId;
            document.getElementById("retornaruuid").type = "text";
        }
    };
    var body = {
        'caller': usuario_sip_global,
        'called': calledCall
    };
    request.send(JSON.stringify(body));
}
function disparoSMS() {
    var numDestino = document.getElementById("numDestino").value;
    var mensagem = document.getElementById("mensagem").value;
    var request = new XMLHttpRequest();
    request.open('POST', 'https://api.nvoip.com.br/v2/sms');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
        }
        if (this.status == 200) {
            document.getElementById("statusSMS").value = "SMS enviado com sucesso!";
            document.getElementById("statusSMS").type = "text";
        } else if (this.status != 200) {
            document.getElementById("statusSMS").value = "SMS não disparado!";
            document.getElementById("statusSMS").type = "text";
        }
    };
    var body = {
        'numberPhone': numDestino,
        'message': mensagem,
        'flashSms': false
    };
    request.send(JSON.stringify(body));
}
function disparoVoz() {
    var e = document.getElementById("select");
    var option = e.options[e.selectedIndex].value;
    var numeroDestino = document.getElementById("numeroDestino").value;
    var audio = document.getElementById("audio").value;
    var audio2 = document.getElementById("audio2").value;
    var request = new XMLHttpRequest();
    request.open('POST', 'https://api.nvoip.com.br/v2/torpedo/voice');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("retornoDTMF").value = obj.dtmf;
            document.getElementById("retornoDTMF").type = "text";
        }
    };
    if (option == "simples") {
        var body = {
            'caller': usuario_sip_global,
            'called': numeroDestino,
            'audios': [{
                'audio': "" + audio + "",
                'positionAudio': 1
            }],
            'dtmfs': []
        };
    } else if (option == "interativo") {
        var body = {
            "caller": usuario_sip_global,
            "called": numeroDestino,
            "audios": [{
                "audio": "" + audio + "",
                "positionAudio": 1
            }],
            "dtmfs": [{
                "audio": "" + audio2 + "",
                "positionAudio": 2,
                "timedtmf": "4000",
                "timeout": "30",
                "min": "0",
                "max": "1"
            }]
        }
    }
    request.send(JSON.stringify(body));
}
function ConsultarSaldo() {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.nvoip.com.br/v2/balance');
    var access_token_local = localStorage.getItem('access_token');
    if (access_token_local == null || access_token_local == undefined) {
        document.getElementById("saldo").value = "Saldo: R$";
    } else {
        request.setRequestHeader('Authorization', 'Bearer ' + access_token_local);
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                console.log('Status:', this.status);
                console.log('Headers:', this.getAllResponseHeaders());
                console.log('Body:', this.responseText);
                var json = this.response;
                var obj = JSON.parse(json);
                document.getElementById("saldo").value = "Saldo: R$" + obj.balance;
                //document.getElementById("saldo").type = "text";
            }
        }
    
    };
    request.send();
}
function consultarChamada() {
    var data = "";
    var uuid = document.getElementById("retornaruuid").value;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("duracaochamada").value = obj.talkingDurationSeconds;
            document.getElementById("statuschamada").value = obj.state;
            document.getElementById("linkgravacao").value = obj.linkAudio;
        }
    });
    xhr.open("GET", "https://api.nvoip.com.br/v2/calls?callId=" + uuid);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token_global);
    xhr.send(data);
}
function enviarCodigo2fa() {
    var request = new XMLHttpRequest();
    var email = document.getElementById("2faemail").value;
    var numero = document.getElementById("2fanumero").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/2fa');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("2fatoken").value = obj.token2fa;
        }
    };
    var body = {
        'email': "" + email + "",
        'cellPhone': "" + numero + "",
    };
    request.send(JSON.stringify(body));
}
function enviarOTP() {
    var request = new XMLHttpRequest();
    var SMS = document.getElementById("OTPSMS").value;
    var voice = document.getElementById("OTPvoice").value;
    var email = document.getElementById("OTPemail").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/otp');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            if (this.status == 200) {
                var json = this.response;
                var obj = JSON.parse(json);
                document.getElementById("OTPcodigo").value = 'Mensagem enviada com sucesso!';
                document.getElementById("OTPcodigo").type = "text";
                document.getElementById("keyOTP").value = obj.key;
                document.getElementById("keyOTP").type = "text";
            } else {
                document.getElementById("OTPcodigo").value = 'Mensagem não enviada!';
            }
        }
    };
    var body = {
        "sms": "" + SMS + "",
        "voice": "" + voice + "",
        "email": "" + email + ""
    };
    request.send(JSON.stringify(body));
}
function verificar2fa() {
    var data = "";
    var pin = document.getElementById("2facodigo").value;
    var token2fa = document.getElementById("2fatoken").value;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            if (this.status == '400') {
                document.getElementById("2faretorno").value = obj.message;
                document.getElementById("2faretorno").type = "text";
            } else {
                document.getElementById("2faretorno").value = obj.status;
                document.getElementById("2faretorno").type = "text";
            }
        }
    });
    xhr.open("GET", "https://api.nvoip.com.br/v2/check/2fa?token2fa=" + token2fa + "&pin=" + pin);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token_global);
    xhr.send(data);
}
function agendarTorpedo() {
    var request = new XMLHttpRequest();
    var numeroDestino = document.getElementById("agendarTorpedo").value;
    var mensagem = document.getElementById("agendarMensagem").value;
    var data = document.getElementById("data").value;
    var hora = document.getElementById("hora").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/sched/torpedo');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token_global);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            if (this.status == 200) {
                document.getElementById("agendarTorpedoRetorno").value = "Torpedo Agendado com Sucesso!";
                document.getElementById("agendarTorpedoRetorno").type = "text";
            } else if (this.status != 200) {
                document.getElementById("agendarTorpedoRetorno").value = "Torpedo não agendado!";
                document.getElementById("agendarTorpedoRetorno").type = "text";
            }
        }
    };
    var body = {
        'message': mensagem,
        'toNumber': numeroDestino,
        'schedulingDate': data + " " + hora
    };
    request.send(JSON.stringify(body));
}
function listarTorpedo() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            document.getElementById("exampleFormControlTextarea1").value = this.response;
        }
    });
    xhr.open("GET", "https://api.nvoip.com.br/v2/list/sched/torpedo");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token_global);
    xhr.send();
}
function excluirTorpedo() {
    var xhr = new XMLHttpRequest();
    var idTorpedo = document.getElementById("idTorpedo").value;
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });
    xhr.open("DELETE", "https://api.nvoip.com.br/v2/delete/sched/torpedo?schedkey=" + idTorpedo);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token_global);
    xhr.send();
}
function limparLista() {
    document.getElementById("exampleFormControlTextarea1").value = "";
}
function verificarOTP() {
    var request = new XMLHttpRequest();
    var code = document.getElementById("code").value;
    var key = document.getElementById("key").value;
    request.open('GET', 'https://api.nvoip.com.br/v2/check/otp?code=' + code + '&key=' + key);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            var json = this.response;
            var obj = JSON.parse(json);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            document.getElementById("OTPretorno").value = obj.message;
            document.getElementById("OTPretorno").type = "text";
        }
    };
    request.send();
}