# CV

The canonical CV content lives in `data/cv.json`.

## Local Build

Generate the LaTeX file:

```sh
npm run generate:tex
```

Generate the PDF:

```sh
npm run build:pdf
```

Build the GitHub Pages site into `dist/`:

```sh
npm run build:site
```

## Release

Push a version tag to build `cv.pdf`, create a GitHub release, and deploy the static site
