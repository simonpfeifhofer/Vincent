var ReadState;
(function (ReadState) {
    ReadState[ReadState["Unknown"] = 1] = "Unknown";
    ReadState[ReadState["PreStart"] = 2] = "PreStart";
    ReadState[ReadState["Start"] = 3] = "Start";
    ReadState[ReadState["SensorResponseDetected"] = 4] = "SensorResponseDetected";
    ReadState[ReadState["SensorModuleFound"] = 5] = "SensorModuleFound";
})(ReadState || (ReadState = {}));
var ModulesRunner = (function () {
    function ModulesRunner(serialPort, sensorModules) {
        this._serialPort = serialPort;
        this._sensorModules = sensorModules;
    }
    ModulesRunner.prototype.GetSensorModulesCount = function () {
        return this._sensorModules.length;
    };
    ModulesRunner.prototype.GetSensorModule = function (moduleKindIdentifier) {
        for (var i in this._sensorModules) {
            if (this._sensorModules[i].GetModuleKindIdentifier() == moduleKindIdentifier) {
                return this._sensorModules[i];
            }
        }
        return null;
    };
    ModulesRunner.prototype.ResetAll = function () {
        var buffer = new Buffer(4);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x04;
        buffer[3] = 0x00;
        this._serialPort.write(buffer, function (error, result) {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            console.log("Reset result: %s", result);
        });
    };
    ModulesRunner.prototype.Read = function () {
        var _this = this;
        this._serialPort.open(function (error) {
            if (error) {
                console.log('failed to open: ' + error);
            }
            else {
                console.log("connection established");
                _this.ResetAll();
                console.log("Vincent.Peripheral resetted");
                var readState;
                var currentModule = null;
                var reset = function () {
                    readState = ReadState.Unknown;
                    currentModule = null;
                };
                reset();
                var valueIndex = 0;
                var valuebuffer = new Buffer(4);
                _this._serialPort.on('data', function (data) {
                    console.log("Raw data read: " + data.toString('hex'));
                    for (var i = 0; i < data.length; i++) {
                        if (readState == ReadState.Unknown && data[i] == 0xFF) {
                            readState = ReadState.PreStart;
                        }
                        else if (readState == ReadState.PreStart && data[i] == 0x55) {
                            readState = ReadState.Start;
                            valuebuffer.fill(0);
                        }
                        else if (readState == ReadState.Start && data[i] == 0x01) {
                            readState = ReadState.SensorResponseDetected;
                        }
                        else if (readState == ReadState.SensorResponseDetected && _this.GetSensorModule(data[i]) != null) {
                            readState = ReadState.SensorModuleFound;
                            currentModule = _this.GetSensorModule(data[i]);
                            valueIndex = 0;
                        }
                        else if (readState == ReadState.SensorModuleFound) {
                            valuebuffer[valueIndex] = data[i];
                            if (valueIndex == 1 &&
                                valuebuffer[0] == 0x0d &&
                                valuebuffer[1] == 0x0a) {
                                reset();
                            }
                            else if (valueIndex > 2) {
                                console.log("Module data read: " + data.toString('hex'));
                                console.log("Module %d apply value: %d", currentModule.GetModuleKindIdentifier(), valuebuffer.readFloatLE(0));
                                currentModule.ApplyValue(valuebuffer.readFloatLE(0));
                                reset();
                            }
                            valueIndex++;
                        }
                        else {
                            reset();
                        }
                    }
                });
                setInterval(function () {
                    _this.TriggerAllSensorsRead();
                }, 500);
            }
        });
    };
    ModulesRunner.prototype.Start = function () {
        this.Read();
    };
    ModulesRunner.prototype.TriggerAllSensorsRead = function () {
        var buffer = new Buffer(4 + 2 * this.GetSensorModulesCount());
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x01;
        buffer[3] = 6;
        for (var i in this._sensorModules) {
            var m = this._sensorModules[i];
            buffer[4 + i * 2] = m.GetModuleKindIdentifier(); //0x09; // module  
            buffer[4 + (i * 2) + 1] = m.GetPortSlot(); //0x61; // port + slot
        }
        //console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, function (error, result) {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
        });
    };
    ModulesRunner.prototype.RunActor = function (actor) {
        var buffer = new Buffer(10);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x02;
        buffer[3] = 6;
        buffer[4] = actor.GetModuleKindIdentifier(); //0x09; // module  
        buffer[5] = actor.GetPortSlot(); //0x61; // port + slot
        buffer.writeFloatLE(actor.GetCurrentData(), 6);
        //console.log("Module %d on port/slot %d writes data", mod.GetModuleKindIdentifier(), mod.GetPortSlot());
        //console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, function (error, result) {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            //console.log("%s actor result: %s", mod.GetModuleKindIdentifier().toString(), result);
        });
    };
    return ModulesRunner;
})();
module.exports = ModulesRunner;
//# sourceMappingURL=ModulesRunner.js.map