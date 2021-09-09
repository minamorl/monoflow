interface HasError {
    get error(): unknown;
}

class WrappedFunction<T extends (...args: any[]) => any> {
    _state: unknown = null
    _value: any = null;
    _callable: T;
    constructor(ref: T) {
        this._callable = ref;
        this._value = null;
    }
    callFn(...args: Parameters<T>) {
        if (this._state) return this; // ignore 
        try {
            this._value = this._callable(...args);
        } catch (e) {
            this._state = e
        }
        return this;
    }
    get isValidState() {
        return this._state === null;
    }
    get value() {
        return this._value;
    }
    get error() {
        return this._state;
    }
    get wrappedFunction() {
        return this._callable;
    }
}

class Result {
    _callbacks: WrappedFunction<(...args: any[]) => any>[];
    _handler: (...args: any[]) => any;
    constructor(ref: (...args: any[]) => any) {
        this._callbacks = [new WrappedFunction(ref)];
        this._handler = () => {};
    }
    then(otherRef: (...args: any[]) => any) {
        this._callbacks.push(new WrappedFunction(otherRef))
        return this;
    }

    fallback(handler: (...args: any[]) => any) {
        this._handler = handler;
        return this;
    }
    
    exec(...args: any[]) {
        let result = this._callbacks.shift()!.callFn(...args);
        if (!result.isValidState) return this._handler(result.error)
        for (const cb of this._callbacks) {
            result = cb.callFn(result.value);
            if (!result.isValidState) return this._handler(result.error)
        }
        return result.value;
    }
}
