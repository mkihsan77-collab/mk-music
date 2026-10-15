# MK MUSIC URL

A small music-link shortener demo. Paste a Spotify, YouTube, Apple Music,
SoundCloud, or Bandcamp URL to create a short link and redirect to the track.

## Run locally

Run the included server, then open its address:

```sh
node server.mjs
```

## Publish with GitHub Pages

The included GitHub Actions workflow deploys the site when changes are pushed
to `main`. To enable it:

1. In the repository, open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push a commit to `main`, or run the **Deploy to GitHub Pages** workflow from
   the **Actions** tab.
4. Open the site URL shown in **Settings → Pages**.

Generated links and redirect mappings are stored in browser local storage, so
they only resolve in the same browser profile. Making the website public does
not make each visitor's links available to other people; that requires a
backend that stores and resolves the short codes.
