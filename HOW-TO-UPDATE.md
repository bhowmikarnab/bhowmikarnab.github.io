# How to update my site

Your website is the folder **bhowmikarnab.github.io**. Every time you upload a change to GitHub, GitHub rebuilds the
site by itself; about **1–2 minutes later** the new version is live at <https://bhowmikarnab.github.io>.
You never need to touch the design files: everything you will normally change is plain text.

| I want to…                         | Edit this                                   |
|------------------------------------|---------------------------------------------|
| add a paper                        | `_data/publications.yml`                    |
| write a blog post                  | a new file in `_posts/`                     |
| write a note (derivation, method)  | a new file in `_notes/`                     |
| put up a new CV                    | replace `assets/Arnab_Bhowmik_CV.pdf`       |
| list a code project                | `_data/code.yml`                            |
| change the About / Research / Contact text | `index.html`                        |

---

## 1. Two ways to upload a change

**A. In the browser (simplest, nothing to install)**
1. Open <https://github.com/bhowmikarnab/bhowmikarnab.github.io> and sign in.
2. *To edit a file:* click the file, then the **pencil icon** (top right of the file), make the change, and press
   **Commit changes…** → **Commit changes**.
3. *To add or replace a file* (a new post, a picture, the CV): open the folder it belongs in, click
   **Add file → Upload files**, drag the file in, then **Commit changes**. A file with the same name is replaced.

**B. With GitHub Desktop (already installed on this computer)**
1. Edit the files in this folder with any text editor (Notepad, VS Code…). Save.
2. Open GitHub Desktop. It lists what you changed. Type a short summary (e.g. *Add PLA paper*) bottom left.
3. Click **Commit to main**, then **Push origin** (top bar).

After either way, wait 1–2 minutes and reload the site (press **Ctrl + F5** so the browser fetches the new version).

---

## 2. Add a paper

Open `_data/publications.yml`. Each paper is one block that starts with `- title:`. **Newest paper first.**

1. Copy a whole block (from its `- title:` line to the end of its `bibtex`) and paste it at the **top** of the list.
2. Change the text:
   - `title`, `authors` — inside "double quotes"; write your name exactly as **Arnab Bhowmik** and it becomes bold.
   - `year`, `type` (Preprint, Journal article, …), `reference` (e.g. "Physics Letters A 562, 131006 (2025)").
   - `doi` — only the number, e.g. `"10.1016/j.physleta.2025.131006"`. `arxiv` — e.g. `"2510.13383"`, or `""` if none.
   - `abstract` — the text under `abstract: >`, every line starting with **four spaces**.
   - `bibtex` — paste the BibTeX under `bibtex: |`, every line starting with **four spaces**.
3. Upload. The Publications page renumbers itself, the paper count and "Updated" month change by themselves, and the
   home page's **Recent works** shows the two newest papers.

Spacing matters in this file: keep the two spaces before `year:`, `type:` and the others, exactly like the blocks
already there.

---

## 3. Write a blog post

1. Copy `_templates/new-blog-post.md` into the `_posts` folder.
2. Rename it **`YEAR-MONTH-DAY-a-few-words.md`**, e.g. `2026-11-15-first-month-of-srf.md`
   (small letters, dashes instead of spaces; the date in front is required).
3. At the top, between the two `---` lines, change `title`, `description` (one sentence shown in the list) and
   `date`. Keep the quotes.
4. Below, write the post in plain text. Leave an empty line between paragraphs. Delete the grey `<!-- … -->` help text.
5. Upload the file into `_posts`. The post appears on the Blog page, newest first, with its reading time.

Writing tips (this is called *Markdown*):

| You type                          | You get                       |
|-----------------------------------|-------------------------------|
| `*italic*`   `**bold**`           | *italic*   **bold**           |
| `## A heading`                    | a section heading             |
| `- item` (one per line)           | a bullet list                 |
| `[IIEST](https://www.iiests.ac.in)` | a link                      |
| `> a quotation`                   | an indented quotation         |
| `text.[^1]` … and at the end `[^1]: the note` | a **margin note** beside the text |

To remove a post, delete its file. To hide it without deleting, add the line `published: false` at the top
(between the `---` lines).

---

## 4. Write a note (derivations, methods)

Same as a blog post, but:
1. Copy `_templates/new-note.md` into the **`_notes`** folder.
2. Name it with a few words and dashes, e.g. `bogoliubov-spectrum.md` (no date in the name; put the `date:` at the top).
   The address becomes `bhowmikarnab.github.io/notes/bogoliubov-spectrum/`.

**Equations** are written in LaTeX between **double** dollar signs:
- inside a sentence: `the energy $$E = gn^2/2$$ grows…`
- displayed on its own line: put `$$` on a line, the equation, `$$` on a line, with an empty line before and after.
  Add `\tag{1}` for a number.

**Pictures:** put the image in `assets/img/notes/` and write `![Figure 1. What it shows.](/assets/img/notes/my-figure.png)`

**Code:** a line with three backticks and the language (` ```python `), the code, then a line with three backticks.

One thing to avoid: two curly brackets in a row, `{{` or `}}`, or `{%`. The site uses them for itself. In LaTeX,
put a space between them: `{ {` and `} }`.

---

## 5. Put up a new CV

1. Make the PDF from `CV/Arnab_Bhowmik_CV.docx` in Word: **File → Save As → PDF** (choose page 1 only while page 2 is empty).
2. Name it exactly **`Arnab_Bhowmik_CV.pdf`**.
3. Upload it into the **`assets`** folder (it replaces the old one). Every **CV** link on the site opens the new file.

---

## 6. Add a code project

Open `_data/code.yml`, copy the example block, remove the `# ` at the start of each of its lines, change the text,
and upload. While the list is empty the Code page says that code is coming soon.

---

## 7. Change text on the home page

Open `index.html`. The sections are marked and the text is ordinary sentences between tags, for example
`<p class="p">I am a Research Scholar…</p>`. Change only the words, not the parts inside `< >`.

- **About me** – the two paragraphs, the education list and "Beyond research".
- **Research highlights** – the four cards (`<article class="rc">`).
- **Contact** – the profile links. The two e-mail addresses are stored backwards on purpose so spam robots cannot read
  them; ask for help (or see the comment in `assets/js/site.js`) before changing them.
- **arXiv link** – once your arXiv author page lists your papers, delete the two lines marked `{% comment %}` and
  `{% endcomment %}` around the arXiv item. The arXiv button then appears.

---

## 8. Small settings

- **Background music volume:** in `assets/js/music.js`, the line `const TARGET_DB = -36;` — a smaller number is softer
  (e.g. `-40`), a bigger one louder (e.g. `-32`).
- **Your photo:** replace `assets/img/portrait-600.jpg` with a square picture of the same name (600 × 600 pixels).
- **Site description for Google:** the `description:` in `_config.yml`.

---

## 9. If something goes wrong

- **The site didn't change:** wait two minutes and press Ctrl + F5. Then open the repository on GitHub and click
  **Actions**: a green tick means the build worked; a red cross means it failed — click it to see the reason.
- **Build failed after editing `publications.yml` or `code.yml`:** almost always a spacing or quote mistake. Compare
  your block with the one below it, line by line (spaces at the start of lines, "quotes" closed).
- **Undo a change:** in GitHub Desktop, right-click the change under **History** → **Revert changes in commit**;
  on github.com, open the file, click **History**, open the earlier version and copy it back.
- GitHub also e-mails you when a build fails.
