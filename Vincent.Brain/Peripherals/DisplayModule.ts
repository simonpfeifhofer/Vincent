import IActorModule = require("./IActorModule");
import ModuleBase = require("./ModuleBase");
import ModuleKindIdentifier = require("./ModuleKindIdentifier");

class DisplayModule extends ModuleBase implements IActorModule {

    constructor(port_slot: number) {
        super(ModuleKindIdentifier.DISPLAY, port_slot);
    }

    GetModuleKindIdentifier(): ModuleKindIdentifier {
        return ModuleKindIdentifier.DISPLAY;
    }

    SetValue(value: number) {
        super.SetCurrentData(value);
    }

}

export = DisplayModule;