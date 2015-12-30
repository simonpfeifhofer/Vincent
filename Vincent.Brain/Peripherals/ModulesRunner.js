var ModuleType = require("./ModuleType");
var ModulesRunner = (function () {
    function ModulesRunner(serialPort, sensorModules) {
        this._serialPort = serialPort;
        for (var i in sensorModules) {
            if (sensorModules[i].GetModuleType() != ModuleType.SENSOR) {
                throw new Error("Only sensor-modules are supported!");
            }
        }
        this._sensorModules = sensorModules;
    }
    ModulesRunner.prototype.GetSensorModulesCount = function () {
        return this._sensorModules.length;
    };
    ModulesRunner.prototype.GetSensorModule = function (index) {
        return this._sensorModules[index];
    };
    ModulesRunner.prototype.Write = function (mod, descriptor) {
        var buffer = new Buffer(mod.GetCurrentData() == null ? 6 : 10);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = mod.GetModuleType(); //0x01;
        buffer[3] = descriptor;
        buffer[4] = mod.GetModuleKindIdentifier(); //0x09; // module  
        buffer[5] = mod.GetPortSlot(); //0x61; // port + slot
        if (mod.GetCurrentData() != null) {
            buffer.writeFloatLE(mod.GetCurrentData(), 6);
        }
        console.log("Module %d on port/slot %d writes data", mod.GetModuleKindIdentifier(), mod.GetPortSlot());
        console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, function (error, result) {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            console.log("%s actor result: %s", mod.GetModuleKindIdentifier().toString(), result);
        });
    };
    ModulesRunner.prototype.Read = function () {
        var _this = this;
        this._serialPort.open(function (error) {
            if (error) {
                console.log('failed to open: ' + error);
            }
            else {
                console.log("connection established ...");
                var preStart = false;
                var start = false;
                var index = 0;
                var valuebuffer = new Buffer(4);
                var modulesIndex = -1;
                _this._serialPort.on('data', function (data) {
                    console.log("Raw data read: " + data.toString('hex'));
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] == 0xFF) {
                            preStart = true;
                        }
                        else if (preStart && data[i] == 0x55) {
                            start = true;
                            valuebuffer.fill(0);
                        }
                        else if (start && preStart && data[i] == ModuleType.SENSOR) {
                            index = 0;
                            modulesIndex++;
                        }
                        else if (modulesIndex >= 0) {
                            valuebuffer[index] = data[i];
                            index++;
                            if (index == 4) {
                                _this.GetSensorModule(modulesIndex).ApplyValue(valuebuffer.readFloatLE(0));
                                preStart = false;
                                start = false;
                                modulesIndex = -1;
                            }
                        }
                    }
                });
                setInterval(function () {
                    _this.TriggerAllSensorsRead();
                }, 100);
            }
        });
    };
    ModulesRunner.prototype.Start = function () {
        this.Read();
    };
    ModulesRunner.prototype.TriggerAllSensorsRead = function () {
        for (var i in this._sensorModules) {
            var mb = this._sensorModules[i];
            this.Write(mb, this.GetSensorModulesCount() * 2);
        }
    };
    ModulesRunner.prototype.RunActor = function (actor) {
        this.Write(actor, 6);
    };
    return ModulesRunner;
})();
module.exports = ModulesRunner;
//# sourceMappingURL=ModulesRunner.js.map