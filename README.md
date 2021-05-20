# Skifree.js

This fork is an integration example for Dividat's External Game Interface (EGI). Uses EGI scripts, with `PlayEGI.onSignal` to handle game lifecycle and player inputs, and `PlayEGI.finish` to push a new score. The green timer bar is done with `PlayEGIHelpers.timer`.

To test it with Play[dev], run `npm install && make compile`, then start a static web server in the repo (for instance `python -m http.server`). Go to https://play.dividat.com/playDev.html and then enter the `index.html` as requested.

---

## Graphics development

To test a built version, run `make serve`.

### Sprites

When the development server is running you can find an overview of all sprites used in the game at [http://localhost:8000?sprites](http://localhost:8000?sprites). There you will find a row for each sprite, with all of its parts listed left to right.

You can change the zoom level and smoothing settings using query parameters `zoom` and `pixel`.

For example to see what sprites look like at double size and without smoothing, use `http://localhost:8000?sprites&zoom=2&pixel`.

### Overriding sprites

To try out alternative sprites without much effort, you can put files in the `sprites/` folder in this project. Each file must have a specific name of `<sprite>-<part>.png` to be picked up in the game. You can use the sprite overview above to find out the sprite and part names.

You will probably have to define an appropriate size multiple in the file `sprite-overrides.js`.

## Features so far:

* Skiing down a never-ending skislope with randomly-generated trees which do not have transparent backgrounds
* Collision detection with trees - and the appropriate reaction
* Turning left and right
* Stopping
* MONSTAHS! GRAAAAHHH! They even eat you and then run away because they're full
* Distance tracking so you can see how far you've gone, you absolute badass
* Speed boost (this was a little-known feature to get away from monsters) using the F key
* **MOBILE SUPPORT** - This is cool - try loading the [**the demo page**](http://basicallydan.github.com/skifree.js) on a mobile device and then use your finger to direct the skier around the piste. Also try double-tap ;)
* Rainbow jump platforms & jumping - though a couple of improvements could be made
* LocalStorage high-score (thanks, [@ddoolin](https://github.com/ddoolin)!)
* Custom-sized Hitboxes
* Big trees & crashing into them both whilst skiing and jumping

## So, what's left to do?

This is what I'm gonna do, probably in this order. Who the hell knows. There are other features to the original game but I'm not going to add them to the list until I've gotten through this one.

* Rocks
* Snowboarders

Some features which weren't in the original which I'd like to give a go:

* Being a snowboarder instead of a boring old skier
* Tricks, or something?
* Multiplayer (ooooo wouldn't that be fun?!)

## F*ck this, let me play the game goddammit

* Open up index.html in Chrome, or maybe even Firefox - I haven't tested it in anything but Chrome and Mobile Safari yet, and I probably won't I'm afraid
* Go.

## I like to run Unit tests before I do ANYTHING.

* Right, well first you need to do an `npm install`
* Run `mocha` and you should see some beautiful passing tests

## This is pretty frickin' sweet but it's clearly not finished. I can totally improve it. Let me improve it, dammit.

* We are #seekingcontributors
* Make a pull request with your awesome additions.
* Maybe raise an issue?

If you'd like an easy way to see how the game works, you can play the original in an Emulator: https://archive.org/details/win3_WINSKI

## Contributors

Here's some lovely people who were kind enough to have opinions and spirit enough to make a pull request.

* [@tomgrim1](https://github.com/tomgrim1)
* [@ddoolin](https://github.com/ddoolin)
* [@andersevenrud](https://github.com/andersevenrud)

Thanks!

## Third-party credits

* [HTML5 Boilerplate](http://html5boilerplate.com) provided a bunch of useful markup and stuff
* [Wing Wang Wao](http://spriters-resource.com/submitter/Wing%20Wang%20Wao) of the [Spriters Resource Forum](http://spriters-resource.com) did an amazing job of providing the sprites which I have extended slightly. Thanks!
* Thank you [Chris Pirih](http://ski.ihoc.net/) for making the original.

## License

See [license.md](blob/master/license.md)
