import ModuleKindIdentifier = require("./ModuleKindIdentifier");

interface IModule {
    GetModuleKindIdentifier(): ModuleKindIdentifier;
    GetPortSlot(): number;
    SetCurrentData(data: any);
    GetCurrentData(): any;
}

export = IModule;