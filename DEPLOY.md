# Deploying

I hope it goes without saying but just in case, please don't be a jerk and release a site
that is nearly the same as vertexshaderart.com. If you have suggestions or want to add
features please [file an issue](http://github.com/greggman/vertexshaderart/issues) or
submit a pull request.

That said if you want to use this code as a basis for something new I hope this works
and will help you get started quickly.

### Prerequsites

*  Docker

   Install [Docker](http://docker.com)

   Last version used is Docker 17.09.0-ce

*  OSX

   I'm sure this will work on Window just fine too, especially because docker runs everywhere
   but a few of the scripts I wrote outside of docker assume bash. Feel free to
   submit windows scripts

### SSH Keys

My ssh key setup is ... well, it doesn't match most instructions we seem to assume you have
just one key pair. Maybe one key pair is fine but I tend to have one key pair per service.

The deploy scripts currently assume there are public keys stored at `~/.ssh/id_rsa.localdocker.pub` and
`~/.ssh/id_rsa.digitalocean.pub`.

The way you make an SSH key is to type

    ssh-keygen -t rsa

When asked where to save I'd put something like

    Enter file in which to save the key (/Users/gregg/.ssh/id_rsa): /Users/gregg/.ssh/id_rsa.localdocker

Which will write both the private key `~/.ssh/id_rsa.localdocker` and the public key
`~/.ssh/id_rsa.localdocker.pub`

I then edit the file `~/.ssh/config`. In that file I have lines like this

    # IP address of digital ocean droplet so I can access it without a domain name
    Host 159.203.113.253
      IdentityFile ~/.ssh/id_rsa.digitalocean
      User root

    # local docker VM
    Host 192.168.99.100
      IdentityFile ~/.ssh/id_rsa.localdocker
      User docker

    # name of service once the domain name is up
    Host vertexshaderart.com
      IdentityFile ~/.ssh/id_rsa.digitalocean
      User root

This does two things. #1 it makes me not have to type a password to log my droplet. I use use `ssh-add ~/.ssh/id_rsa.digitalocean` once
and then it will use my key. #2 it sets my user name so I can type `ssh vertexshaderart.com` instead of `ssh root@vertexshaderart.com`

### Versions

There are 4 versions

1.  **dev**

    This is the default running on mac/osx/linux out of the current folder with live updating.
    To run you cd to `vertexshaderart/server/vertexshaderart` and type `./start`.
    If you edit a file below `vertexshaderart/server/vertexshaderart` it will update live.

2.  **local**

    This runs in docker on the local machine. Note: Older versions of docker using a VM for the host.
    In other words you can your Mac, on it was running a VM running linux. Inside the VM was running
    docker and docker containers.

    The new version of docker mac (not sure about Docker Windows) runs docker on the mac. No VM required.
    One advantage is that the programs running in the containers can access your mac's local filesystem
    (which parts they can access are specified in the docker-compose.yml files so no worries).

3.  **staging**

    This runs on some remote server named `staging.vertexshaderart.com`

4.  **live**

    This runs on `vertexshaderart.com`

### Deploy Locally

I'm pretty sure this will work though I haven't tested it on a fresh machine

1.  Copy the file `server/deploy/settings-local-orig.json` to `server/deploy/settings-local.json`

        cp server/deploy/settings-local-orig.json server/deploy/settings-local.json

    **IMPORTANT!! DO NOT ADD THIS FILE TO GIT!!**

2.  *build* the project.

        cd vertexshaderart/server/deploy
        ./build.sh

    This builds into a `vertexshaderart/server/.build`

3.  Push the project into docker containers.

        ./push-local.sh

    **NOTE: You'll probably errors about non-existing containersa.**

    This will do the following

    1.  Copy config files into `vertexshaderart/server/.local`

    2.  Start the docker containers.

        Those docker containers will directly access the files in both `vertexshaderart/server/.local`
        and `vertexshaderart/server/.build`

    Note: To stop and delete all the vsa related docker containers use `./reset-local.sh`

4.  Go to `http://localhost:3000`

    If you see the website it's running. There's no data so there
    will be no art to view. You'll need to make some

### Deploy Live

I used Digital Ocean but I'm going to guess any service that supports
Docker will be about the same.

Log into Digital Ocean and add your public (the id_rsa.xxx.pub file) ssh keys.
This is important as it's way way more secure than passwords and it means you won't be
asked for passwords a billion times as you run these scripts.

1.  make a new droplet. I used a 1gig droplet.

2.  Under "Select Image" click the "Applications" tab and pick the docker image. At least version 17

3.  Under "Add SSH Key" pick your key you uploaded

4.  Click "Create Droplet".

    Note the IP address for the new droplet.

    Test it by typing

        ssh <ipAddressOfDroplet>

    It should connect to your droplet no questions asked. If it doesn't then you either
    didn't setup your ssh keys or something else is wrong. Type `exit` to exit or press Ctrl-D.

5.  Point your domain to the IP address of your droplet

    If you don't have a domain name you can skip this step

    I can't really help you with this point as every DNS registrar is different. For namecheap.com
    [their instructions are here](https://www.namecheap.com/support/knowledgebase/article.aspx/319/78/how-can-i-setup-an-a-address-record-for-my-domain).

    Once you've done this test it by

        ssh yourdomainname.com

    If it works continue to the next step. If not um... ask someone to help

6.  Install docker-compose and node in your droplet

        ssh <ipaddressOrDomainOfDroplet>
        curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
        bash
        nvm install 12
        exit
        exit

7.  Copy the file `server/deploy/settings-live-orig.json` to `server/deploy/settings-live.json`

        cp server/deploy/settings-live-orig.json server/deploy/settings-live.json

    **IMPORTANT!! DO NOT ADD THIS FILE TO GIT!!**

8.  Edit the file `server/deploy/docker-compose-live.yml` and change this line

        - ROOT_URL=https://www.vertexshaderart.com

    The `ROOT_URL`, needs to be the place your site can be reached.

    **NOTE:**

    If you haven't setup a domain name use your droplets ip address.
    (eg: `- ROOT_URL=http://123.234.12.34`) and make sure it's `http` (no `S`)

    Also delete the line `443:443`

9.  Edit the file `files/config/caddy/Caddyfile` and change this lines

    The first line

        www.vertexshaderart.com, vertexshaderart.com {

    Put your domain name. The next to the last line

        tls letsencrypt@greggman.com

    Put an email address you want letsencrypt to use to tell you issues
    with your https certs.

10. Edit the file `server/deploy/push-live.sh`

    Change `DOCKER=vertexshaderart.com` to the IP address or domain of your droplet.

11. cd to the `server/deploy` folder and type

        ./build.sh
        ./push-live.sh

    ps: you probably need to do this twice and between them
    set the permissions with

        chmod gou+w files/save/caddy
    
    and npm install (need to fix)

        # install nvm then
        nvm install 12
        cd build/bundle/programs/server
        npm install

12. type

        ssh <ipAddressOrDomainOfDroplet> 'docker logs -f c_meteor_1'

    This will show you output from the docker container running
    meteor. Once you see "Starting Meteor..." ..

13. Go to `https://<domainOfDroplet>` or `http://<ipaddressOfDroplet>`

    Your site is live.

To update the site check stuff into your github repo and run steps 10+ again

### Deploy Staging

NOTE: I'm not normally running a staging server. The only reason I needed
a staging server was to test HTTPS because letsencrypt requires a publicly
accessible server at the domain for which it will be issuing a certificate.

So, the instructions almost the same as [Deploy Live](#deploy-live). You
need to make a separate droplet for staging so yes, start from step 1 of
[Deploy Live](#deploy-live).

The differences.

Step 5, make a subdomain like `staging.myapp.com` at your DNS registar
and point it at the staging droplet.

Step 7, copy `settings-staging-orig.json` to `settings-staging.json`

Steps 8 through 13, everywhere it says `www.` change it to `staging.`.
Everywhere something ends with `-live` use `-staging` instead.

That's pretty much it. It should work the same. One more note, if
you want to test any of the login services they'll need their own
codes, separate from the live site's codes. See below.

#### Configuring login services

Each service you want to support needs a 2 codes. A public code identifying
your app/website to the service and a private code or secret used for authentication.

These are set in `server/deploy/settings-live.json` and `server/deploy/settings-local.json`.

**IMPORTANT!! DO NOT CHECK THESE CHANGES INTO GIT!!!**

To get a key and and secret for each service you need to login to each service
and apply for one then fill out the `settings-live.json` file. Example

    "accounts": {
      "github": {
        "clientId": "xxxxxxxxxxxxxxxxxxxx",
        "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "google": {
        "clientId": "xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
        "secret": "xxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "soundcloud": {
        "clientId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "twitter": {
        "consumerKey": "xxxxxxxxxxxxxxxxxxxxxxxxx",
        "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "facebook": {
        "appId": "xxxxxxxxxxxxxxx",
        "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    },

**NOTE** that the keys are different for each service. For example facebook uses `appId` where as twitter
uses `consumerKey` etc..

##### Github

*   Visit https://github.com/settings/applications/new
*   Set Homepage URL to: `http://<ipaddressofdroplet-or-domain>/`
*   Set Authorization callback URL to: `http://<ipaddressofdroplet-or-domain>/_oauth/github`

##### Google

*   Visit https://console.developers.google.com/
*   "Create Project", if needed. Wait for Google to finish provisioning.
*   On the left sidebar, go to "APIs & auth" and, underneath, "Consent Screen". Make sure to enter an email address and a product name, and save.
*   On the left sidebar, go to "APIs & auth" and then, "Credentials". "Create New Client ID", then select "Web application" as the type.
*   Set Authorized Javascript Origins to: `http://<ipaddressofdroplet-or-domain>/`
*   Set Authorized Redirect URI to: `http://<ipaddressofdroplet-or-domain>/_oauth/google`
*   Finish by clicking "Create Client ID".

##### Soundcloud

*   Visit http://soundcloud.com/you/apps/new
*   Set Redirect URI to: `http://<ipaddressofdroplet-or-domain>/_oauth/soundcloud?close`

##### Twitter

*   Visit https://dev.twitter.com/apps/new
*   Set Website to: `http://<ipaddressofdroplet-or-domain>/`
*   Set Callback URL to: `http://<ipaddressofdroplet-or-domain>/_oauth/twitter?close`
*   Select "Create your Twitter application".
*   On the Settings tab, enable "Allow this application to be used to Sign in with Twitter" and click "Update settings".
*   Switch to the "Keys and Access Tokens" tab.

##### Facebook

*   Visit https://developers.facebook.com/apps
*   Click "Add a New App".
*   Select "Website" and type a name for your app.
*   Click "Create New Facebook App ID".
*   Select a category in the dropdown and click "Create App ID".
*   Under "Tell us about your website", set Site URL to: http://<ipaddressofdroplet-or-domain/ and click "Next".
*   Click "Skip to Developer Dashboard".
*   Go to the "Settings" tab and add an email address under "Contact Email". Click "Save Changes".
*   Go to the "Status & Review" tab and select Yes for "Do you want to make this app and all its live features available to the general public?". Click "Confirm".
*   Go back to the Dashboard tab.
*   Get App Id and App Secret

##### Dev vs Local vs Staging vs Live

If I understand correctly the callback for each URL needs to be accessi ble from the browser
which means you either need to edit them all for live vs local or else register separate apps
for each service (mysite and mysite-dev).  Every where it says `<ipaddressofdroplet-or-domain>`
above would be `localhost:3000` for local. Personally I haven't set any up for local but
I have setup separate ones for staging.

#### Configuring Google Analytics

Edit `server/deploy/settings-live.json` and change the account #

    "ga": {
      "id":"UA-XXXXXXXX-X"
    },

### Backup and Restore

make a folder `backups` in `server/deploy`

    cd server/deploy
    mkdir backups

Edit `backup-live.sh` and `restore-live.js` and change `DOCKER=vertexshaderart.com` to
`DOCKER=<ipaddresofdroplet-or-domain>`

To backup type

    ./backup-live.sh

This will connect the meteor container inside your docker droplet running on digital ocean.
It will dump the database and make a tar.gz for it. It will then also make a tar.gz for
all the images. Finally it will use scp to download both of those files and copy them
into `backups` with the date inserted in the name

To restore type

    ./restore-live.sh <date-of-backup-to-restore>

For example if you wanted to restore `backup-2015-11-07.16:32:57-dev.tar.gz` you'd type

    ./restore-live.sh 2015-11-07.16:32:57

You can also backup and restore the local docker version with `./backup-local.sh` and `./restore-local.sh`.

For testing and debugging it's common for me to backup the live site and restore to the local site. At that
point the 2 should be identical.

There's also `./backup-dev.sh` and `./restore-dev.sh` to restore the local OSX version
(the one running in server/vertexshaderart vs the one
running in a local docker VM). Backups made with this version have `-dev` at the end as in
`backup-2015-11-07.16:32:57-dev.tar.gz`. This is because what's usually in my dev database is
unrelated to what's on the live site so I don't want to get them mixed up.
For example I have pieces with lots of revisions to test paginating revisions, something
that might not exist on the live site. To restore a dev backup just add the `-dev` as in

    # restoring a backup made with backup-dev.sh to the dev version
    ./restore-dev.sh 2015-11-07.16:32:57-dev

of course you should also be able to restore a live backup as well which can be useful
for debugging or testing new ideas with actual data

    # restoring a backup made with backup-live.sh to the dev version
    ./restore-dev.sh 2015-11-07.16:32:57

**IMPORTANT:** dev backup and restore expect `mongodump` and `monogorestore` to exist in
`server/mongo/bin`. You can put links here or just copy the mongo files directly
there. I did this so each project could have its own version of mongo.











