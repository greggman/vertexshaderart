# Changelist

### 2015-12-09

*   Added commenting system

*   Added notes system

*   Added avatars

*   Added UI hide timeout

    I'm mixed on this. Basically the art is covered with code and comments and even though
    it seems semi-obvious you can click UI and hide the code and comments it also seems
    non-obvious so I tried to hide the UI automatically.

    So, it hides after 5 seconds with no input.
    If there is input it hides after 15 seconds. Input is mouse movement, keyboard, mouse button,
    mouse where. Any of those except mousemove will un-hide. The mouse move expection is because
    many art pieces respond to mouse movement.

    If you click UI and pick a mode then it no longer times out at all.

    I'm not sure it really works. If you are actually trying to read the comments it's annoying
    if it hides while you're reading. But, I couldn't think of another solution.

    *   Make it like shader toy. Put the art in a tiny box.

        Yuck! I don't want things in tiny boxes. BIG PLEASE!!

    *   Make it hide the UI by default and you push a button to make it appear

        In that case no one will see or read the comments.

    It's also just a PITA in general to implement. I wish there was a nice pane/panel manager
    but I didn't find one. It would be nice to be able to size the panels, hide them, move
    them around, etc...

### 2015-11-30

*   Made it not restart music after save

*   Added a music lock

    This lets you lock the music so you can browse art and keep the music running.

*   Added playlist support.

    You can paste a playlist URL from soundcloud and it will play the entire list

*   Made the UI get more and more sparse for smaller sized displays

    Basically I never want the UI to go double line

*   Added unlisted mode

    You can make art and not have it appear in galleries. That way you can send friends
    a link to unfinished stuff.

### 2015-11-29

*   Fixed not showing screenshot on mobile

*   Added a `gl_PointSize` clamp to not go negative.

    That behavior is undefined. On iOS it made giant points.

### 2015-11-25

*   Added a music position indicator

    The background behind the name of the music shows a bar indicating the music position.

### 2015-11-21

*   Added substitute music on mobile

    Neither Chrome on Android nor Safari on iOS support getting frequency data from
    the Web Audio API from an audio tag. Firefox on Android does but I haven't put that
    exception in yet. There's no easy way to detect this behavior so you have to browser
    sniff :(

*   Added *hot* category.

    The ranking on the front page was special coded but it was easy to just make it another
    sorting criteria

### 2015-11-19

*   Made mobile use "click to play"

### 2015-11-18

*   Fixed bug with history textures sometimes getting unwanted mips

### 2015-11-16

*   Make front page use a hot list

### 2015-11-13

*   Added sharing icon

*   Added a pause option

### 2015-11-11

*   Fixed 2 sound bugs

    One was art->gallery->art no sound. This broke because of s.running stuff
    that got changed when adding new start path

    Other was art->gallery->art play status was wrong because closure for
    'newSource' captured the wrong variables

### 2015-11-09

*   Added embedded support.

    You can embed a piece on your blog or whatever by putting the url in an iframe. Example

        <iframe width="700" height="400" src="http://www.vertexshaderart.com/art/uqWtxuQpEkfxqWXCK" frameborder="0" allowfullscreen></iframe>

    The UI will be removed and there will put a ▶ icon to start it.
    This is because you probably don't want them to run automatically
    since they might be heavy.

    If you really do want it to play automatically add `?autoplay=true` to
    the URL.

    Cross my fingers this doesn't kill my bandwidth. Maybe I should use
    a special URL like `/embed`? Or an argument? Or maybe I can just
    figure it out from the server? That would allow me to serve something
    more static and remove all the editing code and meteor code.

    Hmmm...

*   Added sound icon

    Someone complained that autoplay is evil. I thought about asking them
    what they thought about youtube.

    But, decided maybe they had a point. I didn't get rid of autoplay
    because some pieces require the music to function and I think the UX
    would be much worse if they were required to click something.

    Instead I added icons on the galleries so you should know before you
    click on that it will have sound.

### 2015-11-02

*   Added newest to front page.

    I felt like new stuff was buried but I also
    want popular stuff on the front page
    since that's usually the most impressive.

### 2015-11-01

*   Added user info

    Rather than fields for email, twitter, irc, etc it's just
    an open field with markup. If you can write GLSL you can
    probably figure it out

*   Fixed music bug where going to a piece with music
    and then back before the music started would play
    the music in the background

### 2015-11-01

*   Added `vertexCount` input to shader

*   Added Revision button for each piece with more than 1 revision on user's page

*   Added metadata for FB, Twitter

    This should mean if you post a link to a piece on facebook
    you'll get a screenshot of the piece instead of the generic
    site image.

*   Made thumbnails 600x336

    Because FB complained images must be at least 200x200

*   Added private flag.

    When saving you can mark as private. From the revisions
    page you and toggle the privacy of any revision.

### 2015-10-31

*   Added "based on" link

    When someone edits a piece and saves there's a `based on` link
    which leads back to the original.

*   Added Deploy docs

*   Added some mobile CSS

*   Prevented page from updating until data is ready

    The gallery pages seemed to jump all over as data
    was flowing in. I think that's mostly fixed.

### 2015-10-29

*   got touch events working

### 2015-10-28

*   Added render pause

    Useful if you want to edit really slow shaders

*   Changed to jpg thumbnails. 6x-8x smaller

*   Got rid of CollectionFS

    It was crashing the site and I couldn't figure out what
    I was doing wrong.

    Wrote my own solution.

*   Added background uniform

    So you can blend to the background color

*   Ctrl-S / ⌘-S save

    This is so you can take a screenshot with the
    mouse in whatever position you want if your
    creation responds to the mouse

### 2015-10-27

*   Make revisions pageinate

*   Added username and name buttons on visualization page

    name links to revisions

*   Added soundcloud login

### 2015-10-26

*   If the page is closed or refreshed restore your work

*   enable z-buffer

*   fixed hide->gallery->art

    The state of the button was wrong

*   added float sound data

    `floatSound` is a texture had holds data
    from `getFloatFrequncyData`

*   fixed that can't scroll to bottom of gallery


