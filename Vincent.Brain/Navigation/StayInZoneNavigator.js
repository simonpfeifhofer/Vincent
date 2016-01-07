var Task = require("../TaskRunner/Task");
var SequentialTask = require("../TaskRunner/SequentialTask");
var LoopTask = require("../TaskRunner/LoopTask");
var StayInZoneNavigator = (function () {
    function StayInZoneNavigator(runner, motorLeft, motorRight, ultrasonic) {
        var _this = this;
        this._generalWaitDelay = 2000;
        this._turnSteps = 10;
        this._runner = runner;
        this._motorLeft = motorLeft;
        this._motorRight = motorRight;
        this._ultrasonic = ultrasonic;
        this._distanceMeasures = new Array();
        var turnAndMeasureDistanceLoop = new SequentialTask([
            this.CreateTriggerSensorReadTask(),
            this.CreateWaitTask(),
            this.CreateMeasureTask(),
            this.CreateWaitTask(),
            this.CreateStartTurningTask(),
            this.CreateWaitTask(),
            this.CreateStopMovementTask(),
            this.CreateWaitTask()
        ]);
        var turnAndMeasureDistance = new SequentialTask([
            this.CreateCleanupMeasureTask(),
            new LoopTask(function () { return _this._distanceMeasures.length < _this._turnSteps; }, turnAndMeasureDistanceLoop)
        ]);
        var turnToMaxDistance = new SequentialTask([]);
        var moveForward = new SequentialTask([]);
        this._task = new SequentialTask([
            this.CreateWaitTask(),
            turnAndMeasureDistance,
        ]);
    }
    StayInZoneNavigator.prototype.CreateCleanupMeasureTask = function () {
        var _this = this;
        var t = new Task("CleanupDistanceMeasures");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._distanceMeasures = [];
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateTriggerSensorReadTask = function () {
        var _this = this;
        var t = new Task("TriggerSensorRead");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._runner.TriggerAllSensorsRead();
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateMeasureTask = function () {
        var _this = this;
        var t = new Task("Measure");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._distanceMeasures.push(_this._ultrasonic.GetValue());
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateStartTurningTask = function () {
        var _this = this;
        var t = new Task("StartTurning");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this.StartTurning();
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateWaitTask = function () {
        var t = new Task("Wait");
        t.PreDelay = this._generalWaitDelay;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateStopMovementTask = function () {
        var _this = this;
        var t = new Task("StopMovement");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this.StopMovement();
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.Move = function (left, right) {
        this._motorLeft.SetValue(left);
        this._motorRight.SetValue(right);
        this._runner.RunActor(this._motorLeft);
        this._runner.RunActor(this._motorRight);
    };
    StayInZoneNavigator.prototype.StopMovement = function () {
        this.Move(0, 0);
    };
    StayInZoneNavigator.prototype.StartTurning = function () {
        this.Move(-100, 100);
    };
    StayInZoneNavigator.prototype.GetMin = function (distances) {
        var min = 1000;
        var max = 0;
        for (var i = 0; i < distances.length; i++) {
            if (distances[i] < min) {
                min = distances[i];
            }
            if (distances[i] > max) {
                max = distances[i];
            }
        }
    };
    StayInZoneNavigator.prototype.Start = function () {
        console.log("Start navigation task");
        this._task.Execute();
    };
    StayInZoneNavigator.prototype.Stop = function () {
        this.StopMovement();
    };
    return StayInZoneNavigator;
})();
module.exports = StayInZoneNavigator;
//# sourceMappingURL=StayInZoneNavigator.js.map