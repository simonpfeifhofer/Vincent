var StayInZoneNavigator = (function () {
    function StayInZoneNavigator(runner, motorLeft, motorRight, ultrasonic) {
        this._lookAroundSteps = 20;
        this._lookIntervalMs = 200;
        this._runner = runner;
        this._motorLeft = motorLeft;
        this._motorRight = motorRight;
        this._ultrasonic = ultrasonic;
    }
    StayInZoneNavigator.prototype.Start = function () {
    };
    StayInZoneNavigator.prototype.LookAround = function (callback) {
        var _this = this;
        this._motorLeft.SetValue(100);
        this._motorRight.SetValue(-100);
        this._runner.RunActor(this._motorLeft);
        this._runner.RunActor(this._motorRight);
        var distances = new Array();
        var interval = setInterval(function () {
            distances.push(_this._ultrasonic.GetValue());
        }, this._lookIntervalMs);
        setTimeout(function () {
            clearInterval(interval);
            callback(distances);
        }, this._lookAroundSteps * this._lookIntervalMs);
    };
    StayInZoneNavigator.prototype.Navigate = function () {
    };
    StayInZoneNavigator.prototype.Stop = function () {
    };
    return StayInZoneNavigator;
})();
//# sourceMappingURL=StayInZoneNavigator.js.map