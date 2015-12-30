import IModule = require("./IModule");

interface ISensorModule extends IModule{

    ApplyValue(value: any);
    GetValue(): any;
    RegisterCallback(callback: (value: any) => any);

}

export = ISensorModule;