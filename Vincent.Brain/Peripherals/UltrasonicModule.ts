import ModuleKindIdentifier = require("./ModuleKindIdentifier");
import ISensorModule = require("./ISensorModule");
import ModuleBase = require("./ModuleBase");

class UltrasonicModule extends ModuleBase implements ISensorModule{

    private _value: any;
    private _callbacks: Array<any> = new Array<any>();

    constructor(port_slot: number) {
        super(ModuleKindIdentifier.ULTRASONIC, port_slot);
    }

    GetModuleKindIdentifier(): ModuleKindIdentifier {
        return ModuleKindIdentifier.ULTRASONIC;
    }

    ApplyValue(value: any) {
        this._value = value;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i](value);
        }
    }

    GetValue(): any {
        return this._value;
    }

    RegisterCallback(callback: (value: any) => any) {
        this._callbacks.push(callback);
    }

}

export = UltrasonicModule;