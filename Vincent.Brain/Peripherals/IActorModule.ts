import IModule = require("./IModule");

interface IActorModule extends IModule{
    SetValue(value: number);
}

export = IActorModule;