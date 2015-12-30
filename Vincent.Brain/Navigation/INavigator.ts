import MotorModule = require("../Peripherals/MotorModule");

interface INavigator {

    Start();
    Navigate();
    Stop();

}

export = INavigator;