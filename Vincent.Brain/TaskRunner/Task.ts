import IExecutable = require("./IExecutable");

class Task implements IExecutable {

    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public PreDelay: number;
    public Function: (...args: any[]) => any[];
    public PostDelay: number;
    public Continuation: IExecutable;

    private ExecuteContinuation(result: any[]) {
        if (this.Continuation != null) {
            this.Continuation.Execute(result);
        }
    }

    public Execute(...args: any[]) {
        setTimeout(
            () => {
                console.log("ExecuteTask %s", this._name);
                var result = this.Function(args);
                setTimeout(
                    this.ExecuteContinuation(result),
                    this.PostDelay
                    )
            },
            this.PreDelay
            );
    }

}

export = Task;