import INavigator = require("./INavigator");
import MotorModule = require("../Peripherals/MotorModule");
import UltrasonicModule = require("../Peripherals/UltrasonicModule");
import ModulesRunner = require("../Peripherals/ModulesRunner");

class StayInZoneNavigator implements INavigator {

    private _lookAroundSteps = 20;
    private _lookIntervalMs = 200;

    private _runner: ModulesRunner;
    private _motorLeft: MotorModule;
    private _motorRight: MotorModule;
    private _ultrasonic: UltrasonicModule;

    constructor(runner: ModulesRunner, motorLeft: MotorModule, motorRight: MotorModule, ultrasonic: UltrasonicModule) {
        this._runner = runner;
        this._motorLeft = motorLeft;
        this._motorRight = motorRight;
        this._ultrasonic = ultrasonic;
    }

    Start() {
    }

    private LookAround(callback: (distances : Array<number>) => any){

        this._motorLeft.SetValue(100);
        this._motorRight.SetValue(-100);
        this._runner.RunActor(this._motorLeft);
        this._runner.RunActor(this._motorRight);

        var distances: Array<number> = new Array<number>();

        var interval = setInterval(
            () => {
                distances.push(this._ultrasonic.GetValue());
            },
            this._lookIntervalMs
        );

        setTimeout(
            () => {
                clearInterval(interval);
                callback(distances)
            },
            this._lookAroundSteps * this._lookIntervalMs
        );

        
    }

    Navigate() {

    }

    Stop() {
    }

}