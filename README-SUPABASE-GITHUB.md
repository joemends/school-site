# ViviChild Academy — GitHub + Supabase CMS

This package is now designed to run with **GitHub + GitHub Pages + Supabase**.

## What changed

The old browser-local JSON CMS has been replaced by a shared online CMS.

### You can now change from `/admin.html`

- School name and tagline
- Phone, email and address
- Logo and favicon
- Hero image
- Facebook, Instagram, TikTok and WhatsApp links
- SEO description and footer text
- Primary, dark and accent colours
- Text/background colours
- Heading and body font choices
- Corner/radius style
- Theme presets: Forest, Ocean, Royal, Warm, Modern
- Layout presets: Classic, Split Hero, Editorial, Minimal
- Header presets: Solid, Soft Shadow, Transparent
- Important page headings
- News/articles
- Parent reviews
- Gallery photos
- Student Life photos
- Image title, category, alt text and description
- Image replacement and deletion
- Admissions/contact enquiries
- Enquiry status and deletion

Changes made in the CMS are stored in Supabase and are visible to website visitors without exporting JSON or replacing files.

## Architecture

**GitHub / GitHub Pages**
- Hosts the HTML, CSS and JavaScript.

**Supabase**
- Authentication for the CMS
- PostgreSQL database for settings, pages, articles, reviews, images and enquiries
- Storage bucket for website images
- Row Level Security protects admin-only operations

The Supabase **anon/public key is safe to use in the browser** when Row Level Security is correctly configured. The `service_role` key must NEVER be put in this website or committed to GitHub.

---

# PART 1 — CREATE THE SUPABASE PROJECT

## Step 1 — Create a Supabase account

Go to Supabase and sign in.

Create a new project.

Choose:
- Project name: `vivichild-academy`
- A strong database password
- A region close to your visitors

Wait until the project finishes provisioning.

## Step 2 — Open SQL Editor

Inside Supabase:

1. Open your project.
2. Click **SQL Editor**.
3. Click **New query**.
4. Open the file `supabase_schema.sql` from this package.
5. Copy everything.
6. Paste it into SQL Editor.
7. Click **Run**.

The SQL creates:
- `site_settings`
- `admins`
- `articles`
- `reviews`
- `media`
- `enquiries`
- `site-media` Storage bucket
- Row Level Security policies

Do not skip the SQL. The CMS will not work correctly without it.

---

# PART 2 — CREATE YOUR ADMIN LOGIN

## Step 3 — Create the CMS user

In Supabase:

1. Open **Authentication**.
2. Open **Users**.
3. Click **Add user**.
4. Enter the email you want to use for the CMS.
5. Create a strong password.
6. Create the user.

Copy the user's **UUID**.

## Step 4 — Give that user admin permission

Open Supabase → **SQL Editor**.

Run:

```sql
insert into public.admins (user_id)
values ('PASTE_THE_USER_UUID_HERE');
```

Replace the UUID with the actual UUID of the user you just created.

If you later want another CMS administrator, create another Auth user and insert that second UUID into `public.admins`.

---

# PART 3 — CONNECT THE WEBSITE TO SUPABASE

## Step 5 — Get the Supabase API information

In Supabase:

1. Open **Project Settings**.
2. Open **API**.
3. Copy:
   - Project URL
   - anon / public key

Do NOT copy the `service_role` key.

## Step 6 — Edit the configuration file

Open:

`assets/js/supabase-config.js`

You will see:

```js
window.SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_PROJECT_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Change it to your real values.

Example:

```js
window.SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-public-key'
};
```

The anon key is intended for client-side applications. The database policies are what prevent ordinary visitors from changing CMS data.

---

# PART 4 — PUT THE WEBSITE ON GITHUB

## Step 7 — Create a GitHub repository

Go to GitHub.

Create a repository such as:

`vivichild-academy`

You can make it private if your GitHub plan/workflow supports the deployment you want, but GitHub Pages availability depends on your GitHub plan and repository settings.

## Step 8 — Upload the complete website

Upload the contents of this package to the repository.

The repository root should contain files like:

- `index.html`
- `about.html`
- `academics.html`
- `admissions.html`
- `student-life.html`
- `gallery.html`
- `news.html`
- `contact.html`
- `admin.html`
- `styles.css`
- `scripts.js`
- `assets/`
- `content/`
- `images/`
- `supabase_schema.sql`

Do not upload the ZIP file as the website. Upload the extracted files.

## Step 9 — Commit the files

Click **Commit changes**.

Wait for GitHub to finish saving the files.

---

# PART 5 — ENABLE GITHUB PAGES

## Step 10 — Turn on GitHub Pages

In the GitHub repository:

1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/(root)`
4. Click **Save**.

GitHub will give you a Pages address.

It normally looks similar to:

`https://YOUR-USERNAME.github.io/vivichild-academy/`

Your exact URL will be shown by GitHub.

Wait for the Pages deployment to finish.

---

# PART 6 — OPEN THE CMS

## Step 11 — Open admin.html

If the public website is:

`https://YOUR-USERNAME.github.io/vivichild-academy/`

the CMS is:

`https://YOUR-USERNAME.github.io/vivichild-academy/admin.html`

Sign in with the Supabase Auth email and password.

If you see "Supabase not configured", check `assets/js/supabase-config.js`.

If you see "not in admins table", check the UUID in the `admins` table.

---

# PART 7 — CONFIGURE THE SCHOOL

## Step 12 — Open Site Settings

Inside the CMS, open **Site Settings**.

Enter the real:

- School name
- Tagline
- Phone
- Email
- Address
- Website URL
- Logo URL
- Hero image URL
- Favicon URL
- Social links
- SEO description
- Footer text

Then choose your visual style.

### Theme options

**Forest**
- Green/purple school style

**Ocean**
- Blue/teal

**Royal**
- Purple/gold

**Warm**
- Warm orange/brown

**Modern**
- Charcoal/teal

### Layout options

**Classic**
- Traditional school layout

**Split Hero**
- Strong two-column hero

**Editorial**
- Large editorial presentation

**Minimal**
- Cleaner, more spacious design

### Header options

**Solid**
- Standard header

**Soft Shadow**
- Header with subtle shadow

**Transparent**
- Transparent/overlay header

You can change these later at any time.

Click **Save Settings**.

---

# PART 8 — CHANGE PAGE CONTENT

## Step 13 — Open Page Content

Use **Page Content** to change important headings without editing HTML.

For example:

- Home hero title
- Home hero paragraph
- Welcome heading
- Why Choose Us heading
- Academics heading
- Admissions heading
- Student Life heading
- Gallery heading
- News heading
- Final call-to-action
- About heading
- Academics page heading
- Admissions page heading
- Student Life page heading
- Gallery page heading
- News page heading
- Contact page heading

Click **Save Page Content**.

---

# PART 9 — UPLOAD AND CHANGE IMAGES

## Step 14 — Open Images

Click **Images → Upload Image**.

Choose:

- Gallery
or
- Student Life

Then upload the image.

Add:
- Title
- Category
- Alt text
- Description
- Published/Draft status

Click **Save Image**.

The file goes into Supabase Storage.

The public website reads it directly from Supabase.

### To replace an image

1. Open Images.
2. Click Edit.
3. Select a new file.
4. Save.

The old file is removed from Storage and the new image becomes active.

### To delete an image

Click Delete.

This removes the database record and the Storage file.

---

# PART 10 — ARTICLES

## Step 15 — Add a news article

Open:

**Articles → New Article**

Enter:
- Title
- Category
- Date
- Excerpt
- Content
- SEO description
- Image URL
- Image alt text
- Published/Draft

Click Save.

Published articles appear on the News page.

The article URL uses its slug, for example:

`news-article.html?slug=2026-2027-admissions-now-open`

---

# PART 11 — PARENT REVIEWS

## Step 16 — Add a review

Open:

**Reviews → New Review**

Enter:
- Parent/guardian name
- Relation/class
- Review
- Status

Choose **Published** when it is ready.

Published reviews appear on the About page.

---

# PART 12 — RECEIVE ENQUIRIES

## Step 17 — Admissions and Contact forms

The Admissions and Contact forms now write directly into:

`public.enquiries`

Supabase stores:
- Name
- Phone
- Email
- Child age
- Programme
- Message
- Source page
- Date/time
- Status

There is no FormSubmit dependency.

There is no Netlify Function dependency.

## Step 18 — Read enquiries

Open:

**CMS → Enquiries**

You can:
- Read enquiries
- Mark them Read
- Delete enquiries
- See date/time
- See contact information
- See programme
- See message

This works from any device after logging into the CMS.

---

# PART 13 — TEST EVERYTHING

After deployment, test in this order:

1. Open the public website.
2. Open `/admin.html`.
3. Sign in.
4. Change the school name.
5. Save.
6. Open the public website in a new/private browser window.
7. Confirm the name changed.
8. Change the theme.
9. Confirm the colours changed.
10. Upload a Gallery image.
11. Open Gallery.
12. Confirm the image appears.
13. Replace the image.
14. Confirm the replacement appears.
15. Add a review.
16. Confirm it appears on About.
17. Add an article.
18. Confirm it appears on News.
19. Submit the Admissions form.
20. Open CMS → Enquiries.
21. Confirm the enquiry is there.
22. Mark it Read.
23. Delete it.

---

# IMPORTANT SECURITY RULES

## Never put this in GitHub:

- Supabase service_role key
- Database password
- SMTP password
- Any private API secret

The website should contain only:

- Supabase Project URL
- Supabase anon/public key

The database is protected by Row Level Security.

## If the website is changed by someone who is not an admin

Check:
1. `public.is_admin()`
2. `public.admins`
3. RLS policies
4. Supabase Auth users

Do not disable RLS to "make it work".

---

# WHEN YOU WANT TO CHANGE THE WEBSITE AGAIN

You have two separate workflows.

### Content changes

Use the CMS.

No GitHub upload is required for:
- school name
- colours
- themes
- layouts
- page headings
- images
- articles
- reviews
- enquiries

### Code/design changes

Use GitHub.

Use GitHub when you want to change:
- HTML structure
- advanced layout
- new pages
- new components
- custom CSS
- JavaScript functionality

This gives you a much easier long-term setup:
**GitHub = website code**
**Supabase = website content/data/backend**

---

# CURRENT LIMITATION

The CMS provides multiple professional presets rather than an unrestricted drag-and-drop page builder. This keeps the website stable, responsive and accessible.

The next upgrade can add:
- drag-and-drop page sections
- custom navigation
- section visibility toggles
- per-section backgrounds
- button styles
- card styles
- spacing controls
- homepage section ordering
- custom fonts
- reusable content blocks

without changing the GitHub + Supabase architecture.


## Two protected management areas

- `cms.html` — **ViviChild CMS Manager** and the master control centre. It manages school identity, contact details, logo/hero/favicon, colours, themes, layouts, typography, social links, page content, articles, reviews and images.
- `admin.html` — **ViviChild Admin**. It is intentionally restricted to enquiries, enquiry status/delete, dashboard counts and form previews/live form links.

Both pages require Supabase Auth and the signed-in user's UUID must exist in `public.admins`.

Recommended URLs after GitHub Pages deployment:

- `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/cms.html`
- `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/admin.html`

The Admin page does not replace the CMS.
