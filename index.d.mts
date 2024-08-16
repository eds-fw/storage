import { JSONSupported } from "@eds-fw/utils";
export declare class Storage<V extends JSONSupported = JSONSupported, K extends string = string> extends Map<K, V> {
    #private;
    /** There can be no more than one Storage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage: boolean;
    path: string;
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    constructor(path: string, autosave?: boolean | number);
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    static create<V extends JSONSupported = JSONSupported, K extends string = string>(...params: ConstructorParameters<typeof Storage>): Storage<V, K>;
    hasValue(value: V): boolean;
    getKey(value: V, single?: boolean): K[];
    filter(callbackfn: (value: V, key: K, map: Map<K, V>) => boolean): Map<K, V>;
    save(): Promise<void>;
    get asJSON(): string;
    [Symbol.toStringTag]: string;
    static asJSON(map: Map<string, JSONSupported>, pretty?: boolean): string;
}
export default Storage;
/**
 * `Array`-based storage
 */
export declare class ArrayStorage<V extends JSONSupported = JSONSupported> extends Array<V> {
    #private;
    /** There can be no more than one ArrayStorage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage: boolean;
    path: string;
    private constructor();
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    static create<V extends JSONSupported = JSONSupported>(path: string, autosave?: boolean | number): ArrayStorage<V>;
    save(): Promise<void>;
    get asJSON(): string;
    [Symbol.toStringTag]: string;
    static asJSON(arr: JSONSupported[], pretty?: boolean): string;
}
