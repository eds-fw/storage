import { equal } from "@eds-fw/utils";
import { accessSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve as resolvePath, dirname as getPathDir } from "path";
const DEFAULT_AUTOSAVE_INTERVAL = 60_000; //1 minute
export class Storage extends Map {
    /** There can be no more than one Storage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage = true;
    static #loadedStorages = {};
    #saving = false;
    path;
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    constructor(path, autosave) {
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
            return Storage.#loadedStorages[path];
        else {
            const entries = Object.entries(JSON.parse(readFileSync(path).toString() || "{}"));
            super(entries);
        }
        this.path = path;
        if (autosave)
            setInterval(() => this.save(), typeof autosave == "number" ? autosave : DEFAULT_AUTOSAVE_INTERVAL);
    }
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    static create(...params) { return new this(...params); }
    hasValue(value) {
        for (const val of this.values())
            if (equal(value, val))
                return true;
        return false;
    }
    getKey(value, single = false) {
        const result = [];
        for (const [k, v] of this.entries())
            if (equal(value, v)) {
                result.push(k);
                if (single)
                    break;
            }
        return result;
    }
    filter(callbackfn) {
        const result = new Map();
        for (const [key, val] of this.entries())
            if (callbackfn(val, key, this))
                result.set(key, val);
        return result;
    }
    //====================================================
    async save() {
        if (this.#saving)
            return;
        this.#saving = true;
        await writeFile(this.path, this.asJSON);
        this.#saving = false;
    }
    get asJSON() { return Storage.asJSON(this); }
    //====================================================
    [Symbol.toStringTag] = "Storage";
    static asJSON(map, pretty = true) {
        if (map.size == 0)
            return "{}";
        let entries = "";
        map.forEach((v, k) => {
            entries += (pretty ? ',\n\t' : ',') + `"${k}":${pretty ? ' ' : ''}${JSON.stringify(v)}`;
        });
        return '{' + entries.slice(1) + (pretty ? '\n}' : '}');
    }
}
export default Storage;
/**
 * `Array`-based storage
 */
export class ArrayStorage extends Array {
    /** There can be no more than one ArrayStorage per file. If `true`, all instances with the same paths will be equal. */
    static oneFile_oneStorage = true;
    static #loadedStorages = {};
    #saving = false;
    path;
    constructor() { super(); }
    /**
     * @param path **WARNING!** It is calculated from `process.cwd()`
     */
    static create(path, autosave) {
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
            return ArrayStorage.#loadedStorages[path];
        else {
            const entries = JSON.parse(readFileSync(path).toString() || "[]");
            storage.push(...entries);
        }
        storage.path = path;
        if (autosave)
            setInterval(() => storage.save(), typeof autosave == "number" ? autosave : DEFAULT_AUTOSAVE_INTERVAL);
        return storage;
    }
    //====================================================
    async save() {
        if (this.#saving)
            return;
        this.#saving = true;
        await writeFile(this.path, this.asJSON);
        this.#saving = false;
    }
    get asJSON() { return ArrayStorage.asJSON(this); }
    //====================================================
    [Symbol.toStringTag] = "ArrayStorage";
    static asJSON(arr, pretty = true) {
        if (arr.length == 0)
            return "[]";
        let entries = "";
        arr.forEach(v => {
            entries += (pretty ? ',\n\t' : ',') + `${JSON.stringify(v)}`;
        });
        return '[' + entries.slice(1) + (pretty ? '\n]' : ']');
    }
}
