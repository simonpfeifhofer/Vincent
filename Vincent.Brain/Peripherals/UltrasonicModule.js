var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ModuleKindIdentifier = require("./ModuleKindIdentifier");
var ModuleBase = require("./ModuleBase");
var UltrasonicModule = (function (_super) {
    __extends(UltrasonicModule, _super);
    function UltrasonicModule(port_slot) {
        _super.call(this, ModuleKindIdentifier.ULTRASONIC, port_slot);
        this._callbacks = new Array();
    }
    UltrasonicModule.prototype.GetModuleKindIdentifier = function () {
        return ModuleKindIdentifier.ULTRASONIC;
    };
    UltrasonicModule.prototype.ApplyValue = function (value) {
        this._value = value;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i](value);
        }
    };
    UltrasonicModule.prototype.GetValue = function () {
        return this._value;
    };
    UltrasonicModule.prototype.RegisterCallback = function (callback) {
        this._callbacks.push(callback);
    };
    return UltrasonicModule;
})(ModuleBase);
module.exports = UltrasonicModule;
//# sourceMappingURL=UltrasonicModule.js.map