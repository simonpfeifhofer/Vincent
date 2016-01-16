var Task = require("../TaskRunner/Task");
var SequentialTask = require("../TaskRunner/SequentialTask");
var LoopTask = require("../TaskRunner/LoopTask");
var StayInZoneNavigator = (function () {
    function StayInZoneNavigator(runner, motorLeft, motorRight, ultrasonic) {
        var _this = this;
        this._generalWaitDelay = 1000;
        this._singleTurnWaitDelay = 800;
        this._singleForwardWaitDelay = 1500;
        this._turnSteps = 6;
        this._wallLimitInCm = 40;
        this._forwardStepsLimit = 10;
        this._motorAlternationDecision = false;
        this._currentRandomForwardSteps = 0;
        this._maxRandomForwardSteps = 0;
        this._runner = runner;
        this._motorLeft = motorLeft;
        this._motorRight = motorRight;
        this._ultrasonic = ultrasonic;
        this._distanceMeasures = new Array();
        var turnAndMeasureDistanceLoop = new SequentialTask([
            this.CreateStartTurningLeftTask(),
            this.CreateSingleTurnStepWaitTask(),
            this.CreateStopMovementTask(),
            this.CreateWaitTask(),
            this.CreateTriggerSensorReadTask(),
            this.CreateWaitTask(),
            this.CreateMeasureTask()
        ]);
        var turnAndMeasureDistance = new SequentialTask([
            this.CreateCleanupMeasureTask(),
            this.CreateTriggerSensorReadTask(),
            this.CreateWaitTask(),
            this.CreateMeasureTask(),
            new LoopTask(function () { return _this._distanceMeasures.length < _this._turnSteps; }, turnAndMeasureDistanceLoop)
        ]);
        var turnToMaxDistanceLoop = new SequentialTask([
            this.CreateRemoveLastDistanceTask(),
            this.CreateStartTurningRightTask(),
            this.CreateSingleTurnStepWaitTask(),
            this.CreateStopMovementTask(),
            this.CreateWaitTask()
        ]);
        var turnToMaxDistance = new SequentialTask([
            new LoopTask(function () {
                return _this._distanceMeasures.length > 0 &&
                    Math.max.apply(Math, _this._distanceMeasures) !=
                        _this._distanceMeasures[_this._distanceMeasures.length - 1];
            }, turnToMaxDistanceLoop)
        ]);
        var moveForwardLoop = new SequentialTask([
            this.CreateIncrementMoveForwardTask(),
            this.CreateStartMovingForwardTask(),
            this.CreateForwardWaitTask(),
            this.CreateStopMovementTask(),
            this.CreateWaitTask(),
            this.CreateTriggerSensorReadTask(),
            this.CreateWaitTask()
        ]);
        var moveForward = new SequentialTask([
            this.CreateGenerateMaxRandomForwardStepsTask(),
            this.CreateTriggerSensorReadTask(),
            this.CreateWaitTask(),
            new LoopTask(function () {
                return _this._currentRandomForwardSteps <= _this._maxRandomForwardSteps &&
                    _this._ultrasonic.GetValue() > _this._wallLimitInCm;
            }, moveForwardLoop)
        ]);
        this._mainTask =
            new LoopTask(function () { return true; }, new SequentialTask([
                this.CreateWaitTask(),
                turnAndMeasureDistance,
                turnToMaxDistance,
                moveForward
            ]));
    }
    StayInZoneNavigator.prototype.CreateIncrementMoveForwardTask = function () {
        var _this = this;
        var t = new Task("IncrementMoveForward");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._currentRandomForwardSteps++;
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateGenerateMaxRandomForwardStepsTask = function () {
        var _this = this;
        var t = new Task("GenerateMaxRandomForwardSteps");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._maxRandomForwardSteps = Math.round(Math.random() * _this._forwardStepsLimit);
            _this._currentRandomForwardSteps = 0;
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateRemoveLastDistanceTask = function () {
        var _this = this;
        var t = new Task("RemoveLastDistance");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this._distanceMeasures.pop();
            return [];
        };
        return t;
    };
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
    StayInZoneNavigator.prototype.CreateStartTurningLeftTask = function () {
        var _this = this;
        var t = new Task("StartTurningLeft");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this.StartTurningLeft();
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateStartTurningRightTask = function () {
        var _this = this;
        var t = new Task("StartTurningRight");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this.StartTurningRight();
            return [];
        };
        return t;
    };
    StayInZoneNavigator.prototype.CreateStartMovingForwardTask = function () {
        var _this = this;
        var t = new Task("StartMovingForward");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            _this.StartMovingForward();
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
    StayInZoneNavigator.prototype.CreateForwardWaitTask = function () {
        var t = new Task("ForwardWait");
        t.PreDelay = this._singleForwardWaitDelay;
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
    StayInZoneNavigator.prototype.CreateSingleTurnStepWaitTask = function () {
        var t = new Task("Wait");
        t.PreDelay = this._singleTurnWaitDelay;
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
        if (right > left) {
            this._runner.RunActor(this._motorLeft);
            this._runner.RunActor(this._motorRight);
        }
        else if (left < right) {
            this._runner.RunActor(this._motorRight);
            this._runner.RunActor(this._motorLeft);
        }
        else if (this._motorAlternationDecision) {
            this._runner.RunActor(this._motorRight);
            this._runner.RunActor(this._motorLeft);
        }
        else if (!this._motorAlternationDecision) {
            this._runner.RunActor(this._motorLeft);
            this._runner.RunActor(this._motorRight);
        }
        var stopMovement = left == 0 && right == 0;
        if (!stopMovement) {
            this._motorAlternationDecision = !this._motorAlternationDecision;
        }
    };
    StayInZoneNavigator.prototype.StopMovement = function () {
        this.Move(0, 0);
    };
    StayInZoneNavigator.prototype.StartTurningLeft = function () {
        this.Move(-150, 150);
    };
    StayInZoneNavigator.prototype.StartTurningRight = function () {
        this.Move(150, -150);
    };
    StayInZoneNavigator.prototype.StartMovingForward = function () {
        this.Move(100, 100);
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
        this._mainTask.Execute();
    };
    StayInZoneNavigator.prototype.Stop = function () {
        this.StopMovement();
    };
    return StayInZoneNavigator;
})();
module.exports = StayInZoneNavigator;
//# sourceMappingURL=StayInZoneNavigator.js.map