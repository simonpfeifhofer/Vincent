interface IExecutable {

    Execute(...args: any[]);
    Continuation: IExecutable;

}

export = IExecutable;