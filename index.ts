import { JSONSupportedValueTypes, equal } from "@easy-ds-bot/utils";
import { accessSync, readFileSync } from "fs";
import { writeFile } from "fs/promises";

const DEFAULT_AUTOSAVE_INTERVAL = 60_000; //1 minute
const loadedStorages: Record<string, Storage> = {};

export class Storage<V extends JSONSupportedValueTypes = JSONSupportedValueTypes,
                     K extends string = string> implements Map<K, V>
{
    /** There can be no more than one Storage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage = true;

    #saving = false;
    #Map!: Map<K, V>;
    public path!: string;

    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    public constructor(path: string, autosave?: boolean | number)
    {
        try {
            accessSync(path);
        } catch (err)
        {
            throw new Error(`Database: File '${path}' not found:\n\t${err}`);
        }

        if (Storage.oneFile_oneStorage && path in loadedStorages)
            return loadedStorages[path] as Storage<V, K>;
        else {
            const entries = Object.entries(JSON.parse(readFileSync(path).toString() || "{}")) as [K, V][];
            this.#Map = new Map(entries);
        }

        this.path = path;

        if (autosave)
        setInterval(() => this.save(), typeof autosave == "number" ? autosave : DEFAULT_AUTOSAVE_INTERVAL);
    }

    public get size(): number
        { return this.#Map.size; }
    public get(key: K): V | undefined
        { return this.#Map.get(key); }
    public has(key: K): boolean
        { return this.#Map.has(key); }
    
    public set(key: K, value: V): this
        { this.#Map.set(key, value); return this; }
    public delete(key: K): boolean
        { return this.#Map.delete(key); }
    public clear(): void
        { return this.#Map.clear(); }

    public values(): IterableIterator<V>
        { return this.#Map.values(); }
    public keys(): IterableIterator<K>
        { return this.#Map.keys(); }
    public entries(): IterableIterator<[K, V]>
        { return this.#Map.entries(); }
    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => unknown): void
        { return this.#Map.forEach(callbackfn); }

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
        for (const ent of this.entries())
            if (equal(value, ent[0][1]))
            {
                result.push(ent[0]);
                if (single) break;
            }
        return result;
    }
    public filter(callbackfn: (value: V, key: K, map: Map<K, V>) => boolean): Map<K, V>
    {
        const result = new Map();
        for (const [key, val] of this.entries())
            if (callbackfn(val, key, this.#Map))
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
    {
        return Storage.asJSON(this.#Map);
    }

    //====================================================

    public [Symbol.iterator] = this.#Map[Symbol.iterator];
    public [Symbol.toStringTag] = this.#Map[Symbol.toStringTag];

    public static asJSON(map: Map<string, JSONSupportedValueTypes>, pretty: boolean = true): string
    {
        if (map.size == 0) return "{}";
        let entries = "";

        map.forEach((v, k) => {
            entries += (pretty ? ',\n\t' : ',') + `"${k}":${pretty?' ':''}${JSON.stringify(v)}`
        });

        return '{' + entries.slice(1) + (pretty ? '\n}' : '}');
    }
}
