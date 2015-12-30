import ModuleKindIdentifier = require("./ModuleKindIdentifier");
import ModuleType = require("./ModuleType");

interface IModule {
    GetModuleKindIdentifier(): ModuleKindIdentifier;
    GetModuleType(): ModuleType;
    GetPortSlot(): number;
    SetCurrentData(data: any);
    GetCurrentData(): any;
}

export = IModule;