export class PromiseQueue<T>{
    private lastPromise: Promise<T> = Promise.resolve(null);
    private canceled = {};

    add(task:()=>Promise<T>,id:string=null):{id:string,promise:Promise<T>}{
        if(!id){
            id = "promise-"+Math.random();
        }
        let previousLast = this.lastPromise;
        this.lastPromise = new Promise<T>(async (resolve, reject) => {
            try {
                await previousLast;
                if(this.canceled[id]){
                    resolve(null);
                }else {
                    let res = await task();
                    resolve(res);
                }
                delete this.canceled[id];
            }catch (e) {
                reject(e);
            }
        });
        return {id,promise:this.lastPromise};
    }

    cancel(id:string){
        this.canceled[id]=true;
    }

}