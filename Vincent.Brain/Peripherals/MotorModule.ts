import IActorModule = require("./IActorModule");
import ModuleType = require("./ModuleType");
import ModuleKindIdentifier = require("./ModuleKindIdentifier");
import ModuleBase = require("./ModuleBase");

class MotorModule extends ModuleBase implements IActorModule {

    constructor(port_slot: number) {
        super(ModuleType.ACTOR, ModuleKindIdentifier.MOTOR, port_slot);
    }

    GetModuleKindIdentifier(): ModuleKindIdentifier {
        return ModuleKindIdentifier.MOTOR;
    }

    SetValue(value: number) {
        super.SetCurrentData(value);
    }

}

export = MotorModule;