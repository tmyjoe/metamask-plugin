const version = 9

/*

This migration breaks out the CurrencyController substate

*/

const merge = require('deep-extend')

module.exports = {
  version,  

  migrate: function (versionedData) {
    versionedData.meta.version = version
    try {
      const state = versionedData.data
      const newState = transformState(state)
      versionedData.data = newState
    } catch (err) {
      console.warn(`MetaMask Migration #${version}` + err.stack)
    }
    return Promise.resolve(versionedData)
  },
}

function transformState (state) {
  const newState = merge({}, state, {
    CurrencyController: {
      currentCurrency: state.currentFiat || 'USD',
      conversionRate: state.conversionRate,
      conversionDate: state.conversionDate,
    },
  })
  delete newState.currentFiat
  delete newState.conversionRate
  delete newState.conversionDate

  return newState
}
