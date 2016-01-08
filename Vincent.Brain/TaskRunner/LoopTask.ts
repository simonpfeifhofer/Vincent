import IExecutable = require("./IExecutable");
import Task = require("./Task");

class LoopTask implements IExecutable {

    private _condition: () => boolean;
    private _loopExecutable: IExecutable;
    private _prepared: boolean;

    constructor(condition: () => boolean, loopExecutable: IExecutable) {
        this._condition = condition;
        this._loopExecutable = loopExecutable;
    }

    private EnsurePreparation() {
        if (this._prepared) {
            return;
        }
        var conditionalContinuation = new Task("LoopCondition");
        conditionalContinuation.Function = (...args: any[]) => {
            if (this._condition()) {
                console.log("Continue in loop");
                this._loopExecutable.Execute(args);
            } else {
                console.log("Break loop");
                if (this.Continuation != null) {
                    this.Continuation.Execute(args);
                }
            }
            return [];
        }
        this._loopExecutable.Continuation = conditionalContinuation;
        this._prepared = true;
    }

    public Execute(...args: any[]) {
        this.EnsurePreparation();
        this._loopExecutable.Execute(args);
    }

    public Continuation: IExecutable;

}

export = LoopTask;