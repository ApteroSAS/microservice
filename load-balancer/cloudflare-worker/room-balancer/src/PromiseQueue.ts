export function makeid(length: number) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export class PromiseQueue<T> {
    private lastPromise: Promise<T> = Promise.resolve(null) as Promise<T>;
    private canceled: { [id: string]: boolean } = {};
    private queueNumber = 0;

    /**
     *
     * @param onlyLast if true all task are cancel and only the last one is keep alive (a task started still finishes)
     */
    constructor(
        private onlyLast: boolean = false
    ) {
    }

    getQueueNumber(): number {
        return this.queueNumber;
    }

    add(task: () => Promise<T>, id: string | null = null): { id: string, promise: Promise<T> } {
        if (!id) {
            id = "promise-" + makeid(8);
        }
        let previousLast = this.lastPromise;
        this.queueNumber++;
        let currentPromise = new Promise<T>(async (resolve, reject) => {
            try {
                await previousLast;
            } catch (e) {
                /* ignore error of previous promise*/
            }
            try {
                if (this.canceled[id || ""]) {
                    reject("canceled");
                } else {
                    if (this.onlyLast && currentPromise != this.lastPromise) {
                        //cancel the task
                        reject("canceled caused by not last");
                    } else {
                        //finally executing the task
                        let res = await task();
                        resolve(res);
                    }
                }
                delete this.canceled[id || ""];
            } catch (e) {
                reject(e);
            }
            this.queueNumber--;
        });
        this.lastPromise = currentPromise
        return {id, promise: this.lastPromise};
    }

    cancel(id: string) {
        this.canceled[id] = true;
    }

}