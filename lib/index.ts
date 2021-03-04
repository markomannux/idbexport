export async function exportToJSONString(db: any): Promise<string> {
    const objectStoreNamesSet: Set<string> = new Set(db.objectStoreNames)
    const objectStoreNames: string[] = Array.from(objectStoreNamesSet)
    
    const transaction = db.transaction(objectStoreNames, 'readonly')

    const exportObject: {[key: string]:any[]} = {}

    return Promise.all(objectStoreNames.map (async (storeName: string) => {
        let cursor = await transaction.objectStore(storeName).openCursor()
        const items = [] 
        while(true) {
            if(cursor) {
               const value = serialize(cursor.value)
               items.push({key: cursor.key, value: {...value}})
               cursor = await cursor?.continue()
            } else break
        } 

        exportObject[storeName] = items
    })).then(() => {
        return JSON.stringify(exportObject)
    })
}

export async function importJSONString(db: any, jsonString: string): Promise<void[]> {
    const objectStoreNamesSet: Set<string> = new Set(db.objectStoreNames)
    const objectStoreNames: string[] = Array.from(objectStoreNamesSet)
    
    const transaction = db.transaction(objectStoreNames, 'readwrite')

    const importObject = JSON.parse(jsonString)

    return Promise.all(objectStoreNames.map(async (storeName: string) => {
        const items = importObject[storeName]
        
        items.map(async (item: any) => {
            await transaction.objectStore(storeName).add(deserialize(item.value), item.key )
        })
    }))        
}

export async function clearDatabase(db: any): Promise<void[]> {
    const objectStoreNamesSet: Set<string> = new Set(db.objectStoreNames)
    const objectStoreNames: string[] = Array.from(objectStoreNamesSet)
    
    const transaction = db.transaction(objectStoreNames, 'readwrite')


    return Promise.all(objectStoreNames.map(async (storeName: string) => {
        await transaction.objectStore(storeName).clear()
    }))        
}

function serialize(item: any): any {

    if(!item) return item;
    if (item instanceof Date) return {"idbexport.date": item.toISOString()}
    if (!isObject(item)) return item

    const res: any = {}
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            res[key] = serialize(item[key])
        }
    } 
    return res
}

function deserialize(item: any): any {

    if(!item) return item;
    if (!isObject(item)) return item

    let res: any = {}
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            if (key === "idbexport.date") {
                res = new Date(item[key])
            } else {
                res[key] = deserialize(item[key])
            }
        }
    } 
    return res
}

const isObject = (obj: any) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
};