<p align="center">
    <img src="https://avatars.githubusercontent.com/u/142582396?s=400&u=081f3176405a243f5090002723556c3e723089e3&v=4" width="200"/>
</p>

<b align="center">
    
    Tiny & Simply 'Map'-based storage: set(), get(), save() and more
    
</b>
<hr>

# Features
- VERY easy to use
- "One File - One Storage Exemplar" mechanism (bugs & multi-load protection)
- Safe asynchronous `save()` (protection from multi-saving)
- "Exact key types": you can only use the specified keys, e.g. `day ${number}` (`day 6`, `day 293`, `day 32`, etc., but not `hour 7`)
- Additional methods: `hasValue()`, `getKey()`, `filter()` & easy JSON convertion
- Pretty JSON format (depth=1)

# API
- class `Storage <V? extends JSONSupportedValueTypes, K? extends string>`
>- *constructor* `(path: string, autosave?: boolean | number)`;
>- *field* `path: string`;
>- *getter* `size: number`
>- `get (key: K): V | undefined`
>- `has (key: K): boolean`
>- `set (key: K, value: V): this`
>- `delete (key: K): boolean`
>- `clear (): void`
>- `values (): IterableIterator<V>`
>- `keys (): IterableIterator<K>`
>- `entries (): IterableIterator<[K, V]>`
>- `forEach (callbackfn: (value: V, key: K, map: Map<K, V>) => unknown): void`
>- `hasValue (value: V): boolean`
>- `getKey (value: V, single?: boolean): K[]`
>- `filter (callbackfn: (value: V, key: K, map: Map<K, V>) => boolean): Map<K, V>`
>- *async* `save (): Promise<void>`
>- *getter* `asJSON: string`
>- `[Symbol.iterator]: () => IterableIterator<[K, V]>`
>- `[Symbol.toStringTag]: string`
>- *static* `asJSON (map: Map<string, JSONSupportedValueTypes>): string`
>- *static* *field* `oneFile_oneStorage: boolean`;

# Requirements
- [NodeJS](https://nodejs.org/en), recommended `v18` or newer

# Setup
1. Install `storage` via npm:
```bat
npm i @eds-fw/storage
```

2. Use `storage`:
```js
//file.js, type: CJS
const { Storage } = require("@eds-fw/storage");
const scores = new Storage(
    "./scores_data.json", //Warning! Path is calculated from CWD
    60_000 //Autosave timeout. Will be saved automatically every minute
);
scores.set("me", 186);
scores.save();
scores.set("john", 231);
if (storage.has("peter"))
    storage.delete("peter");
console.log(storage.asJSON());
/* Output (pretty):
{
    "me": 186,
    "john": 231
}
*/
```
Or, using TypeScript and "exact key types":
```ts
//file.ts
import { Storage } from "@eds-fw/storage";
type Keys_t = `score_${string}` | `bestScore_${string}`;
const scores = new Storage<number, Keys_t>(
    "./scores.json",
    60_000
);
scores.set("score_me", 132); //OK
scores.set("score_john", 452); //OK
scores.set("bestScore_me", 972); //OK
scores.set("previousScore_me", 274); //TypeScript Error
```

# [Source (git)](https://github.com/eds-fw/storage)
# [Issues (git)](https://github.com/eds-fw/storage/issues)
