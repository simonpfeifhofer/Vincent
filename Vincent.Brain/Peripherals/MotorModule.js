var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ModuleKindIdentifier = require("./ModuleKindIdentifier");
var ModuleBase = require("./ModuleBase");
var MotorModule = (function (_super) {
    __extends(MotorModule, _super);
    function MotorModule(port_slot) {
        _super.call(this, ModuleKindIdentifier.MOTOR, port_slot);
    }
    MotorModule.prototype.GetModuleKindIdentifier = function () {
        return ModuleKindIdentifier.MOTOR;
    };
    MotorModule.prototype.SetValue = function (value) {
        _super.prototype.SetCurrentData.call(this, value);
    };
    return MotorModule;
})(ModuleBase);
module.exports = MotorModule;
//# sourceMappingURL=MotorModule.js.map