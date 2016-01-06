
var peripherals = require("./Peripherals");

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
    if(value < 20 || value > 100){
        motorLeftModule.SetValue((value < 20 ? -1 : 1 ) * 100);
        motorRightModule.SetValue((value < 20 ? -1 : 1) * 100);
    }
    
    // run
    runner.RunActor(displayModule);
    runner.RunActor(motorLeftModule);
    runner.RunActor(motorRightModule);
    
});

// start all
runner.Start();

process.on('SIGINT', function () {
    //noble.stopScanning();
	process.exit();
});