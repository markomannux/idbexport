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
               items.push({key: cursor.key, value: {...cursor.value}})
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
            await transaction.objectStore(storeName).add(item.value, item.key )
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