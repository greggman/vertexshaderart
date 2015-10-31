# To Do

*   add profile

*   make meta data work "og:...", "twitter: ..."

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

*   try to request less info from accounts

    *   github
    *   google
    *   twitter

*   fix music loop or at least make stop/start work

# Done

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


