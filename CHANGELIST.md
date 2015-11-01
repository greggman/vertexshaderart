# Changelist

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


