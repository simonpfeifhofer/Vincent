import ModuleType = require("./ModuleType");
import IModule = require("./IModule");
import ISensorModule = require("./ISensorModule");
import IActorModule = require("./IActorModule");

class ModulesRunner {

    private _serialPort: any;
    private _sensorModules: Array<ISensorModule>;

    constructor(serialPort: any, sensorModules: Array<ISensorModule>) {
        this._serialPort = serialPort;
        for (var i in sensorModules) {
            if (sensorModules[i].GetModuleType() != ModuleType.SENSOR) {
                throw new Error("Only sensor-modules are supported!");
            }
        }
        this._sensorModules = sensorModules;
    }

    public GetSensorModulesCount() : number{
        return this._sensorModules.length;
    }

    public GetSensorModule(index: number): ISensorModule{
        return this._sensorModules[index];
    }

    private Write(mod: IModule, descriptor: number) {

        var buffer = new Buffer(mod.GetCurrentData() == null ? 6 : 10);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = mod.GetModuleType(); //0x01;
        buffer[3] = descriptor;
        buffer[4] = mod.GetModuleKindIdentifier();//0x09; // module  
        buffer[5] = mod.GetPortSlot();//0x61; // port + slot
        if (mod.GetCurrentData() != null) {
            buffer.writeFloatLE(mod.GetCurrentData(), 6);
        }
        console.log("Module %d on port/slot %d writes data", mod.GetModuleKindIdentifier(), mod.GetPortSlot());
        console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, (error, result) => {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            console.log("%s actor result: %s", mod.GetModuleKindIdentifier().toString(), result);
        });
    }

    private Read() {

        this._serialPort.open(
            (error) => {
                if (error) {
                    console.log('failed to open: ' + error);
                } else {
                    console.log("connection established ...");
                    var preStart = false;
                    var start = false;
                    var index = 0;
                    var valuebuffer = new Buffer(4);
                    var modulesIndex = -1;
                    this._serialPort.on('data', (data) => {

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
                                    this.GetSensorModule(modulesIndex).ApplyValue(valuebuffer.readFloatLE(0));
                                    preStart = false;
                                    start = false;
                                    modulesIndex = -1;
                                }
                            }

                        }

                    }
                );

                setInterval(
                    () => {
                        this.TriggerAllSensorsRead();
                    }
                    ,
                    100);

            }
        });

    }

    public Start() {
        this.Read();
    }

    private TriggerAllSensorsRead() {
        for (var i in this._sensorModules) {
            var mb = this._sensorModules[i];
            this.Write(mb, this.GetSensorModulesCount() * 2);
        }
    }

    public RunActor(actor: IActorModule) {
        this.Write(actor, 6);
    }

}

export = ModulesRunner;