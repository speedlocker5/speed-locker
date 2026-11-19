# Speed Locker

A fast, single-page storefront for After Effects, Premiere Pro and DaVinci Resolve
project files. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also just open `index.html` in a browser.

## Project structure

```
index.html        page markup
css/styles.css    all styles
js/data.js        style categories and preview-video list (edit this to add styles)
js/main.js        search, cards, showcase, before/after slider
js/bolt.js        3D lightning-bolt canvas animation
js/intro.js       "Enter the site" intro screen
js/effects.js     scroll progress, marquee, animated counters
account.html     sign in / sign up, member area, mock checkout
admin.html       admin dashboard (members, payments, access)
js/api.js         PROTOTYPE backend (browser localStorage)
js/account.js     member area + mock checkout logic
js/admin.js       admin dashboard logic
css/app.css       styles for account and admin pages
assets/           logo and preview videos
```

## Accounts, access and admin (prototype)

The site has four states: **visitor** (browse only), **signed in without access** (files locked),
**member** (files unlocked) and **admin** (dashboard). Payment screens are placeholders and charge nothing.

Demo logins: member `omar@demo.com` / `demo123`, admin `admin@speedlocker.demo` / `admin123`.

**This is a prototype.** `js/api.js` keeps everything in the browser's localStorage, so it is not secure
and data is not shared between devices. Before launch, replace `js/api.js` with a real backend
(for example Supabase: auth, database with row-level security, private file storage) and a real payment provider.
Never commit product files or secret keys to this repo.

## Adding or changing a style

Each style is one row in the `S` array in `js/data.js`:

```
["Name", "icon", "#colorDark", "#colorLight", "search keywords", templateCount, "Short description"]
```

Add a row and it appears in the grid and search automatically.

## Deploy

Any static host works: Netlify, Vercel, Cloudflare Pages or GitHub Pages.
Connect this repo, leave the build command empty, and set the publish directory
to the repository root.

## License

The **source code** (HTML, CSS, JavaScript) is released under the [MIT License](LICENSE).

The **Speed Locker name, logo and everything in `assets/`** are not covered by the
MIT License. All rights reserved. If you fork this project, please replace them
with your own.

The templates sold through the store are not part of this repository.
