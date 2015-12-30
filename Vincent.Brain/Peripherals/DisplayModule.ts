import IActorModule = require("./IActorModule");
import ModuleBase = require("./ModuleBase");
import ModuleType = require("./ModuleType");
import ModuleKindIdentifier = require("./ModuleKindIdentifier");

class DisplayModule extends ModuleBase implements IActorModule {

    constructor(port_slot: number) {
        super(ModuleType.ACTOR, ModuleKindIdentifier.DISPLAY, port_slot);
    }

    GetModuleKindIdentifier(): ModuleKindIdentifier {
        return ModuleKindIdentifier.DISPLAY;
    }

    SetValue(value: number) {
        super.SetCurrentData(value);
    }

}

export = DisplayModule;