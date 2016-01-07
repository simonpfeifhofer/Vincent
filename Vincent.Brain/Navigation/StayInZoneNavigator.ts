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
    private _turnSteps: number = 10;

    private _runner: ModulesRunner;
    private _motorLeft: MotorModule;
    private _motorRight: MotorModule;
    private _ultrasonic: UltrasonicModule;
    private _task: SequentialTask;

    private _distanceMeasures: Array<number>;

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
                this.CreateWaitTask(),
                this.CreateStartTurningTask(),
                this.CreateWaitTask(),
                this.CreateStopMovementTask(),
                this.CreateWaitTask()
            ]
        );
        var turnAndMeasureDistance: SequentialTask = new SequentialTask(
            [
                this.CreateCleanupMeasureTask(),
                new LoopTask(
                    () => { return this._distanceMeasures.length < this._turnSteps },
                    turnAndMeasureDistanceLoop
                    )
            ]
        );

        var turnToMaxDistance: SequentialTask = new SequentialTask(
            [

            ]
            );

        var moveForward: SequentialTask = new SequentialTask(
            [

            ]
            );

        this._task = new SequentialTask(
            [
                this.CreateWaitTask(),
                turnAndMeasureDistance,
                //turnToMaxDistance,
                //moveForward
            ]
        );

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

    private CreateStartTurningTask(): Task {

        var t = new Task("StartTurning");
        t.PreDelay = 0;
        t.PostDelay = 0;
        t.Function = (...params: any[]) => {
            this.StartTurning();
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

    private StartTurning() {
        this.Move(-100, 100);
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
        this._task.Execute();
    }

    public Stop() {
        this.StopMovement();
    }

}

export = StayInZoneNavigator;