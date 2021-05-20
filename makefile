VERSION ?= edge

COPY_TO = ../diviapps/frontend/src/external/skifree.js

CFLAGS = -c -g -D $(VERSION)

help:
	@echo "  deps        install dependencies"
	@echo "  test        runs tests"
	@echo "  compile     sets up your js files for production"
	@echo "  serve       run the webserver"

deps:
	npm install

test:
	npm test

compile:
	mkdir -p dist
	./node_modules/browserify/bin/cmd.js js/main.js -d -o dist/skifree.js
	./node_modules/uglify-js/bin/uglifyjs dist/skifree.js -c > dist/skifree.min.js

copy:
	cp *.png index.html $(COPY_TO)
	cp -R css dist vendor $(COPY_TO)

serve:
	python -m SimpleHTTPServer

