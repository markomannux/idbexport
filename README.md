# IdbExport

[![Actions Status](https://github.com/markomannux/memembed/workflows/Build%20and%20Test/badge.svg)](https://github.com/markomannux/idbexport/actions)

Utility functions for exporting (and re-importing) a whole indexedDB database. It's inspired from [indexeddb-export-import](https://www.npmjs.com/package/indexeddb-export-import) but is realised in typescript and is Promise based.

Example usage:

```
import * as idbExport from 'idbexport'

// Export
const sourceDB = await openDB('sourceDB')
const exportedString = await idbExport.exportToJSONString(sourceDB)

// Import back
const db = await openDB('targetDB')
await idbExport.importJSONString(targetDB, exportedString)

```

## exportToJSONString(db)
Export provided database to a json string.

db: IDBDatabase

return a Promise<string>

## importJSONString(db, jsonString)
Import a previously created json string into provided database.

db: IDBDatabase  
jsonString: string

return a Promise<void[]>

## clearDatabase(db)
Clear provided database

db: IDBDatabase

return a Promise<void[]>
