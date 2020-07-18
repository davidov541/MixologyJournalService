const rewire = require('rewire');
const sinon = require('sinon');

const { Readable } = require("stream")

const uut = rewire('../../util/adls');

uut.__set__({
    process: {
        env: {
            "ADLS_USERFSNAME": process.env.ADLS_USERFSNAME,
            "ADLS_ACCOUNTNAME": process.env.ADLS_ACCOUNTNAME,
            "ADLS_PRIMARYKEY": process.env.ADLS_PRIMARYKEY
        }
    }
});

function setupMockADLSClient(directoryExists) {
    const createSpy = sinon.spy();
    const appendSpy = sinon.spy();
    const flushSpy = sinon.spy();

    const readData = Readable.from(["SomeData"])
    const readStub = sinon.stub();
    readStub.returns({readableStreamBody: readData});

    const fileMock = {
        create: createSpy,
        append: appendSpy,
        flush: flushSpy,
        read: readStub
    }

    const existsStub = sinon.stub()
    existsStub.returns(directoryExists)
    const createDirSpy = sinon.spy();

    const directoryMock = {
        exists: existsStub,
        create: createDirSpy
    }

    const getFileClientStub = sinon.stub()
    getFileClientStub.returns(fileMock)

    const getDirectoryClientStub = sinon.stub()
    getDirectoryClientStub.returns(directoryMock);

    const fileSystemMock = {
        getFileClient: getFileClientStub,
        getDirectoryClient: getDirectoryClientStub
    }

    const getFileSystemClientStub = sinon.stub()
    getFileSystemClientStub.returns(fileSystemMock)

    const serviceMock = {
        getFileSystemClient: getFileSystemClientStub
    }

    uut.__set__("createServiceClient", () => serviceMock);

    return {
        "getFileSystemClient": getFileSystemClientStub, 
        "getFileClient": getFileClientStub, 
        "getDirectoryClient": getDirectoryClientStub,
        "file": fileMock, 
        "directory": directoryMock
    }
}

describe('ADLSv2 Interface Tests', function () {
    test('should properly read a single file.', async function () {
        const spies = setupMockADLSClient(true);
        
        const fileSystemName = "SomeFS"
        const filePath = "foo.txt"
        expect(await uut.readFile(fileSystemName, filePath)).toEqual("SomeData")
        
        expect(spies.getDirectoryClient.called).toBeFalsy()
        expect(spies.directory.create.called).toBeFalsy()
        expect(spies.directory.exists.called).toBeFalsy()        
        expect(spies.file.create.called).toBeFalsy()
        expect(spies.file.append.called).toBeFalsy()
        expect(spies.file.flush.called).toBeFalsy()

        expect(spies.file.read.called).toBeTruthy()
        expect(spies.file.read.callCount).toBe(1)

        expect(spies.getFileClient.called).toBeTruthy()
        expect(spies.getFileClient.callCount).toBe(1)
        expect(spies.getFileClient.args[0]).toEqual([filePath])

        expect(spies.getFileSystemClient.called).toBeTruthy()
        expect(spies.getFileSystemClient.callCount).toBe(1)
        expect(spies.getFileSystemClient.args[0]).toEqual([fileSystemName])
    })

    test('should properly upload a single file.', async function () {
        const spies = setupMockADLSClient(true);
        
        const fileContent = "Hello World"
        const filePath = "foo.txt"
        await uut.uploadFile(fileContent, filePath)
        
        expect(spies.getDirectoryClient.called).toBeFalsy()
        expect(spies.directory.create.called).toBeFalsy()
        expect(spies.directory.exists.called).toBeFalsy()
        
        expect(spies.file.create.called).toBeTruthy()
        expect(spies.file.create.callCount).toBe(1)
        expect(spies.file.create.args[0]).toEqual([])

        expect(spies.file.append.called).toBeTruthy()
        expect(spies.file.append.callCount).toBe(1)
        expect(spies.file.append.args[0]).toEqual([fileContent, 0, fileContent.length])

        expect(spies.file.flush.called).toBeTruthy()
        expect(spies.file.flush.callCount).toBe(1)
        expect(spies.file.flush.args[0]).toEqual([fileContent.length])

        expect(spies.getFileClient.called).toBeTruthy()
        expect(spies.getFileClient.callCount).toBe(1)
        expect(spies.getFileClient.args[0]).toEqual([filePath])

        expect(spies.getFileSystemClient.called).toBeTruthy()
        expect(spies.getFileSystemClient.callCount).toBe(1)
        expect(spies.getFileSystemClient.args[0]).toEqual([process.env.ADLS_USERFSNAME])
    })
    
    test('should properly create a directory if it doesnt exist.', async function () {
        const spies = setupMockADLSClient(false);
        
        const directoryPath = "someDir"
        await uut.createDirectoryIfNotExists(directoryPath)
        
        expect(spies.file.create.called).toBeFalsy()
        expect(spies.file.append.called).toBeFalsy()
        expect(spies.file.flush.called).toBeFalsy()
        expect(spies.getFileClient.called).toBeFalsy()

        expect(spies.directory.create.called).toBeTruthy()
        expect(spies.directory.create.callCount).toBe(1)
        expect(spies.directory.create.args[0]).toEqual([])

        expect(spies.directory.exists.called).toBeTruthy()
        expect(spies.directory.exists.callCount).toBe(1)
        expect(spies.directory.exists.args[0]).toEqual([])

        expect(spies.getDirectoryClient.called).toBeTruthy()
        expect(spies.getDirectoryClient.callCount).toBe(1)
        expect(spies.getDirectoryClient.args[0]).toEqual([directoryPath])

        expect(spies.getFileSystemClient.called).toBeTruthy()
        expect(spies.getFileSystemClient.callCount).toBe(1)
        expect(spies.getFileSystemClient.args[0]).toEqual([process.env.ADLS_USERFSNAME])
    })
    
    test('should not create a directory if it already exists.', async function () {
        const spies = setupMockADLSClient(true);
        
        const directoryPath = "someDir"
        await uut.createDirectoryIfNotExists(directoryPath)
        
        expect(spies.file.create.called).toBeFalsy()
        expect(spies.file.append.called).toBeFalsy()
        expect(spies.file.flush.called).toBeFalsy()
        expect(spies.getFileClient.called).toBeFalsy()
        expect(spies.directory.create.called).toBeFalsy()

        expect(spies.directory.exists.called).toBeTruthy()
        expect(spies.directory.exists.callCount).toBe(1)
        expect(spies.directory.exists.args[0]).toEqual([])

        expect(spies.getDirectoryClient.called).toBeTruthy()
        expect(spies.getDirectoryClient.callCount).toBe(1)
        expect(spies.getDirectoryClient.args[0]).toEqual([directoryPath])

        expect(spies.getFileSystemClient.called).toBeTruthy()
        expect(spies.getFileSystemClient.callCount).toBe(1)
        expect(spies.getFileSystemClient.args[0]).toEqual([process.env.ADLS_USERFSNAME])
    })
    
    test('should give a SAS path to a file that will last for 24 hours.', async function () {
        const fakeSAS = "Some SAS"
        const fullSASLink = "https://Some Account.dfs.core.windows.net/Some FileSystem Name/foo.png?" + fakeSAS

        const generateSASMock = sinon.mock();
        generateSASMock.returns(fakeSAS)
        uut.__set__("generateDataLakeSASQueryParameters", generateSASMock);
        
        const filePath = "foo.png"
        expect(await uut.getSASForFile(filePath)).toEqual(fullSASLink)
        
        expect(generateSASMock.called).toBeTruthy()
        expect(generateSASMock.callCount).toBe(1)
    })
})