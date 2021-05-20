// Global dependencies which return no modules
require('./lib/canvasRenderingContext2DExtensions')
require('./lib/extenders')
require('./lib/plugins')

// External dependencies
var Hammer = require('hammerjs')
var Mousetrap = require('br-mousetrap')

// Game Objects
var SpriteArray = require('./lib/spriteArray')
var Monster = require('./lib/monster')
var Sprite = require('./lib/sprite')
var Snowboarder = require('./lib/snowboarder')
var Skier = require('./lib/skier')
var InfoBox = require('./lib/infoBox')
var Game = require('./lib/game')

// Local variables for starting the game
var mainCanvas = document.getElementById('skifree-canvas')
var dContext = mainCanvas.getContext('2d')
var global = this
var infoBoxControls = 'Use the mouse or WASD to control the player'
var sprites = require('./spriteInfo')
var imageSources = []
;(function () {
  for (var key in sprites) {
    var imageFile = sprites[key].$imageFile
    if (imageFile) {
      if (imageSources.indexOf(imageFile) == -1) {
        imageSources.push(imageFile)
      }

      imageSources = imageSources.concat(
        Object.keys(sprites[key].parts).map(function (partKey) {
          return ("sprites/" + key + "-" + partKey + ".png")
        })
      )
    }
  }
})()

var pixelsPerMetre = 18
var distanceTravelledInMetres = 0
var monsterDistanceThreshold = 2000
var livesLeft = 5
var loseLifeOnObstacleHit = false
var dropRates = {smallTree: 4, tallTree: 2, jump: 1, thickSnow: 1, rock: 1}

var balanceFactor = 1
var settings = {
  duration: 60000,
  wheelchair: false
}

function loadImages (sources, next) {
  var loaded = 0
  var images = {}

  function finish () {
    loaded += 1
    if (loaded === sources.length) {
      next(images)
    }
  }

  sources.each(function (src) {
    var im = new Image()
    im.onload = finish
    im.onerror = finish
    im.src = src
    dContext.storeLoadedImage(src, im)
  })
}

function monsterHitsSkierBehaviour (monster, skier) {
  skier.isEatenBy(monster, function () {
    livesLeft -= 1
    monster.isFull = true
    monster.isEating = false
    skier.isBeingEaten = false
    monster.setSpeed(skier.getSpeed())
    monster.stopFollowing()
    var randomPositionAbove = dContext.getRandomMapPositionAboveViewport()
    monster.setMapPositionTarget(randomPositionAbove[0], randomPositionAbove[1])
  })
}

function startNeverEndingGame (images) {
  var player
  var startSign
  var infoBox
  var game

  function resetGame () {
    distanceTravelledInMetres = 0
    livesLeft = 5
    game.reset()
    game.addStaticObject(startSign)
  }

  function detectEnd () {
    if (!game.isPaused()) {
      infoBox.setLines([
        'Game over!',
        'Hit space to restart'
      ])
      game.pause()
      game.cycle()
      window.PlayEGI.finish({
        distance: { type: 'RawInt', value: parseInt(distanceTravelledInMetres) }
      })
    }
  }

  function randomlySpawnNPC (spawnFunction, dropRate) {
    var rateModifier = Math.max(800 - mainCanvas.width, 0)
    if (Number.random(1000 + rateModifier) <= dropRate) {
      spawnFunction()
    }
  }

  function spawnMonster () {
    var newMonster = new Monster(sprites.monster)
    var randomPosition = dContext.getRandomMapPositionAboveViewport()
    newMonster.setMapPosition(randomPosition[0], randomPosition[1])
    newMonster.follow(player)
    newMonster.setSpeed(player.getStandardSpeed())
    newMonster.onHitting(player, monsterHitsSkierBehaviour)

    game.addMovingObject(newMonster, 'monster')
  }

  function spawnBoarder () {
    var newBoarder = new Snowboarder(sprites.snowboarder)
    var randomPositionAbove = dContext.getRandomMapPositionAboveViewport()
    var randomPositionBelow = dContext.getRandomMapPositionBelowViewport()
    newBoarder.setMapPosition(randomPositionAbove[0], randomPositionAbove[1])
    newBoarder.setMapPositionTarget(randomPositionBelow[0], randomPositionBelow[1])
    newBoarder.onHitting(player, sprites.snowboarder.hitBehaviour.skier)

    game.addMovingObject(newBoarder)
  }

  player = new Skier(sprites.skier)
  player.setMapPosition(0, 0)
  player.setMapPositionTarget(0, -10)
  if (loseLifeOnObstacleHit) {
    player.setHitObstacleCb(function () {
      livesLeft -= 1
    })
  }

  game = new Game(mainCanvas, player)

  startSign = new Sprite(sprites.signStart)
  game.addStaticObject(startSign)
  startSign.setMapPosition(-50, 0)
  dContext.followSprite(player)

  infoBox = new InfoBox({
    initialLines: [
      'Travelled 0m',
      'Skiers left: ' + livesLeft
    ],
    position: {
      top: 15,
      right: 10
    }
  })

  game.beforeCycle(function () {
    var newObjects = []
    if (player.isMoving) {
      newObjects = Sprite.createObjects([
        { sprite: sprites.smallTree, dropRate: dropRates.smallTree },
        { sprite: sprites.tallTree, dropRate: dropRates.tallTree },
        { sprite: sprites.jump, dropRate: dropRates.jump },
        { sprite: sprites.thickSnow, dropRate: dropRates.thickSnow },
        { sprite: sprites.rock, dropRate: dropRates.rock }
      ], {
        rateModifier: Math.max(800 - mainCanvas.width, 0),
        position: function () {
          return dContext.getRandomMapPositionBelowViewport()
        },
        player: player
      })
    }
    if (!game.isPaused()) {
      game.addStaticObjects(newObjects)

      randomlySpawnNPC(spawnBoarder, 0.1)
      distanceTravelledInMetres = parseFloat(player.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1)

      if (distanceTravelledInMetres > monsterDistanceThreshold) {
        randomlySpawnNPC(spawnMonster, 0.001)
      }

      infoBox.setLines([
        'Travelled ' + distanceTravelledInMetres + 'm',
        'Skiers left: ' + livesLeft,
        'Current Speed: ' + player.getSpeed()
      ])
    }
  })

  game.afterCycle(function () {
    if (livesLeft === 0) {
      detectEnd()
    }
  })

  // game.addUIElement(infoBox)

  window.PlayEGI.onSignal(function (signal) {
    switch (signal.type) {
      case 'Hello':
        window.PlayEGI.ready()

        if (signal.settings) {
          settings = {
            duration: (signal.settings.duration && signal.settings.duration.value) || settings.duration,
            wheelchair: (signal.settings.wheelchair && signal.settings.wheelchair.value) || settings.wheelchair
          }
        }

        var timer = window.PlayEGIHelpers.timer(document.body)
        game.afterCycle(function () {
          var elapsed = game.getRunningTime()
          if (elapsed >= settings.duration) {
            detectEnd()
          }
          timer.setPercent(elapsed / settings.duration)
        })
        break

      case 'Suspend':
        game.pause()
        break

      case 'Resume':
        game.resume()
        break

      case 'Ping':
        window.PlayEGI.pong()
        break

      case 'Step':
        switch (signal.direction) {
          case 'Up':
            player.stop()
            break

          case 'Left':
            if (player.direction === 270) {
              player.stepWest()
            } else {
              player.turnWest()
            }
            break

          case 'Right':
            if (player.direction === 90) {
              player.stepEast()
            } else {
              player.turnEast()
            }
            break

          case 'Down':
            player.setDirection(180)
            player.startMovingIfPossible()
            break
        }
        break

      case 'SensoState':
        var x = linearInterpolX(signal.state) * (settings.wheelchair ? 3 : 1)
        var canvasX = x * balanceFactor * mainCanvas.width + mainCanvas.width / 2
        game.setMouseX(canvasX)
        game.setMouseY(mainCanvas.height)
        player.resetDirection()
        player.startMovingIfPossible()
        break

      default:
        break
    }
  })

  player.isMoving = false
  player.setDirection(270)

  window.zoom = parseFloat(new URLSearchParams(document.location.search).get("zoom")) || 1
  window.smoothenImages = new URLSearchParams(document.location.search).get("pixel") == null
  if (document.location.search.indexOf("sprites") > -1) {
    var xPos = 5, yPos = 5
    function drawSpriteMap() {
    xPos = 10
    yPos = 10
    var width = xPos

    dContext.fillStyle = "#000000"
    dContext.font = "10px monospace"
    dContext.textBaseline = "top"
    for (var spriteKey in sprites) {
      if (spriteKey === 'superior') continue
      var sprite = sprites[spriteKey]
      var maxHeight = 0

      dContext.textAlign = "start"
      dContext.font = "bold 12px monospace"
      dContext.fillText(spriteKey, xPos, yPos)
      yPos += 20

      for (var partKey in sprite.parts) {
        var fr = sprite.parts[partKey]
        if (!Array.isArray(fr)) continue

        var frW = fr[2] * zoom
        var frH = fr[3] * zoom


        dContext.imageSmoothingEnabled = smoothenImages
        if (smoothenImages) {
          dContext.imageSmoothingQuality = 'high'
        }

        dContext.font = "10px monospace"
        dContext.textAlign = "center"
        dContext.drawImage(dContext.getLoadedImage(sprite.$imageFile), fr[0], fr[1], fr[2], fr[3], xPos, yPos, frW, frH)
        dContext.fillText(partKey, xPos + frW / 2, yPos + frH)

        xPos += frW + 20
        maxHeight = Math.max(maxHeight, frH)
      }
      width = Math.max(width, xPos)
      xPos = 10
      yPos += maxHeight + 30

    }
    return [width, yPos]
    }
    let [cWidth, cHeight] = drawSpriteMap()
    dContext.canvas.width = cWidth
    dContext.canvas.height = cHeight
    drawSpriteMap()
  }
}

// return linear interpolation of x on f, as relative coordinates (centered on 0)
function linearInterpolX (state) {
  var sumOfX = ['center', 'up', 'right', 'down', 'left'].map(function (d) {
    return state[d].f * (state[d].x - 1.5)
  }).reduce(function (sum, value) {
    return sum + value
  }, 0)

  return sumOfX
}

function resizeCanvas () {
  mainCanvas.width = window.innerWidth
  mainCanvas.height = window.innerHeight
}

window.addEventListener('resize', resizeCanvas, false)

resizeCanvas()

loadImages(imageSources, startNeverEndingGame)

this.exports = window
