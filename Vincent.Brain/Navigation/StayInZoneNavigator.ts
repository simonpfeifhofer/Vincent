import INavigator = require("./INavigator");
import MotorModule = require("../Peripherals/MotorModule");
import UltrasonicModule = require("../Peripherals/UltrasonicModule");
import ModulesRunner = require("../Peripherals/ModulesRunner");
import IExecutable = require("../TaskRunner/IExecutable");
import Task = require("../TaskRunner/Task");
import SequentialTask = require("../TaskRunner/SequentialTask");
import LoopTask = require("../TaskRunner/LoopTask");

class StayInZoneNavigator implements INavigator {

    private _generalWaitDelay: number = 2000;
    private _singleTurnWaitDelay: number = 1000;
    private _singleForwardWaitDelay: number = 1500;
    private _turnSteps: number = 4;
    private _forwardStepsLimit: number = 5;

    private _runner: ModulesRunner;
    private _motorLeft: MotorModule;
    private _motorRight: MotorModule;
    private _ultrasonic: UltrasonicModule;
    private _mainTask: LoopTask;

    private _distanceMeasures: Array<number>;

    private _currentRandomForwardSteps: number = 0;
    private _maxRandomForwardSteps: number = 0;

    constructor(runner: ModulesRunner, motorLeft: MotorModule, motorRight: MotorModule, ultrasonic: UltrasonicModule) {
        this._runner = runner;
        this._motorLeft = motorLeft;
        this._motorRight = motorRight;
        this._ultrasonic = ultrasonic;

        this._distanceMeasures = new Array<number>();

        var turnAndMeasureDistanceLoop: SequentialTask = new SequentialTask(
            [
                this.CreateTriggerSensorReadTask(),
                this.CreateWaitTask(),
                this.CreateMeasureTask(),
                this.CreateStartTurningLeftTask(),
                this.CreateSingleTurnStepWaitTask(),
                this.CreateStopMovementTask(),
                this.CreateWaitTask()
            ]
        );
        var turnAndMeasureDistance: SequentialTask = new SequentialTask(
            [
                this.CreateCleanupMeasureTask(),
                new LoopTask(
                    () => this._distanceMeasures.length < this._turnSteps,
                    turnAndMeasureDistanceLoop
                )
            ]
        );

        var turnToMaxDistanceLoop: SequentialTask = new SequentialTask(
            [
                this.CreateRemoveLastDistanceTask(),
                this.CreateStartTurningRightTask(),
                this.CreateSingleTurnStepWaitTask(),
                this.CreateStopMovementTask(),
                this.CreateWaitTask()
            ]
        );

        var turnToMaxDistance: SequentialTask = new SequentialTask(
            [
                this.CreateStartTurningRightTask(),
                this.CreateSingleTurnStepWaitTask(),
                this.CreateStopMovementTask(),
                this.CreateWaitTask(),
                new LoopTask(
                    () => 
                        this._distanceMeasures.length > 0 &&
                        this._distanceMeasures.indexOf(
                            Math.max.apply(
                                Math,
                                this._distanceMeasures
                            )
                        ) !=
                        (this._distanceMeasures.length - 1)
                    ,
                    turnToMaxDistanceLoop
                    )
            ]
            );

        var moveForwardLoop: SequentialTask = new SequentialTask(
            [
                this.CreateStartMovingForwardTask(),
                this.CreateForwardWaitTask(),
                this.CreateStopMovementTask(),
                this.CreateWaitTask(),
                this.CreateTriggerSensorReadTask(),
                this.CreateWaitTask()
            ]
        );

        var moveForward: SequentialTask = new SequentialTask(
            [
                this.CreateGenerateMaxRandomForwardStepsTask(),
                this.CreateTriggerSensorReadTask(),
                this.CreateWaitTask(),
                new LoopTask(
                    () =>
                        this._currentRandomForwardSteps < this._maxRandomForwardSteps &&
                        this._ultrasonic.GetValue() > 40,
                    moveForwardLoop
                )
            ]
            );

        this._mainTask =
            new LoopTask(
                () => true,
                new SequentialTask(
                    [
                        this.CreateWaitTask(),
                        turnAndMeasureDistance,
                        turnToMaxDistance,
                        moveForward
                    ]
                )
            );

    }

    private CreateGenerateMaxRandomForwardStepsTask(): Task {

        var t = new Task("GenerateMaxRandomForwardSteps");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this._maxRandomForwardSteps = Math.round(Math.random() * this._forwardStepsLimit);
            this._currentRandomForwardSteps = 0;
            return [];
        };
        return t;

    }

    private CreateRemoveLastDistanceTask(): Task {

        var t = new Task("RemoveLastDistance");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this._distanceMeasures.pop();
            return [];
        };
        return t;

    }

    private CreateCleanupMeasureTask(): Task {

        var t = new Task("CleanupDistanceMeasures");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this._distanceMeasures = [];
            return [];
        };
        return t;

    }

    private CreateTriggerSensorReadTask(): Task {

        var t = new Task("TriggerSensorRead");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this._runner.TriggerAllSensorsRead();
            return [];
        };
        return t;

    }

    private CreateMeasureTask(): Task {

        var t = new Task("Measure");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this._distanceMeasures.push(this._ultrasonic.GetValue());
            return [];
        };
        return t;

    }

    private CreateStartTurningLeftTask(): Task {

        var t = new Task("StartTurningLeft");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this.StartTurningLeft();
            return [];
        };
        return t;

    }

    private CreateStartTurningRightTask(): Task {

        var t = new Task("StartTurningRight");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this.StartTurningRight();
            return [];
        };
        return t;

    }

    private CreateStartMovingForwardTask(): Task {

        var t = new Task("StartMovingForward");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this.StartMovingForward();
            return [];
        };
        return t;

    }

    private CreateWaitTask() {

        var t = new Task("Wait");
        t.PreDelay = this._generalWaitDelay;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            return [];
        };
        return t;

    }

    private CreateForwardWaitTask() {

        var t = new Task("ForwardWait");
        t.PreDelay = this._singleForwardWaitDelay;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            return [];
        };
        return t;

    }

    private CreateSingleTurnStepWaitTask() {

        var t = new Task("Wait");
        t.PreDelay = this._singleTurnWaitDelay;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            return [];
        };
        return t;

    }

    private CreateStopMovementTask(): Task {

        var t = new Task("StopMovement");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this.StopMovement();
            return [];
        };
        return t;

    }

    private Move(left: number, right: number) {
        this._motorLeft.SetValue(left);
        this._motorRight.SetValue(right);
        this._runner.RunActor(this._motorLeft);
        this._runner.RunActor(this._motorRight);
    }

    private StopMovement() {
        this.Move(0, 0);
    }

    private StartTurningLeft() {
        this.Move(-150, 150);
    }

    private StartTurningRight() {
        this.Move(150, -150);
    }

    private StartMovingForward() {
        this.Move(100, 100);
    }

    private GetMin(distances: Array<number>) {

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

    }

    public Start() {
        console.log("Start navigation task");
        this._mainTask.Execute();
    }

    public Stop() {
        this.StopMovement();
    }

}

export = StayInZoneNavigator;