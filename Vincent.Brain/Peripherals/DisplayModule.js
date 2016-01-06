var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ModuleBase = require("./ModuleBase");
var ModuleKindIdentifier = require("./ModuleKindIdentifier");
var DisplayModule = (function (_super) {
    __extends(DisplayModule, _super);
    function DisplayModule(port_slot) {
        _super.call(this, ModuleKindIdentifier.DISPLAY, port_slot);
    }
    DisplayModule.prototype.GetModuleKindIdentifier = function () {
        return ModuleKindIdentifier.DISPLAY;
    };
    DisplayModule.prototype.SetValue = function (value) {
        _super.prototype.SetCurrentData.call(this, value);
    };
    return DisplayModule;
})(ModuleBase);
module.exports = DisplayModule;
//# sourceMappingURL=DisplayModule.js.map