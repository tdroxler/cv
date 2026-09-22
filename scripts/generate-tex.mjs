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

\\vspace{4pt}

${tex(item.description)}

\\vspace{3pt}
\\textit{Technologies:} ${item.technologies.map(tex).join(", ")}`;
}

function educationItem(item) {
  return `\\textbf{${tex(item.degree)}} \\hfill ${tex(item.period)} \\\\
${tex(item.institution)}`;
}

function languageItem(language) {
  return language.level ? `${tex(language.name)} (${tex(language.level)})` : tex(language.name);
}

function expertiseItem(group) {
  return `\\noindent\\textbf{${tex(group.category)}}: ${group.items.map(tex).join(" $\\cdot$ ")}`;
}

const profile = cv.profile;
const imagePath = profile.profilePic ? path.join(path.dirname(inputPath), profile.profilePic) : undefined;
const personalDetails = [profile.birthDate, profile.location].filter(Boolean);
const contactLinks = [
  profile.email ? `\\href{mailto:${profile.email}}{${tex(profile.email)}}` : undefined,
  profile.github ? `\\href{${profile.github}}{${tex(profile.github)}}` : undefined,
  profile.linkedin ? `\\href{${profile.linkedin}}{${tex(profile.linkedin)}}` : undefined
].filter(Boolean);
const headerLines = [
  `{\\Huge\\bfseries ${tex(profile.name)}}\\\\`,
  profile.citizenship ? `${tex(profile.citizenship)}\\\\` : undefined,
  personalDetails.length > 0 ? `${personalDetails.map(tex).join(" \\\\\n")}\\\\` : undefined,
  "\\vspace{3pt}",
  contactLinks.length > 0 ? contactLinks.join(" \\\\\n") : undefined
].filter(Boolean).join("\n");
const headerBlock = profile.profilePic
  ? String.raw`\noindent
\begin{minipage}[t]{3.2cm}
\vspace{0pt}
\includegraphics[width=3.2cm,keepaspectratio]{${tex(imagePath)}}
\end{minipage}%
\hspace{1.5em}%
\begin{minipage}[t]{\dimexpr\textwidth-3.2cm-1.5em\relax}
\vspace{0pt}
\raggedright
${headerLines}
\end{minipage}
`
  : String.raw`\begin{center}
${headerLines}

\end{center}`;

const document = String.raw`\documentclass[11pt,a4paper]{article}

\usepackage[
  left=1.4cm,
  right=1.4cm,
  top=1.5cm,
  bottom=0.9cm
]{geometry}

\usepackage{graphicx}
\usepackage[hidelinks]{hyperref}
\pagestyle{empty}

\begin{document}

${headerBlock}

\vspace{1.4em}

${section("Professional Summary", tex(cv.summary))}

${section("Core Expertise", cv.expertise.map(expertiseItem).join("\\\\[3pt]\n"))}

${section("Professional Experience", cv.experience.map(experienceItem).join("\n\n\\vspace{12pt}\n\n\\noindent\n"))}

${section("Education", cv.education.map(educationItem).join("\n\n\\vspace{12pt}\n\n"))}

${section("Languages", cv.languages.map(languageItem).join(" - "))}

${section("Interests", cv.interests.map(tex).join(", "))}

\end{document}
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, document, "utf8");
