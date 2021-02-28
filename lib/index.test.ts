import * as idbExport from './index'
import { openDB } from 'idb'

const initSingleStoreDb = async (dbName: string) => {
    const db1 = await openDB(dbName, 1, {
        upgrade(db) {
            db.createObjectStore('testStore')
        }
    })

    await db1.add('testStore', {foo: 'bar'}, 1)
    await db1.add('testStore', {fizz: 'buzz'}, 2)

    db1.close()
}

const expectedSingleStoreDatabaseExportedModel = {
    testStore: [
        {key: 1, value: {foo: 'bar'}},
        {key: 2, value: {fizz: 'buzz'}}
    ]
}

const initMultipleStoreDb = async (dbName: string) => {
    const db1 = await openDB(dbName, 1, {
        upgrade(db) {
            db.createObjectStore('testStore1')
            db.createObjectStore('testStore2')
        }
    })

    await db1.add('testStore1', {foo1: 'bar1'}, 1)
    await db1.add('testStore1', {fizz1: 'buzz1'}, 2)
    await db1.add('testStore2', {foo2: 'bar2'}, "AAA")
    await db1.add('testStore2', {fizz2: 'buzz2'}, "BBB")

    db1.close()
}

const expectedMultipleStoreDatabaseExportedModel = {
    testStore1: [
        {key: 1, value: {foo1: 'bar1'}},
        {key: 2, value: {fizz1: 'buzz1'}}
    ],
    testStore2: [
        {key: "AAA", value: {foo2: 'bar2'}},
        {key: "BBB", value: {fizz2: 'buzz2'}}
    ]
}

const initEmptyDb = async (dbName: string) => {
    const db1 = await openDB(dbName, 1, {
        upgrade(db) {
            db.createObjectStore('testStore1')
            db.createObjectStore('testStore2')
        }
    })
}

const expectedEmptyDatabaseExportedModel = {
    testStore1: [ ],
    testStore2: [ ]
}


describe('single store database export', () => {

    beforeAll(async () => {
        await initSingleStoreDb('singleStoreDb')
    })

    test('simple export', async () => {
        const db = await openDB('singleStoreDb')
        expect(await idbExport.exportToJSONString(db)).toBe(JSON.stringify(expectedSingleStoreDatabaseExportedModel))
    })

})

describe('multiple store database export', () => {

    beforeAll(async () => {
        await initMultipleStoreDb('multipleStoreDb')
    })

    test('simple export', async () => {
        const db = await openDB('multipleStoreDb')
        expect(await idbExport.exportToJSONString(db)).toBe(JSON.stringify(expectedMultipleStoreDatabaseExportedModel))
    })
})

describe('database import', () => {

    beforeAll(async () => {
        await initEmptyDb('emptyDb')
    })

    test('simple import', async () => {
        const db = await openDB('emptyDb')
        await idbExport.importJSONString(db, JSON.stringify(expectedMultipleStoreDatabaseExportedModel))
        
        expect(await idbExport.exportToJSONString(db)).toBe(JSON.stringify(expectedMultipleStoreDatabaseExportedModel))
    })
})

describe('clear database', () => {

    beforeAll(async () => {
        await initMultipleStoreDb('dbToClear')
    })

    test('simple import', async () => {
        const db = await openDB('dbToClear')
        await idbExport.clearDatabase(db)
        expect(await idbExport.exportToJSONString(db)).toBe(JSON.stringify(expectedEmptyDatabaseExportedModel))
    })
})