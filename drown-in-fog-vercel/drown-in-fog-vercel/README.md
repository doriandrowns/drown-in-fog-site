# Drown in Fog — Vercel package

This is the approved design: the original Help Me logo font, lowercase Departure Mono text, true-black backgrounds, and the richer blue-teal accent (`#5CA7BA`). All eleven website files are copied byte for byte from the approved version. The only additions are deployment configuration and this handoff documentation.

This package is ready to upload. Your existing GitHub repository, Vercel project, and GoDaddy account have not been changed by preparing it.

## Replace your existing website

Use your existing Vercel project so the new design takes over its current domain. The following method works through the GitHub website and keeps the replacement files together in one folder.

1. **Unzip `drown-in-fog-vercel.zip`.** You should have a folder named `drown-in-fog-vercel`, with `vercel.json`, `README.md`, and `public` directly inside it. If your unzip app adds another wrapper folder, use the inner folder containing those files.
2. **Find the connected repository.** Open your existing website project in Vercel and look in **Settings → Git**. Open that GitHub repository and note the branch used for production; it is often `main`.
3. **Upload the whole `drown-in-fog-vercel` folder** at the top level of that repository using **Add file → Upload files**. Upload the extracted folder, not the ZIP. Commit to the production branch, or merge your upload into that branch if the repository requires a pull request. You should then see `drown-in-fog-vercel/vercel.json` and `drown-in-fog-vercel/public/index.html` in GitHub. [GitHub upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
4. **Set the project directory.** In that same Vercel project, open **Settings → Build and Deployment** and set **Root Directory** to `drown-in-fog-vercel`. Match the remaining settings to the table below and save.
5. **Deploy the uploaded version.** In **Deployments**, redeploy the production deployment for the commit containing your upload after saving the settings. If no deployment was triggered, create a deployment from that production branch. If offered a build-cache option, turn it off for this first replacement.
6. **Open the finished deployment.** Once it is Ready, check the logo, lowercase text, teal accent, navigation, and listening controls, then open your existing domain.

The selected Root Directory makes Vercel serve this package as the website. Files belonging to the previous design can remain elsewhere in the repository during the transition; they are outside this package's public directory.

Vercel normally deploys pushes to connected GitHub repositories and updates a project's configured production domains when its production branch deploys. [Vercel GitHub integration](https://vercel.com/docs/git/vercel-for-github).

## Vercel settings

| Setting | Value for the replacement method above |
| --- | --- |
| Root Directory | `drown-in-fog-vercel` |
| Framework Preset | **Other** |
| Build Command | Enable Override; leave the command empty |
| Output Directory | `public` |
| Install Command | Enable Override; leave the command empty |
| Environment variables | None required by this website |

The included `vercel.json` sets the framework, build, install, and output values. Root Directory is a separate Vercel project setting: select the directory containing `vercel.json`, not its `public` subfolder. [Vercel configuration reference](https://vercel.com/docs/project-configuration/vercel-json).

This site uses ordinary HTML, CSS, and JavaScript. It has no package installation or application build step. Vercel supports serving this kind of static website directly. [Vercel static build settings](https://vercel.com/docs/builds/configure-a-build).

### If you prefer a clean repository

Put the **contents** of `drown-in-fog-vercel` at the repository's top level, so `vercel.json` and `public` sit side by side there. Use the repository root as Vercel's Root Directory instead; all other settings stay the same. For a new repository, you can connect it from your existing Vercel project's **Settings → Git**. Using that same Vercel project retains the project's domain configuration. [Changing a project's GitHub repository](https://vercel.com/docs/git/vercel-for-github#changing-the-github-repository-of-a-project).

## GoDaddy and your domain

**If `drowninfog.com` already points to this Vercel project and shows a valid configuration, keep those DNS settings.** Replacing its website files does not require transferring the domain or starting a new Vercel project.

If the domain is not connected yet, add both `drowninfog.com` and `www.drowninfog.com` in the project's **Settings → Domains**. Choose one as the main address and redirect the other in Vercel.

When GoDaddy manages your DNS, open the domain's DNS records there and use the exact values Vercel displays:

| Website address | Record type | Name | Value |
| --- | --- | --- | --- |
| `drowninfog.com` | A | `@` | The IPv4 address shown by Vercel for your domain |
| `www.drowninfog.com` | CNAME | `www` | The CNAME target shown by Vercel for your domain |
| Ownership verification, if requested | TXT | As shown by Vercel | As shown by Vercel |

Use your project's displayed values; CNAME targets can differ between projects. Preserve the MX and TXT records used by your email. If another provider manages your authoritative DNS, edit the records there instead of GoDaddy. [Vercel domain setup and troubleshooting](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## What is included

| File or folder | Purpose |
| --- | --- |
| `public/index.html` | Complete page, track selection, forms, and vector design elements |
| `public/styles.css` | Approved typography, color, responsive layout, and motion rules |
| `public/app.js` | Navigation, listening dialog, and contact form behavior |
| `public/signal-field.js` | Animated line field |
| `public/assets/` | Original logo font, pixel fonts, font notices, and favicon |
| `vercel.json` | Static hosting configuration |

Only `public` is served as website content. The site needs no API keys, database, or connection to the original review host. Fonts are included locally.

The contact form opens an email draft to `hello@drowninfog.com`; the visitor sends it using their own email app. Hosting the website does not create that mailbox. Music plays through a user-initiated YouTube embed; availability still depends on YouTube and the video's embedding settings. The seven featured tracks are a curated selection, not an automatically updated channel feed.

## Updating later

Edit the files in `public` and commit to the connected production branch. Keep `HelpMe.ttf` and its wordmark styles intact to preserve the logo. If changing the selection, update both `index.html` and the `tracks` array in `app.js`; the duration map and displayed total live in `index.html` too. Keep all included font notices alongside their font files.

For a local preview, open a terminal in the folder containing `vercel.json` and run `python3 -m http.server 8080 --directory public`, then visit `http://localhost:8080`. On Windows with the Python launcher, use `py` in place of `python3`. Opening the HTML directly as a file will not reliably load its module scripts and root-relative assets.

## Verification of this package

The public files were compared byte for byte with the approved source. Local asset paths, JavaScript module references, and the Vercel configuration were checked. This export has not been deployed to your Vercel account; complete the replacement steps above to make it live there.
