'use strict'

const { LambdaRunnable, LambdaError } = require('../../lib')
const Logger = require('../../lib/Logger')

describe('LambdaRunnable', () => {
  let sandbox = null
  const logger = new Logger()

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should create new instance', () => {
    const lambda = new LambdaRunnable({ logger })
    expect(LambdaRunnable).to.have.property('handler')
    expect(lambda).to.have.property('logger', logger)
    expect(lambda).to.have.property('environmentVariables')
    expect(lambda.environmentVariables).to.be.empty
    expect(lambda).to.have.property('event', undefined)
    expect(lambda).to.have.property('context', undefined)
    expect(lambda).to.have.property('callback', undefined)
    expect(lambda).to.have.property('isCallbackExecuted', false)
  })

  it('should collect environment variables', () => {
    const collectEnvironmentVariablesStub = sandbox.stub(LambdaRunnable.prototype, 'collectEnvironmentVariables')
    collectEnvironmentVariablesStub.returns({ foo: 'bar' })
    const lambda = new LambdaRunnable({ logger })
    expect(lambda).to.have.property('environmentVariables')
    expect(lambda.environmentVariables).to.not.be.empty
    expect(lambda.environmentVariables).to.have.property('foo', 'bar')
  })

  it('should get execution context', () => {
    const lambda = new LambdaRunnable({ logger })
    const executionContext = lambda.getExecutionContext()
    expect(executionContext).to.have.property('event', undefined)
    expect(executionContext).to.have.property('context', undefined)
    expect(executionContext).to.have.property('logger', logger)
    expect(executionContext).to.have.property('environmentVariables')
    expect(lambda).to.have.property('isCallbackExecuted', false)
    expect(executionContext.environmentVariables).to.be.empty
  })

  it('should execute callback', () => {
    const callback = () => {}
    const lambda = new LambdaRunnable({ logger, callback })
    const callbackStub = sandbox.stub(lambda, '_callback')
    const executeCallbackSpy = sandbox.spy(lambda, 'executeCallback')
    expect(lambda).to.have.property('isCallbackExecuted', false)
    lambda.executeCallback(null, {})
    sinon.assert.calledOnce(executeCallbackSpy)
    sinon.assert.calledOnce(callbackStub)
    expect(lambda).to.have.property('isCallbackExecuted', true)
  })

  it('should not execute callback if already done', () => {
    const callback = () => {}
    const lambda = new LambdaRunnable({ logger, callback })
    const callbackStub = sandbox.stub(lambda, 'callback')
    const executeCallbackSpy = sandbox.spy(lambda, 'executeCallback')
    lambda._isCallbackExecuted = true
    lambda.executeCallback(null, {})
    sinon.assert.calledOnce(executeCallbackSpy)
    sinon.assert.notCalled(callbackStub)
    expect(lambda).to.have.property('isCallbackExecuted', true)
  })

  it('should execute handler', async() => {
    const event = {}
    const context = {}
    const callback = () => {}
    const lambda = new LambdaRunnable({ logger, event, context, callback })
    const runStub = sandbox.stub(lambda, 'run')
    const executeCallbackSpy = sandbox.spy(lambda, 'executeCallback')
    const callbackSpy = sandbox.spy(lambda, '_callback')
    runStub.returns(Promise.resolve({}))
    await lambda.executeHandler()
    sinon.assert.calledOnce(runStub)
    sinon.assert.calledOnce(executeCallbackSpy)
    sinon.assert.calledOnce(callbackSpy)
    const [ error, result ] = callbackSpy.args[0]
    expect(error).to.be.null
    expect(result).to.have.property('statusCode', 200)
    expect(result).to.have.property('headers')
    expect(result).to.have.property('body', '{}')
  })

  it('should execute handler with Error handling', async() => {
    const event = {}
    const context = {}
    const callback = () => {}
    const lambda = new LambdaRunnable({ loggerLevel: 'fatal', event, context, callback })
    const runStub = sandbox.stub(lambda, 'run')
    const executeCallbackSpy = sandbox.spy(lambda, 'executeCallback')
    const callbackSpy = sandbox.spy(lambda, '_callback')
    const message = 'AWS Lambda not beingg reliable, sad moment!'
    runStub.throws(new Error(message))
    await lambda.executeHandler()
    sinon.assert.calledOnce(runStub)
    sinon.assert.calledOnce(executeCallbackSpy)
    sinon.assert.calledOnce(callbackSpy)
    const [ error, result ] = callbackSpy.args[0]
    expect(error).to.be.an('Error')
    expect(result).to.be.null
  })

  it('should execute handler with LambdaError handling', async() => {
    const event = {}
    const context = {}
    const callback = () => {}
    const lambda = new LambdaRunnable({ loggerLevel: 'fatal', event, context, callback })
    const runStub = sandbox.stub(lambda, 'run')
    const executeCallbackSpy = sandbox.spy(lambda, 'executeCallback')
    const callbackSpy = sandbox.spy(lambda, '_callback')
    const message = 'Your code sucks'
    runStub.throws(new LambdaError(message, 400))
    await lambda.executeHandler()
    sinon.assert.calledOnce(runStub)
    sinon.assert.calledOnce(executeCallbackSpy)
    sinon.assert.calledOnce(callbackSpy)
    const [ error, result ] = callbackSpy.args[0]
    expect(error).to.be.null
    expect(result).to.have.property('statusCode', 400)
    expect(result).to.have.property('body', `{"message":"${message}"}`)
  })

})
