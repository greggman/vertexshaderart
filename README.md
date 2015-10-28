# vertexshaderart

See it live at [vertexshaderart.com](http://vertexshaderart.com)

Cleary inspired by [glslsandbox.com](http://glslsandbox.com) this one
only lets you edit a vertex shader. The vertex shaders main input is
just a `vertexId` that counts vertices.

## Why?

Because limits are AWESOME! Like 4k demos (or 1k) setting limits
almost always leads to more creativity.

## Contributing

Pull requests or suggestions welcome. Please [open an issue](http://github.com/greggman.com/vertexshaderart/issues).

## Building

### Prerequsites

*   Install [node.js](http://nodejs.org)

*   Install Grunt

    type `sudo npm -g install grunt`.  No `sudo` on windows

*   Install http-server

    type `sudo npm -g install http-server`. No `sudo` on windows

*   Install [Meteor](http://meteor.com)

### Visualizer vs Website

The site is split into 2 parts.

1.  A stand alone editor/visualizer

    To run this cd to the folder you cloned this repo in and type

        http-server

    Now open a browser to [`http://localhost:8080/src/`](http://localhost:8080/src/).

    You should see the shader editor with a shader running.

    The source for this editor is in the `src` folder. The main entry point is
    `src/js/main.js`

    The code is a little funky becaue this was created first and then fitted into
    Meteor. Because Meteor replaces the entire DOM on the fly, when running in Meteor
    the code inits once, keeps the canvas and editor DOM elements around and inserts
    and removes them when required. Any variable that starts with `s.` is something
    that survives across pages when on the website.

    There's also a special `on` function to attach events to elements. Instead of
    doing `someElement.addEventListener(event, func)` you instead do
    `on(someElement, event, func). This allows the code track and remove all event listeners
    when Meteor destroys the DOM because otherwise there would be a bunch of handlers
    still attached on those elements.

    **Note:** The visualizer is set to pause when its window does not have the focus.
    That includes if the URL bar or the devtools have the focus.
    This is to save battery when I'm doing dev but it can be a problem for debugging.
    depending on what code you're working on. It checks if it's running on
    `'localhost'` to enable this feature. You can override this by adding
    `?pauseOnBlur=false` to the URL.

2.  A Meteor based website

    The meteor based website exists at `server/vertexshaderart`. To run it

        cd server/vertexshaderart
        ./start

    This will launch meteor. Once it's running you can open a browser to
    [`http://localhost:3000`](http://localhost:3000) and you should see effectively
    the same site as http://www.vertexshaderart.com

    **Note:** The site run this way has the *page size*, the number of thumbnails to show per page,
    set to 3. This is so it's easy to test the pagination code without needing
    to add hundreds of entries. You can change that in `server/vertexshaderart/settings.json`

### Updating the visiualizer into the meteor website.

    To update the visiualizer/editor into the meteor website cd to the root folder of this repo
    and type `grunt`.

    That will

    *   Compile all the JavaScript used in the visualizer app into 1 file and copy it
        to `server/vertexshaderart/client/vsart.js`

    *   Convert `src/index.html` into meteor templates and save them in
        `server/vertexshaderart/client/vsart.html`

    *   Concat all the css used by the visualizer and save in
        `server/vertexshaderart/client/vsart.css`

    *   Extract all the shaders from HTML into JavaScript and save in
        `server/vertexshaderart/client/vsshaders.js`

### Options for the visualizer/editor

The standalone visualizer/editor has a few options you can pass in on the URL. Options
are passed in by adding a `?` and then `key=value&key=value`.
(eg: `http://localhost:8080/src/?settings=audio2&local=true`)

    *   `local=true`

        This makes it use local music instead of going through soundcloud.

    *   `settings=<name>`

        Where name is one of `audio`, `audio2`, `spiro`, `default`.

        There are 4 built in visualiations. In the code search for `s.sets`

    *   `showHistory=true`

        This fills the screen with the texture that contains the music history.

    *   `long=true`

        Along with `local=true` as in `local=true&long=true` provides a really long
        name and title for the music to test that layout doesn't get broken.

    *   `pauseOnBlur=false`

        See above.

## Deploying

Coming soon...

## Changelist

See [CHANGELIST.md](CHANGELIST.md).

## License

[MIT](LICENSE.md)


