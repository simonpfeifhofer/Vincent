import ModuleKindIdentifier = require("./ModuleKindIdentifier");
import IModule = require("./IModule");
import ISensorModule = require("./ISensorModule");
import IActorModule = require("./IActorModule");

enum ReadState {
    Unknown = 1,
    PreStart = 2,
    Start = 3,
    SensorResponseDetected = 4,
    SensorModuleFound = 5
}

class ModulesRunner {

    private _serialPort: any;
    private _sensorModules: Array<ISensorModule>;

    constructor(serialPort: any, sensorModules: Array<ISensorModule>) {
        this._serialPort = serialPort;
        this._sensorModules = sensorModules;
    }

    public GetSensorModulesCount() : number{
        return this._sensorModules.length;
    }

    public GetSensorModule(moduleKindIdentifier: ModuleKindIdentifier): ISensorModule{
        for (var i in this._sensorModules) {
            if (this._sensorModules[i].GetModuleKindIdentifier() == moduleKindIdentifier) {
                return this._sensorModules[i];
            }
        }
        return null;
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
                    var currentModule: ISensorModule = null;

                    var reset = () => {
                        readState = ReadState.Unknown;
                        currentModule = null;
                    };

                    reset();

                    var valueIndex = 0;
                    var valuebuffer = new Buffer(4);

                    this._serialPort.on('data', (data) => {

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
                            else if (readState == ReadState.SensorResponseDetected && this.GetSensorModule(data[i]) != null) {
                                readState = ReadState.SensorModuleFound;
                                currentModule = this.GetSensorModule(data[i]);
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

                    }
                );

                setInterval(
                    () => {
                        this.TriggerAllSensorsRead();
                    }
                    ,
                    500);

            }
        });

    }

    public Start() {
        this.Read();
    }

    private TriggerAllSensorsRead() {
        
        var buffer = new Buffer(4 + 2*this.GetSensorModulesCount());
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x01;
        buffer[3] = 6;
        
        for (var i in this._sensorModules) {
            var m = this._sensorModules[i];
            buffer[4 + i*2] = m.GetModuleKindIdentifier();//0x09; // module  
            buffer[4 + (i*2) + 1] = m.GetPortSlot();//0x61; // port + slot
        }

        //console.log("Raw data write: " + buffer.toString('hex'));
        this._serialPort.write(buffer, (error, result) => {
            if (error != null) {
                console.error("Error occurred: %s", error);
                return;
            }
        });

    }

    public RunActor(actor: IActorModule) {
        var buffer = new Buffer(10);
        buffer[0] = 0xff;
        buffer[1] = 0x55;
        buffer[2] = 0x02;
        buffer[3] = 6;
        buffer[4] = actor.GetModuleKindIdentifier();//0x09; // module  
        buffer[5] = actor.GetPortSlot();//0x61; // port + slot
        buffer.writeFloatLE(actor.GetCurrentData(), 6);

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

}

export = ModulesRunner;