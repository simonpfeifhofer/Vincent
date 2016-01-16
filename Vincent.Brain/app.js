// start sector to refactor

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var proc;

app.use('/', express.static(path.join(__dirname, 'stream')));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var sockets = {};

io.on('connection', function (socket) {
    
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
    
    socket.on('disconnect', function () {
        delete sockets[socket.id];
        
        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            app.set('watchingFile', false);
            if (proc) proc.kill();
            fs.unwatchFile('./stream/image_stream.jpg');
        }
    });
    
    socket.on('start-stream', function () {
        startStreaming(io);
    });
 
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
    }
}

function startStreaming(io) {
    
    if (app.get('watchingFile')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }
    
    var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
    proc = spawn('raspistill', args);
    
    console.log('Watching for changes...');
    
    app.set('watchingFile', true);
    
    fs.watchFile('./stream/image_stream.jpg', function (current, previous) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    })
 
}

// end sector to refactor




var peripherals = require("./Peripherals");
var navigation = require("./Navigation");

if (process.argv[2] === 'development') {
    
    var mock = require('mock-require');
    
    mock('noble', {
        on: function (arg, f) {
            if (arg === 'stateChange') {
                console.log('noble.on.stateChange mocked');
            }
            if (arg === 'discover') {
                console.log('noble.on.discover mocked')
            }
            console.log('noble.on mocked');
        },
        startScanning: function () {
            console.log('noble.startScanning mocked');
        },
        stopScanning: function () {
            console.log('noble.stopScanning mocked');
        }
    });

    mock('serialport', {
        SerialPort : function () {
            return {
                open: function (error) {
                    console.log('serialport.open mocked');
                }
            } 
        }
    });
    
}

var noble = require('noble');
console.log("Start Vincent Brain");

/*
noble.on('stateChange', function(state) {
  console.log("State change: " + state);
  if (state === 'poweredOn')
    noble.startScanning();
  else
    noble.stopScanning();
});
noble.on('discover', function(peripheral) { 
  var macAddress = peripheral.uuid;
  var rssi = peripheral.rssi;
  console.log('found device: ', macAddress, ' ', rssi);   
});
*/

var sp = require("serialport");
var serialPort = new sp.SerialPort("/dev/ttyAMA0", {
    baudrate: 115200
}, false);

// create modules
var displayModule = new peripherals.DisplayModule(0x61);
var ultrasonicModule = new peripherals.UltrasonicModule(0x31);
var motorLeftModule = new peripherals.MotorModule(0x91);
var motorRightModule = new peripherals.MotorModule(0xA1);

// initialize
motorLeftModule.SetValue(0);
motorRightModule.SetValue(0);

// create runner
var runner = new peripherals.ModulesRunner(
    serialPort,
    // sensors
    [
        ultrasonicModule
    ]
);

// wire
ultrasonicModule.RegisterCallback(function (value) {
    
    // prepare
    displayModule.SetValue(value);
    /*
    if (value < 20 || value > 100) {
        motorLeftModule.SetValue((value < 20 ? -1 : 1 ) * 100);
        motorRightModule.SetValue((value < 20 ? -1 : 1) * 100);
    }
    */
    
    // run
    runner.RunActor(displayModule);
    /*
    runner.RunActor(motorLeftModule);
    runner.RunActor(motorRightModule);
    */
    
});

var navigator = new navigation.StayInZoneNavigator(
    runner, 
    motorLeftModule, 
    motorRightModule, 
    ultrasonicModule
);

// start all
runner.Start(
    function () {
        navigator.Start();
    }
);

process.on('SIGINT', function () {
    //noble.stopScanning();
	process.exit();
});