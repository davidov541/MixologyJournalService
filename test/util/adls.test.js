const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../util/adls');

function setupMockADLSClient() {
    const createSpy = sinon.spy();
    const appendSpy = sinon.spy();
    const flushSpy = sinon.spy();

    const fileMock = {
        create: createSpy,
        append: appendSpy,
        flush: flushSpy
    }

    const getFileClientStub = sinon.stub()
    getFileClientStub.returns(fileMock)

    const fileSystemMock = {
        getFileClient: getFileClientStub
    }

    const getFileSystemClientStub = sinon.stub()
    getFileSystemClientStub.returns(fileSystemMock)

    const serviceMock = {
        getFileSystemClient: getFileSystemClientStub
    }

    uut.__set__("createServiceClient", () => serviceMock);

    return {"getFileSystemClient": getFileSystemClientStub, "getFileClient": getFileClientStub, "file": fileMock}
}

process.env.ADLS_CONFIGFSNAME = "Some FileSystem Name"

describe('ADLSv2 Interface Tests', function () {
    test('should properly upload a single file.', async function () {
        const spies = setupMockADLSClient();
        
        const fileContent = "Hello World"
        const filePath = "foo.txt"
        await uut.uploadFile(fileContent, filePath)
        
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
        expect(spies.getFileSystemClient.args[0]).toEqual([process.env.ADLS_CONFIGFSNAM])
    })
})