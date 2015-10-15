# To Do

*   save to db

    * take screenshot at t = 10 with sound data
    * login ?
    * track forking?

*   gallery

*   fix music loop or at least make stop/start work

*   add fullscreen button?

# Done

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


