type Cv = {
  profile: {
    name: string;
    birthDate?: string;
    location?: string;
    email?: string;
    github?: string;
    linkedin?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    context?: string;
    period: string;
    role: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    period: string;
    institution: string;
  }>;
  expertise: string[];
  languages: Array<{
    name: string;
    level: string;
  }>;
  interests: string[];
};

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app element");
}

const app = root;

function text(value: string): Text {
  return document.createTextNode(value);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { className?: string; href?: string; text?: string } = {},
  children: Array<Node | string> = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (options.className) node.className = options.className;
  if (options.href && node instanceof HTMLAnchorElement) node.href = options.href;
  if (options.text) node.textContent = options.text;

  for (const child of children) {
    node.append(child instanceof Node ? child : text(child));
  }

  return node;
}

function section(title: string, children: Node[]): HTMLElement {
  return el("section", { className: "section" }, [
    el("h2", { text: title }),
    ...children
  ]);
}

function list(items: string[]): HTMLElement {
  return el("ul", { className: "tag-list" }, items.map((item) => el("li", { text: item })));
}

function render(cv: Cv): void {
  const profile = cv.profile;
  const personalDetails = [profile.birthDate, profile.location].filter(Boolean);
  const links = [
    profile.email ? el("a", { href: `mailto:${profile.email}`, text: profile.email }) : undefined,
    profile.github ? el("a", { href: profile.github, text: "GitHub" }) : undefined,
    profile.linkedin ? el("a", { href: profile.linkedin, text: "LinkedIn" }) : undefined
  ].filter((link): link is HTMLAnchorElement => Boolean(link));

  document.title = `${profile.name} - CV`;

  app.replaceChildren(
    el("header", { className: "hero" }, [
      el("div", { className: "identity" }, [
        el("h1", { text: profile.name }),
        ...(personalDetails.length > 0
          ? [el("p", { className: "meta", text: personalDetails.join(" · ") })]
          : [])
      ]),
      ...(links.length > 0 ? [el("nav", { className: "links" }, links)] : [])
    ]),
    el("main", {}, [
      section("Professional Summary", [el("p", { text: cv.summary })]),
      section(
        "Professional Experience",
        cv.experience.map((job) =>
          el("article", { className: "entry" }, [
            el("div", { className: "entry-header" }, [
              el("h3", { text: job.context ? `${job.company} (${job.context})` : job.company }),
              el("span", { text: job.period })
            ]),
            el("p", { className: "role", text: job.role }),
            el("p", { text: job.description }),
            list(job.technologies)
          ])
        )
      ),
      section(
        "Education",
        cv.education.map((education) =>
          el("article", { className: "entry" }, [
            el("div", { className: "entry-header" }, [
              el("h3", { text: education.degree }),
              el("span", { text: education.period })
            ]),
            el("p", { text: education.institution })
          ])
        )
      ),
      section("Core Expertise", [list(cv.expertise)]),
      section("Languages", [list(cv.languages.map((language) => `${language.name} (${language.level})`))]),
      section("Interests", [list(cv.interests)])
    ])
  );
}

const response = await fetch("cv.json");
render(await response.json() as Cv);

export {};
