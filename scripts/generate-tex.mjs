import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/cv.json";
const outputPath = process.argv[3] ?? "cv.tex";

const cv = JSON.parse(await readFile(inputPath, "utf8"));

function tex(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function linkLabel(url) {
  return String(url).replace(/^https?:\/\//, "");
}

function section(title, body) {
  return `\\section*{${tex(title)}}
\\hrule
\\vspace{0.5em}

${body}`;
}

function experienceItem(item) {
  const company = item.context ? `${item.company} (${item.context})` : item.company;
  return `\\textbf{${tex(company)}} \\hfill ${tex(item.period)}\\\\
\\emph{${tex(item.role)}}

\\vspace{5pt}

${tex(item.description)}

\\vspace{4pt}
\\textit{Technologies:} ${item.technologies.map(tex).join(", ")}`;
}

function educationItem(item) {
  return `\\textbf{${tex(item.degree)}} \\hfill ${tex(item.period)} \\\\
${tex(item.institution)}`;
}

function languageItem(language) {
  return language.level ? `${tex(language.name)} (${tex(language.level)})` : tex(language.name);
}

const profile = cv.profile;
const personalDetails = [profile.birthDate, profile.location].filter(Boolean);
const contactLinks = [
  profile.email ? `\\href{mailto:${tex(profile.email)}}{${tex(profile.email)}}` : undefined,
  profile.github ? `\\href{${tex(profile.github)}}{${tex(linkLabel(profile.github))}}` : undefined,
  profile.linkedin ? `\\href{${tex(profile.linkedin)}}{${tex(linkLabel(profile.linkedin))}}` : undefined
].filter(Boolean);
const headerLines = [
  `{\\Huge\\bfseries ${tex(profile.name)}}\\\\`,
  personalDetails.length > 0 ? `${personalDetails.map(tex).join(" \\\\\n")}\\\\` : undefined,
  "\\vspace{4pt}",
  contactLinks.length > 0 ? contactLinks.join(" \\\\\n") : undefined
].filter(Boolean).join("\n");

const document = String.raw`\documentclass[11pt,a4paper]{article}

\usepackage[margin=2cm]{geometry}
\usepackage[hidelinks]{hyperref}

\pagestyle{empty}

\begin{document}

\begin{center}
${headerLines}

\end{center}

${section("Professional Summary", tex(cv.summary))}

${section("Professional Experience", cv.experience.map(experienceItem).join("\n\n\\vspace{12pt}\n\n\\noindent\n"))}

${section("Education", cv.education.map(educationItem).join("\n\n\\vspace{12pt}\n\n"))}

${section("Core Expertise", cv.expertise.map(tex).join(" - "))}

${section("Languages", cv.languages.map(languageItem).join(" - "))}

${section("Interests", cv.interests.map(tex).join(", "))}

\end{document}
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, document, "utf8");
