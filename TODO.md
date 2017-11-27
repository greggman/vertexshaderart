# To Do

*   Fix email password recovery (see)
    (Mail not sent; to enable sending, set the MAIL_URL environment variable.)
*   Updating music allows save but does not change date
*   Midi
*   VR
    *   add vsaProjection
    *   add vsaView
    *   Check if they are used. If so then VR, if no then display on plane
*   VR UI
    *   put UI on arm? (what about no arm?)
*   VR editor
*   sound URL (not just soundcloud)
*   vsa. uniforms
    *   try run on client, try every shader, see that it compiles no errors (check it compiles no errors before transformation)
*   WebGL2
*   Hotdog menu
*   Fix CSS
    *   toolbar should match size
    *   front page center
    *   Windows scrollbar
*   Popout Editor
*   fix undo reload (if go to new art and undo loads previous)
*   start with no code?
*   don't restart song if same URL

*   Make sure notes start with previous notes on a revision

*   make it not re-start music if the same URL.

    *   Don't stop music when leaving page?

    *   Don't start music on new page if URL is same

    *   add "play/pause" to header for gallery

*   Make markededitor expand to # of lines

*   Make dialog for delete? (do I care that it's an alert?)

*   check slider on iPad

*   add random mode

*   allow user to save with just changed comment if it's their
    own art. If only the comment has changed save over old
    revision?

*   add panes

    *   allow comments for each revision

    *   allow user comments (use disqus?)

    *   put editor in pane?

*   let user change email

*   look into running 2 instances of meteor in docker?

    Ideally I could create a new container, run the new meteor,
    kill the old container,

*   show newest revision on user page if logged in?

    Currently it shows the newest public revision if there are any public revisions
    otherwise it shows the newest private revision.

    What should it do? It feels like I want it to show the newest revision period
    because that's the last thing you were working on. But, then it will be confusing
    if the newest revision is private but there's a public revision. Either I show
    the "it's public" icon on top of your private revision to show you that at least
    one revision is public but it will be confusing because it's not that revision.
    OR, I don't show you the "it's public" icon which will also be confusing beacuse
    it will suggest nothing about that piece is visible.

    Should I add a 3rd icon that means "it's public but not this one?" Not sure what
    that would be, an eye with a "v" in it for different **v**ersion?

    Is there some other UX that would work better?

*   make the deploy scripts pull->build->restart meteor rather than stop->pull->build->start

*   add tooltips for more stuff

*   add "loading" to gallery?

*   add infinite scroll

    *   update URL to reflect position?

        I want back to take me where I was.
        I hate being 20 pages down and coming
        back and being at page 1 and having
        to find my place

    *   Do I care about memory?

        If you scroll 100 pages you end up
        with 100 pages of data in the browser.

        Ideally you'd delete elements at the
        top so the browser can collect them
        but you have the issue that the scroll
        bar won't reflect how far you can scroll.

        Do I care? I'll never have that many
        images.

        Or maybe I should just set a limit
        of XX pages and then page?

        Do I care?

        Another thing I hate about infinite
        scroll is it's hard to go to end.

*   add monitoring

*   make likes active on gallery

*   fix music loop or at least make stop/start work

# Done

*   fix revision buttons

*   fix time on docker host

*   Fix music info. If no artist don't show artist area

*   add mic support (Can I do line-in?)

*   fix, save -anon- does go to new URL

*   fix not updating with comment change

*   animate editor to UI button

*   check UI hides after art->gallery->art

*   make UI state sticky

*   make code and comments fade out if no key or mouse

*   See if we can not restart music on URL change

    someitmes meteor re-renders the template. For example after saving
    new art or a new route. Maybe I can wrap Router.go with some
    flags in vsart to say "don't stop the music" on destruction
    and "don't start new music if URL is same"

*   add playlist support

*   add private/public/unlisted

    should I just make "private" = "unlisted"?

    **pros:** easier UX

    **cons:** devs might feel more scared?

    You could argue unlisted *should* be fine but maybe
    devs would be less likely to work on something listed
    as "unlisted" rather than *private*.

    It's not like it's hard to implement both, just tedious.
    For example right now there's the eye icon you can just
    click to toggle. I guess it would have to change to
    click and it's a popup with the 3 options.

    Not a big deal

    Hope I didn't break anything

*   put something to show position of music?

*   fix points on mobile (can sim?)

    So the issue seems to be negative values in `gl_PointSize` so I
    added clamping. That fixed a few. Unfortunately users really
    need to set size based on resolution.

*   fix background on mobile (Can sim?)

*   fix share icon when small

*   put in substitute music for mobile

*   add "hot" sorting

*   test email password recovery

*   change error music message

*   update default shaders (remove localtime, add comments)

*   fix android

    There's no fixing android, at least for audio as getByteFrequencyData doesn't work

*   add checks

*   Figure out why mobile fails so often.

    When I go to mobile on my iOS9 iPhone 5s the site
    comes up quickly (I get the logo and sort buttons)
    but loads forever. I've waited 10mins before, no luck.

    I thought maybe it was a bug and maybe it is but it's
    possible the issue is meteor is a fucking 1MEG download
    of compressed .js  Sigh.....

    There wascan entire Mac level OS running in 128k on a commodore64.
    A website that just sends a few k of data back
    and forth should not take a 1MEG of compressed code >:(

    If it is a bug though it would be good to track down.
    When I try it with the safari remote debugging though
    it seems to work so so far no luck tracking down the issue.

    SO: apparently the issue is Chrome iOS's [Data Saver feature](https://developer.chrome.com/multidevice/data-compression).
    I think I found [a workaround](https://github.com/sockjs/sockjs-node/pull/189).
    Hopefully it will get accepted.

    Actually the issue was sockjs. Google's Data Saver is content-aware. Meaning it compresses based on
    content. For example it will recompress PNGs as WEBP if the browser supports it.

    sockjs was sending a number+\n and marking it as application/json. On the receivng side
    it was expecting the \n but JSON is whitespace insignificant which means Google's Data Saver
    was removed the whitespace to save bandwidth, exactly what it's supposed to do.

    The fix is for sockjs to either stop marking it as JSON if it want's the \n to be significant
    or to stop looking for the \n on the receiving side.

*   get rid of header

    just let the page scroll.

*   consider serving the screenshot for embedded

    They can then redirect to the real thing.

    Advantages

    *   they won't run WebGL (heavy)

    *   they won't start downloading from soundcloud (bandwidth)

    *   they'll be lighter to serve. The screenshots are 100-300k but meteor is 1meg

    *   they'll show an image the dev chose.

        For sound based pieces that's a win because
        currently the are blank since there's no sound

    -

    Actually I just serve the thumbnail and the rest but I don't start the visualizer or music
    until after starting so, it still DLs meteor but it was going to that anyway. It still
    starts WebGL but it doesn't compile the shader nor does it contact soundcloud until you press
    start.

*   fix links when embedded to open new tab

*   remove soundcloud SDK (because it uses flash!)

*   fix private revisions. The newest revision is not shown?

*   embeddable?

    should I make it possible to embed like a youtube video?

    You'd basicaly put `<iframe src="http://vertexshaderart.com/view/?id=xxx"></iframe>` or
    something. Not sure what the point is. I just thought it would
    be nice to embed on my blog :P

*   try to request less info from accounts

    *   github
    *   google
    *   twitter

    Apparently I can't actually ask for less info. Every service
    automatically gives me email and name :(

*   add "loading" to user page so it doesn't show no such user

*   show sound icon on galleries

*   add profile

    Users need a way to put contact info if they
    want. I guess just a simple text field,
    maybe markdown. Simple markdown, no html
    no images.

*   stop music

*   fix Cmd-S/Ctrl-S

*   add private flag

*   update Art date (or use modifiedAt)

*   bump images to 600x300?

    FB doesn't like 300x150.

    check what size they'd be first.

    batch current ones into 600x300

*   make meta data work "og:...", "twitter: ..."

*   add fullscreen button?

    No need. Just press Cmd-Shift-F or Ctrl-F or whatever it is

*   show forking info

*   add mouse history

*   add time history?

    I don't think many mouse effects can be done without
    this unless I'm missing something.

*   media query off controls on small screens

*   fix music pause/play

*   add pause

*   turn on blending

*   cmd-s / ctrl-s to save

*   paginate revisions

*   switch to jpg

*   add background color

*   try gridfs

*   add soundcloud login

*   display individual revision

*   add [R] revisions button next to heart

*   put "by: user - name" on art page

*   fix restore for meteor

    I save your work in localStorage BUT meteor replaces at AFTER it's restored.
    Should restore after meteor sends data.

*   fix hide->gallery->art. It's hidden but button is wrong state and play button is in wrong state

*   add float sound data

*   fix that can't scroll to bottom of gallery

*   have [username] link when not on own profile?

*   show likes

*   make like work

*   fix popup on time reset

*   login ?

*   click outside name to abort

*   save to db

    * take screenshot at t = 10 with sound data

*   gallery

*   icon

*   make audio wave heightmap example

*   try other sound data (should I add this?)

        analyser.getByteTimeDomainData(soundTexBuffer);

*   remove SoundCloud lib

    why? just as waste of time

*   save in localstorage in case you accidentally close the tab

    how do we know when to restore? Save URL, if matches re-load
    localstorage? how to know when to give it up? Add timeout? 5 mins?
    change URL the moment you start editing?

    solution: restore on load and clear the restore. Then, only
    save a restore if there have been edits.

*   make toolbar wrap

*   check safari




