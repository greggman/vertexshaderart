# To Do

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

*   test email password recovery

*   let user change email

*   add monitoring

*   make likes active on gallery

*   fix music loop or at least make stop/start work

# Done

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


