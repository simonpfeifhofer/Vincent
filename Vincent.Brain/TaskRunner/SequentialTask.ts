﻿import IExecutable = require("./IExecutable");

class SequentialTask implements IExecutable {

    private _build: boolean = false;
    private _tasks: Array<IExecutable>;

    constructor(tasks: Array<IExecutable>) {
        this._tasks = tasks;
    }

    public Execute(...args: any[]) {

        if (!this._build) {
            for (var i = 0; i < this._tasks.length; i++) {
                if ((i + 1) < this._tasks.length) {
                    console.log("assign continuation %d -> %d of %d", i, i + 1, this._tasks.length);
                    this._tasks[i].Continuation = this._tasks[i + 1];
                }
            }
            this._tasks[this._tasks.length - 1].Continuation = this.Continuation;
            this._build = true;
        }
        this._tasks[0].Execute(args);

    }

    public Continuation: IExecutable;

}

export = SequentialTask;