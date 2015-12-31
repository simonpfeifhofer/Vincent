import ModuleType = require("./ModuleType");
import IModule = require("./IModule");
import ISensorModule = require("./ISensorModule");
import IActorModule = require("./IActorModule");

enum ReadState {
    Unknown = 1,
    PreStart = 2,
    Start = 3,
    ModuleTypeDetected = 4,
}

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

    private ResetAll() {

        var buffer = new Buffer(4);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x04;
        buffer[3] = 0x00;
        this._serialPort.write(buffer, (error, result) => {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            console.log("Reset result: %s", result);
        });

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
        //console.log("Module %d on port/slot %d writes data", mod.GetModuleKindIdentifier(), mod.GetPortSlot());
        //console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, (error, result) => {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
            //console.log("%s actor result: %s", mod.GetModuleKindIdentifier().toString(), result);
        });
    }

    private Read() {

        this._serialPort.open(
            (error) => {
                if (error) {
                    console.log('failed to open: ' + error);
                } else {

                    console.log("connection established");
                    this.ResetAll();
                    console.log("Vincent.Peripheral resetted");

                    var readState: ReadState;
                    var modulesIndex = -1;

                    var reset = () => {
                        readState = ReadState.Unknown;
                        modulesIndex = -1;
                    };

                    reset();

                    var valueIndex = 0;
                    var valuebuffer = new Buffer(4);

                    this._serialPort.on('data', (data) => {

                        //console.log("Raw data read: " + data.toString('hex'));
                        for (var i = 0; i < data.length; i++) {

                            if (readState == ReadState.Unknown && data[i] == 0xFF) {
                                readState = ReadState.PreStart;
                            }
                            else if (readState == ReadState.PreStart && data[i] == 0x55) {
                                readState = ReadState.Start;
                                valuebuffer.fill(0);
                            }
                            else if (readState == ReadState.Start && data[i] == ModuleType.SENSOR) {
                                readState = ReadState.ModuleTypeDetected;
                                valueIndex = 0;
                                modulesIndex++;
                            }
                            else if (readState == ReadState.ModuleTypeDetected) {

                                valuebuffer[valueIndex] = data[i];

                                if (valueIndex == 1 &&
                                    valuebuffer[0] == 0x0d &&
                                    valuebuffer[1] == 0x0a) {
                                    reset();
                                }
                                else if (valueIndex > 2) {

                                    var mod: ISensorModule = this.GetSensorModule(modulesIndex);
                                    if (mod == null) {
                                        throw new Error("Module at index %d not in list!");
                                    }
                                    console.log("Raw data read: " + data.toString('hex'));
                                    console.log("Module %d apply value: %f", mod.GetModuleKindIdentifier(), valuebuffer.readFloatLE(0));
                                    mod.ApplyValue(valuebuffer.readFloatLE(0));
                                    reset();
                                }

                                valueIndex++;

                            }
                            else {
                                reset();
                            }

                        }

                    }
                );

                setInterval(
                    () => {
                        this.TriggerAllSensorsRead();
                    }
                    ,
                    200);

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