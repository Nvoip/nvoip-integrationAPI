function generateToken() {
    var userSip = document.getElementById("userSip").value;
    var usertoken = document.getElementById("usertoken").value;
    localStorage.setItem('usersip', userSip);
    var date = "username=" + userSip + "&password=" + usertoken + "&grant_type=password";
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            //debugger
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            localStorage.setItem('access_token', obj.access_token);
            document.getElementById("accesstoken").value = obj.access_token;
            consultBalance();
        }
    });
    xhr.open("POST", "https://api.nvoip.com.br/v2/oauth/token");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic TnZvaXBBcGlWMjpUblp2YVhCQmNHbFdNakl3TWpFPQ==");
    xhr.send(date);
}
var accessTokenGlobal = localStorage.getItem('access_token')
var userSipGlobal = localStorage.getItem('usersip')

function makeCall() {
    var request = new XMLHttpRequest();
    var calledCall = document.getElementById("calledCall").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/calls/');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
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
        'caller': userSipGlobal,
        'called': calledCall
    };
    request.send(JSON.stringify(body));
}

function SMSTrigger() {
  
    var destinationNumber = document.getElementById("destinationNumber").value;
    var message = document.getElementById("message").value;
    var request = new XMLHttpRequest();
    var flash =  "";
    
    //console.log(flash.checked);
    request.open('POST', 'https://api.nvoip.com.br/v2/sms');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
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

    if (document.getElementById('flashSMS').checked) {
        var flash = true;
    } else {
        var flash = false;
    }
    
    var body = {
        'numberPhone': destinationNumber,
        'message': message,
        'flashSms': flash,
    };
    request.send(JSON.stringify(body));
}

function voiceTrigger() {
    var e = document.getElementById("select");
    var option = e.options[e.selectedIndex].value;
    var destinationNumber = document.getElementById("destinationNumber").value;
    var audio = document.getElementById("audio").value;
    var audio2 = document.getElementById("audio2").value;
    var request = new XMLHttpRequest();
    request.open('POST', 'https://api.nvoip.com.br/v2/torpedo/voice');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
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
            'caller': userSipGlobal,
            'called': destinationNumber,
            'audios': [{
                'audio': "" + audio + "",
                'positionAudio': 1
            }],
            'dtmfs': []
        };
    } else if (option == "interativo") {
        var body = {
            "caller": userSipGlobal,
            "called": destinationNumber,
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

function consultBalance() {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.nvoip.com.br/v2/balance');
    var access_token_local = localStorage.getItem('access_token');
    console.log(access_token_local)
    if (access_token_local == null || access_token_local == undefined) {
        document.getElementById("balance").value = "Saldo: R$";
    } else {
        request.setRequestHeader('Authorization', 'Bearer ' + access_token_local);
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                console.log('Status:', this.status);
                console.log('Headers:', this.getAllResponseHeaders());
                console.log('Body:', this.responseText);
                var json = this.response;
                var obj = JSON.parse(json);
                document.getElementById("balance").value = "Saldo: R$" + obj.balance;
            }
        }

    };
    request.send();
}

function consultCall() {
    var date = "";
    var uuid = document.getElementById("retornaruuid").value;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("callDuration").value = obj.talkingDurationSeconds;
            document.getElementById("callStatus").value = obj.state;
            document.getElementById("recordLink").value = obj.linkAudio;
        }
    });
    xhr.open("GET", "https://api.nvoip.com.br/v2/calls?callId=" + uuid);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accessTokenGlobal);
    xhr.send(date);
}

function sendCode2FA() {
    var request = new XMLHttpRequest();
    var email = document.getElementById("2faemail").value;
    var number = document.getElementById("2fanumber").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/2fa');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            document.getElementById("2fatoken").value = obj.token2fa;

            if (this.status == 200) {
                document.getElementById("2faSucessMessage").value = "2FA enviado com sucesso!"
                document.getElementById("2faSucessMessage").type = "text";
            }
        }
    };
    var body = {
        'email': "" + email + "",
        'cellPhone': "" + number + "",
    };
    request.send(JSON.stringify(body));
}

function sendOTP() {
    var request = new XMLHttpRequest();
    var SMS = document.getElementById("OTPSMS").value;
    var voice = document.getElementById("OTPvoice").value;
    var email = document.getElementById("OTPemail").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/otp');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            if (this.status == 200) {
                var json = this.response;
                var obj = JSON.parse(json);
                document.getElementById("OTPcode").value = 'message enviada com sucesso!';
                document.getElementById("OTPcode").type = "text";
                document.getElementById("keyOTP").value = obj.key;
                //document.getElementById("keyOTP").type = "text";
            } else {
                document.getElementById("OTPcode").value = 'message não enviada!';
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

function check2FA() {
    var date = "";
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
                document.getElementById("2faReturn").value = obj.message;
                document.getElementById("2faReturn").type = "text";
            } else {
                document.getElementById("2faReturn").value = obj.status;
                document.getElementById("2faReturn").type = "text";
            }
        }
    });
    xhr.open("GET", "https://api.nvoip.com.br/v2/check/2fa?token2fa=" + token2fa + "&pin=" + pin);
    xhr.setRequestHeader("Authorization", "Bearer " + accessTokenGlobal);
    xhr.send(date);
}

function scheduleTorpedo() {
    var request = new XMLHttpRequest();
    var destinationNumber = document.getElementById("scheduleTorpedo").value;
    var message = document.getElementById("agendarmessage").value;
    var date = document.getElementById("date").value;
    var hour = document.getElementById("hour").value;
    request.open('POST', 'https://api.nvoip.com.br/v2/sched/torpedo');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + accessTokenGlobal);
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            var json = this.response;
            var obj = JSON.parse(json);
            if (this.status == 200) {
                document.getElementById("returnScheduleTorpedo").value = "Torpedo Agendado com Sucesso!";
                document.getElementById("returnScheduleTorpedo").type = "text";
            } else if (this.status != 200) {
                document.getElementById("returnScheduleTorpedo").value = "Torpedo não agendado!";
                document.getElementById("returnScheduleTorpedo").type = "text";
            }
        }
    };
    var body = {
        'message': message,
        'toNumber': destinationNumber,
        'schedulingDate': date + " " + hour
    };
    request.send(JSON.stringify(body));
}

function listTorpedo() {
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
    xhr.setRequestHeader("Authorization", "Bearer " + accessTokenGlobal);
    xhr.send();
}

function deleteTorpedo() {
    var xhr = new XMLHttpRequest();
    var idTorpedo = document.getElementById("idTorpedo").value;
    
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);

            if (this.response == "") {
                document.getElementById("deletionTorpedo").value = "Torpedo excluído com sucesso!";
                document.getElementById("deletionTorpedo").type = "text";
            } else {
                document.getElementById("deletionTorpedo").value = "Ocorreu um erro ao excluir!";
                document.getElementById("deletionTorpedo").type = "text";
            }
        }
    });
    xhr.open("DELETE", "https://api.nvoip.com.br/v2/delete/sched/torpedo?schedkey=" + idTorpedo);
    xhr.setRequestHeader("Authorization", "Bearer " + accessTokenGlobal);
    xhr.send();
}

function clearList() {
    document.getElementById("exampleFormControlTextarea1").value = "";
}

function checkOTP() {
    var request = new XMLHttpRequest();
    var code = document.getElementById("code").value;
    var keyOTP = document.getElementById("keyOTP").value;
    request.open('GET', 'https://api.nvoip.com.br/v2/check/otp?code=' + code + '&key=' + keyOTP);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            var json = this.response;

            var obj = JSON.parse(json);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);

            if (this.status == 200) {
                document.getElementById("OTPreturn").value = obj.status;
                document.getElementById("OTPreturn").type = "text";
            } else {
                document.getElementById("OTPreturn").value = obj.message;
                document.getElementById("OTPreturn").type = "text";
            }
        }
    };
    request.send();
}

function encerrarChamada(){
    var request = new XMLHttpRequest();
    var id =  document.getElementById("retornaruuid").value;
   
request.open('GET', 'https://api.nvoip.com.br/v2/endcall?callId=' + id);

request.setRequestHeader('Content-Type', 'application/json');
request.setRequestHeader('Authorization', 'Bearer '+accessTokenGlobal);


request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log('Status:', this.status);
    console.log('Headers:', this.getAllResponseHeaders());
    console.log('Body:', this.responseText);
  }
  
};

request.send();
    
}