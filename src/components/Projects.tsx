import { PROJECTS } from "../data/projects";

export function Projects() {
  return (
    <section className="street">
      <p className="kicker">The street</p>
      <h2>Same night. Other desks.</h2>
      <div className="project-line">
        {PROJECTS.map((project) => (
          <a key={project.href} href={project.href} target="_blank" rel="noreferrer">
            <span>{project.mark}</span>
            <b>{project.name}</b>
          </a>
        ))}
      </div>
    </section>
  );
}
