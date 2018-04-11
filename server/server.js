'use strict';

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
var snmp = require("net-snmp");

io.on('connection', (socket) => {
    socket.on('send-device-options', (deviceInfo) => {
      var session = snmp.createSession(deviceInfo.ipAddress, deviceInfo.community);
      
      var infos = [
          {
              name: "Contato",
              oid: "1.3.6.1.2.1.1.4.0",
          },
          {
              name: "Nome",
              oid: "1.3.6.1.2.1.1.5.0",
          },
          {
              name: "Localização",
              oid: "1.3.6.1.2.1.1.6.0",
          },
          {
              name: "Descrição",
              oid: "1.3.6.1.2.1.1.1.0",
          },
          {
              name: "Tempo ligado",
              oid: "1.3.6.1.2.1.1.3.0",
          },
      ];
      var infoOids = [];
      
      session.get(infos.map(info => info.oid), (error, varbinds) => {
          if (error) {
              console.error (error);
          } else {
              for (var i = 0; i < varbinds.length; i++) {
                  if (snmp.isVarbindError (varbinds[i])) {
                      console.error (snmp.varbindError (varbinds[i]))
                  } else {
                      infoOids.push(infos[i].name.concat(": ").concat(varbinds[i].value));
                  }
              }
  
              io.emit('get-device-summary', infoOids);
              hehe(deviceInfo);
          }
      
          // If done, close the session
          session.close ();
      });
      
      session.trap (snmp.TrapType.LinkDown, function (error) {
          if (error)
              console.error (error);
      });
    });
});

function hehe(deviceInfo) {
    var session = snmp.createSession(deviceInfo.ipAddress, deviceInfo.community);
    let qtd = [ '1.3.6.1.2.1.2.1.0' ];
    session.get(qtd, function (error, varbinds) {
        if (error) {
            console.log(error);
        } else {
            for (var i = 0; i < varbinds.length; i++)
                if (snmp.isVarbindError (varbinds[i])) {
                    console.error (snmp.varbindError (varbinds[i]))
                } else {
                    var interfaceNamesOids = [];
                    for (var x = 1; x < varbinds[i].value; x++) {
                        interfaceNamesOids.push('1.3.6.1.2.1.31.1.1.1.18.' + x)
                    }
                    haha(interfaceNamesOids, deviceInfo);
                }
        }

        // If done, close the session
        session.close ();
    });

    session.trap (snmp.TrapType.LinkDown, function (error) {
        if (error)
            console.error (error);
    });
}

function haha(oids, deviceInfo) {
    var session = snmp.createSession(deviceInfo.ipAddress, deviceInfo.community);
    session.get(oids, function (error, varbinds) {
        if (error) {
            var errorSplit = error.message.split(': ');
            if(errorSplit[0] == 'NoSuchName') {
                oids.splice(oids.indexOf(errorSplit[1]), 1);
                haha(oids, deviceInfo);
            };
        } else {
            var arr = [];
            for (var i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError (varbinds[i])) {
                    console.error (snmp.varbindError (varbinds[i]));
                } else {
                    arr.push({ oid: varbinds[i].oid, name: varbinds[i].value.toString() });
                }
            }
        }

        io.emit('get-interfaces', arr);
        // If done, close the session
    });

    session.trap (snmp.TrapType.LinkDown, function (error) {
        if (error)
            console.error (error);
    });
}

http.listen(8080, () => console.log('Servidor iniciado na porta :8080'));