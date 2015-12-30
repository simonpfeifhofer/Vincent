var ModuleBase = (function () {
    function ModuleBase(moduleType, moduleKindIdentifier, port_slot) {
        this._currentData = null;
        this._moduleType = moduleType;
        this._moduleKindIdentifier = moduleKindIdentifier;
        this._port_slot = port_slot;
    }
    ModuleBase.prototype.SetCurrentData = function (data) {
        this._currentData = data;
    };
    ModuleBase.prototype.GetCurrentData = function () {
        return this._currentData;
    };
    ModuleBase.prototype.GetModuleType = function () {
        return this._moduleType;
    };
    ModuleBase.prototype.GetModuleKindIdentifier = function () {
        return this._moduleKindIdentifier;
    };
    ModuleBase.prototype.GetPortSlot = function () {
        return this._port_slot;
    };
    return ModuleBase;
})();
module.exports = ModuleBase;
//# sourceMappingURL=ModuleBase.js.map