// polyfill fetch
global.fetch = global.fetch || require('isomorphic-fetch')

const assert = require('assert')
const extend = require('xtend')
const rp = require('request-promise')
const nock = require('nock')
const configManagerGen = require('../lib/mock-config-manager')

describe('config-manager', function() {
  var configManager

  beforeEach(function() {
    configManager = configManagerGen()
  })

  describe('confirmation', function() {

    describe('#getConfirmedDisclaimer', function() {
      it('should return undefined if no previous key exists', function() {
        var result = configManager.getConfirmedDisclaimer()
        assert.ok(!result)
      })
    })

    describe('#setConfirmedDisclaimer', function() {
      it('should make getConfirmedDisclaimer return true once set', function() {
        assert.equal(configManager.getConfirmedDisclaimer(), undefined)
        configManager.setConfirmedDisclaimer(true)
        var result = configManager.getConfirmedDisclaimer()
        assert.equal(result, true)
      })

      it('should be able to set undefined', function() {
        configManager.setConfirmedDisclaimer(undefined)
        var result = configManager.getConfirmedDisclaimer()
        assert.equal(result, undefined)
      })

      it('should persist to local storage', function() {
        configManager.setConfirmedDisclaimer(true)
        var data = configManager.getData()
        assert.equal(data.isDisclaimerConfirmed, true)
      })
    })
  })

  describe('#setConfig', function() {

    it('should set the config key', function () {
      var testConfig = {
        provider: {
          type: 'rpc',
          rpcTarget: 'foobar'
        }
      }
      configManager.setConfig(testConfig)
      var result = configManager.getData()

      assert.equal(result.config.provider.type, testConfig.provider.type)
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)
    })

    it('setting wallet should not overwrite config', function() {
      var testConfig = {
        provider: {
          type: 'rpc',
          rpcTarget: 'foobar'
        },
      }
      configManager.setConfirmedDisclaimer(true)
      configManager.setConfig(testConfig)

      var testWallet = {
        name: 'this is my fake wallet'
      }
      configManager.setWallet(testWallet)

      var result = configManager.getData()
      assert.equal(result.wallet.name, testWallet.name, 'wallet name is set')
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)
      assert.equal(configManager.getConfirmedDisclaimer(), true)

      testConfig.provider.type = 'something else!'
      configManager.setConfig(testConfig)

      result = configManager.getData()
      assert.equal(result.wallet.name, testWallet.name, 'wallet name is set')
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)
      assert.equal(result.config.provider.type, testConfig.provider.type)
      assert.equal(configManager.getConfirmedDisclaimer(), true)
    })
  })

  describe('wallet nicknames', function() {
    it('should return null when no nicknames are saved', function() {
      var nick = configManager.nicknameForWallet('0x0')
      assert.equal(nick, null, 'no nickname returned')
    })

    it('should persist nicknames', function() {
      var account = '0x0'
      var nick1 = 'foo'
      var nick2 = 'bar'
      configManager.setNicknameForWallet(account, nick1)

      var result1 = configManager.nicknameForWallet(account)
      assert.equal(result1, nick1)

      configManager.setNicknameForWallet(account, nick2)
      var result2 = configManager.nicknameForWallet(account)
      assert.equal(result2, nick2)
    })
  })

  describe('rpc manipulations', function() {
    it('changing rpc should return a different rpc', function() {
      var firstRpc = 'first'
      var secondRpc = 'second'

      configManager.setRpcTarget(firstRpc)
      var firstResult = configManager.getCurrentRpcAddress()
      assert.equal(firstResult, firstRpc)

      configManager.setRpcTarget(secondRpc)
      var secondResult = configManager.getCurrentRpcAddress()
      assert.equal(secondResult, secondRpc)
    })
  })

  describe('transactions', function() {
    beforeEach(function() {
      configManager.setTxList([])
    })

    describe('#getTxList', function() {
      it('when new should return empty array', function() {
        var result = configManager.getTxList()
        assert.ok(Array.isArray(result))
        assert.equal(result.length, 0)
      })
    })

    describe('#setTxList', function() {
      it('saves the submitted data to the tx list', function() {
        var target = [{ foo: 'bar' }]
        configManager.setTxList(target)
        var result = configManager.getTxList()
        assert.equal(result[0].foo, 'bar')
      })
    })
  })
})
