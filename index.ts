import { JSONSupported, equal } from "@eds-fw/utils";
import { accessSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve as resolvePath, dirname as getPathDir } from "path";

const DEFAULT_AUTOSAVE_INTERVAL = 60_000; //1 minute

export class Storage<V extends JSONSupported = JSONSupported,
                     K extends string = string> extends Map<K, V>
{
    /** There can be no more than one Storage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage = true;
    static #loadedStorages: Record<string, Storage> = {};

    #saving = false;
    public path!: string;

    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    public constructor(path: string, autosave?: boolean | number)
    {
        try {
            accessSync(path);
        }
        catch (err) {
            const absolutePath = resolvePath(path);
            const dir = getPathDir(absolutePath);
            mkdirSync(dir, { recursive: true });
            writeFileSync(absolutePath, "{}", "utf8");
        }

        if (Storage.oneFile_oneStorage && path in Storage.#loadedStorages)
            return Storage.#loadedStorages[path] as Storage<V, K>;
        else {
            const entries = Object.entries(JSON.parse(readFileSync(path).toString() || "{}")) as [K, V][];
            super(entries);
        }

        this.path = path;

        if (autosave)
        setInterval(() => this.save(), typeof autosave == "number" ? autosave : DEFAULT_AUTOSAVE_INTERVAL);
    }
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    public static create<V extends JSONSupported = JSONSupported,
                         K extends string = string>
        (...params: ConstructorParameters<typeof Storage>): Storage<V, K>
        { return new this(...params) }

    public hasValue(value: V): boolean
    {
        for (const val of this.values())
            if (equal(value, val))
                return true;
        return false;
    }
    public getKey(value: V, single: boolean = false): K[]
    {
        const result: K[] = [];
        for (const [k, v] of this.entries())
            if (equal(value, v))
            {
                result.push(k);
                if (single) break;
            }
        return result;
    }
    public filter(callbackfn: (value: V, key: K, map: Map<K, V>) => boolean): Map<K, V>
    {
        const result = new Map();
        for (const [key, val] of this.entries())
            if (callbackfn(val, key, this))
                result.set(key, val);
        return result;
    }

    //====================================================

    public async save(): Promise<void>
    {
        if (this.#saving) return;
        this.#saving = true;
        await writeFile(this.path, this.asJSON);
        this.#saving = false;
    }

    public get asJSON(): string
        { return Storage.asJSON(this); }

    //====================================================

    public [Symbol.toStringTag] = "Storage";

    public static asJSON(map: Map<string, JSONSupported>, pretty: boolean = true): string
    {
        if (map.size == 0) return "{}";
        let entries = "";

        map.forEach((v, k) => {
            entries += (pretty ? ',\n\t' : ',') + `"${k}":${pretty?' ':''}${JSON.stringify(v)}`
        });

        return '{' + entries.slice(1) + (pretty ? '\n}' : '}');
    }
}
export default Storage;



/**
 * `Array`-based storage
 */
export class ArrayStorage<V extends JSONSupported = JSONSupported> extends Array<V>
{
    /** There can be no more than one ArrayStorage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage = true;
    static #loadedStorages: Record<string, ArrayStorage> = {};

    #saving = false;
    public path!: string;

    private constructor() { super() }

    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    public static create<V extends JSONSupported = JSONSupported>(path: string, autosave?: boolean | number): ArrayStorage<V>
    {
        const storage = new this();
        try {
            accessSync(path);
        }
        catch (err) {
            const absolutePath = resolvePath(path);
            const dir = getPathDir(absolutePath);
            mkdirSync(dir, { recursive: true });
            writeFileSync(absolutePath, "[]", "utf8");
        }

        if (ArrayStorage.oneFile_oneStorage && path in ArrayStorage.#loadedStorages)
            return ArrayStorage.#loadedStorages[path] as ArrayStorage<V>;
        else {
            const entries = JSON.parse(readFileSync(path).toString() || "[]") as V[];
            storage.push(...entries);
        }
        storage.path = path;

        if (autosave)
        setInterval(() => storage.save(), typeof autosave == "number" ? autosave : DEFAULT_AUTOSAVE_INTERVAL);
        
        return storage as ArrayStorage<V>;
    }

    //====================================================

    public async save(): Promise<void>
    {
        if (this.#saving) return;
        this.#saving = true;
        await writeFile(this.path, this.asJSON);
        this.#saving = false;
    }

    public get asJSON(): string
        { return ArrayStorage.asJSON(this); }

    //====================================================

    public [Symbol.toStringTag] = "ArrayStorage";

    public static asJSON(arr: JSONSupported[], pretty: boolean = true): string
    {
        if (arr.length == 0) return "[]";
        let entries = "";

        arr.forEach(v => {
            entries += (pretty ? ',\n\t' : ',') + `${JSON.stringify(v)}`
        });

        return '[' + entries.slice(1) + (pretty ? '\n]' : ']');
    }
}
