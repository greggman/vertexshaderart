# vertexshaderart

# vertexshaderart.com is changing to a static site

This repo contains the older meteor based version. The repo for the new static
version is at https://github.com/greggman/vertexshaderart.com

---

See it live at [vertexshaderart.com](http://vertexshaderart.com)

Clearly inspired by [glslsandbox.com](http://glslsandbox.com) this one
only lets you edit a vertex shader. The vertex shaders main input is
just a `vertexId` that counts vertices.

## Why?

Because limits are AWESOME! Like 4k demos (or 1k) setting limits
almost always leads to more creativity.

## Tips

A few tips when making art

*   Consider making things as resolution independent as possible.

    *   `gl_PointSize`

        You might have a 2000x1000 desktop but someone might be viewing on a phone. If you set `gl_PointSize = 50.0`
        that might be perfect on your desktop but too big for a phone.

        You could do something like this at the bottom of your shader

            #define RESOLUTION_OF_MY_DISPLAY 2000.0
            gl_PointSize *= resolution.x / RESOLUTION_OF_MY_DISPLAY;
            
    *   the aspect of the display

        Remember that the user might be on a phone (so display taller than it is wide) vs a desktop (usually wider than tall).
        Consider taking that into account. For example scaling by the larger of resolution.x or resolution.y

*   Use `vertexCount` were appropriate

    You can certainly set a specific count and design your art around that but, if you'd like to it can be nice
    to try to make it self adjust.

    Example:

        #define POINTS_PER_CUBE 24.
        float cubeVertexId = mod(vertexId, POINTS_PER_CUBE);  // counts vertices in a cube
        float cubeId = floor(vertexCount / POINTS_PER_CUBE);  // counts cubes

## Embedding

You can embed a piece on your blog or whatever by putting the url in an iframe. Example

    <iframe width="700" height="400" src="http://www.vertexshaderart.com/art/uqWtxuQpEkfxqWXCK" frameborder="0" allowfullscreen></iframe>

The UI will be removed and there will put a ▶ icon to start it.

## Contributing

Pull requests or suggestions welcome. Please [open an issue](http://github.com/greggman.com/vertexshaderart/issues).

## Building

### Prerequsites

*   Install [node.js](http://nodejs.org)

*   Install [Meteor](http://meteor.com)

    Note: You do not need meteor to work on the visualizer

### Visualizer vs Website

The site is split into 2 parts.

1.  A stand alone editor/visualizer

    To run this cd to the folder you cloned this repo in and type

        npm run start

    Now open a browser to [`http://localhost:8080/src/`](http://localhost:8080/src/).

    You should see the shader editor with a shader running.

    The source for this editor is in the `src` folder. The main entry point is
    `src/js/main.js`

    The code is a little funky because this was created first and then fitted into
    Meteor. Because Meteor replaces the entire DOM on the fly, when running in Meteor
    the code inits once, keeps the canvas and editor DOM elements around and inserts
    and removes them when required. Any variable that starts with `s.` is something
    that survives across pages when on the website.

    There's also a special `on` function to attach events to elements. Instead of
    doing `someElement.addEventListener(event, func)` you instead do
    `on(someElement, event, func)`. This allows the code track and remove all event listeners
    when Meteor destroys the DOM because otherwise there would be a bunch of handlers
    still attached on those elements.

    **Note:** The visualizer is set to pause when its window does not have the focus.
    That includes if the URL bar or the devtools have the focus.
    This is to save battery when I'm doing dev but it can be a problem for debugging.
    depending on what code you're working on. It checks if it's running on
    `'localhost'` to enable this feature. You can override this by adding
    `?pauseOnBlur=false` to the URL.
    
    **Note:** You will not be able to use soundcloud tracks in the standalone editor.
    They changed their API (2021/7) so that a server is required.

2.  A Meteor based website

    The meteor based website exists at `server/vertexshaderart`. To run it first copy
    `settings.json` to `settings-dev.json`

        cd server/vertexshaderart
        cp settings.json settings-dev.json

    Then from the `server/vertershaderart` folder run `start`.

        ./start

    This will launch meteor. Once it's running you can open a browser to
    [`http://localhost:3000`](http://localhost:3000) and you should see effectively
    the same site as http://www.vertexshaderart.com though you'll have no data or users.
    
    Note: You will need a soundcloud client and secret in your `settings-dev.json`
    to use soundcloud tracks.

### Updating the visualizer into the meteor website.

To update the visiualizer/editor into the meteor website cd to the root folder of this repo
and type `npm run build`.

That will

*   Compile all the JavaScript used in the visualizer app into 1 file and copy it
    to `server/vertexshaderart/client/vsart.js`

*   Convert `src/index.html` into meteor templates and save them in
    `server/vertexshaderart/client/vsart.html`

    note: a comment in the form of `<!--template=name-->`
    will be converted to `{{> name}}`. This lets you insert other templates
    into the HTML from the visualizer.

*   Concat all the css used by the visualizer and save in
    `server/vertexshaderart/client/vsart.css`

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

*   `showFloatHistory=true`

    This fills the screen with the texture that contains the float music history.

*   `showTouchHistory=true`

    This fills the screen with the texture that contains the touch data history.

*   `long=true`

    Along with `local=true` as in `local=true&long=true` provides a really long
    name and title for the music to test that layout doesn't get broken.

*   `pauseOnBlur=false`

    See above.

*   `pause=true`

    A more extreme version of `pauseOnBlur'. It's effectively the same
    as `pauseOnBlur=true` and clicking the stop button at the top so
    that rendering is not running. I use this when I want to test UI
    layout on battery. I can muck with the CSS etc and not having it
    rendering the heavy graphics.

## Deploying

See [DEPLOY.md](DEPLOY.md)

## Changelist

See [CHANGELIST.md](CHANGELIST.md).

## License

[MIT](LICENSE.md)


