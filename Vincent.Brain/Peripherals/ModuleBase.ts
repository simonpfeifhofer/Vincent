import ModuleType = require("./ModuleType");
import ModuleKindIdentifier = require("./ModuleKindIdentifier");

class ModuleBase {

    private _moduleType: ModuleType;
    private _moduleKindIdentifier: ModuleKindIdentifier;
    private _port_slot: number;

    private _currentData: any = null;

    constructor(
        moduleType: ModuleType,
        moduleKindIdentifier: ModuleKindIdentifier,
        port_slot: number) {
        this._moduleType = moduleType;
        this._moduleKindIdentifier = moduleKindIdentifier;
        this._port_slot = port_slot;
    }

    public SetCurrentData(data: any) {
        this._currentData = data;
    }

    public GetCurrentData(): any {
        return this._currentData;
    }

    public GetModuleType(): ModuleType {
        return this._moduleType;
    }

    public GetModuleKindIdentifier(): ModuleKindIdentifier {
        return this._moduleKindIdentifier;
    }

    public GetPortSlot(): number {
        return this._port_slot;
    }

}

export = ModuleBase;