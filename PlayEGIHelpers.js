// Dividat Play EGI helpers
(function () {
  var timer = function (node) {
    var timerNode = document.createElement('div')
    timerNode.setAttribute('style',
      'position: absolute; bottom: 0; left: 0; right: 0; height: 5px;background-color: #43ac6a;'
    )
    node.appendChild(timerNode)

    return {
      setPercent: function (pct) {
        timerNode.style.width = pct * 100 + '%'
      }
    }
  }

  window.PlayEGIHelpers = {timer: timer}
})()
