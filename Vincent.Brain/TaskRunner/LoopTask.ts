import IExecutable = require("./IExecutable");
import Task = require("./Task");

class LoopTask implements IExecutable {

    private _condition: () => boolean;
    private _loopExecutable: IExecutable;
    private _build: boolean;

    constructor(condition: () => boolean, loopExecutable: IExecutable) {
        this._condition = condition;
        this._loopExecutable = loopExecutable;
    }

    public Execute(...args: any[]) {

        if (!this._build) {

            var conditionalContinuation = new Task("LoopCondition");
            conditionalContinuation.Function = (...args: any[]) => {
                if (this._condition()) {
                    console.log("Continue in loop");
                    this._loopExecutable.Execute(args);
                } else {
                    console.log("Break loop");
                    this.Continuation.Execute(args);
                }
                return [];
            }
            this._loopExecutable.Continuation = conditionalContinuation;
            this._build = true;

        }

        this._loopExecutable.Execute(args);

    }

    public Continuation: IExecutable;

}

export = LoopTask;