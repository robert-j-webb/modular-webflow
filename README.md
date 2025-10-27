# Modular Webflow Scripts

This is a static project that is designed to be embedded on Modulars www site.
It's public because it makes it easier for us to bundle it, but really there is
not much to see here! Just basic website stuff.

## How to dev

Run `npm run dev` and go to `https://www.modular.com/` (or the staging site)

Run `localStorage.setItem('isStagingForMe', 'true')` in the console to get assets from your local machine.

## How to Publish

We have to commit the output of the build, and then make a tag for that commit.
Then we update the tag in the webflow custom code.

1. `npm run build`

2. Commit the result, `git commit -a -m 'Ran build'`

3. Push the result to master, or make a PR to master

4. Find the latest git tag `git describe --tags --abbrev=0`

5. Get the latest master; `git checkout master && git pull master`

6. Make a tag for this latest commit: `git tag A.B.C` (increment the tag from step 4)

7. Push the tag: `git push --tags`

8. In the website custom code, find the previous version in the footer code and update it to your tag.
