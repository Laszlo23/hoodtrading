import { SUBDOMAINS } from "../data/network";
import { useStore } from "../state/store";

export function NetworkPage() {
  const store = useStore();

  return (
    <main className="dir">
      <p className="kicker">aibusiness.fun</p>
      <h1>Every subdomain.</h1>
      <ul>
        {SUBDOMAINS.map((site) => (
          <li key={site.host}>
            <a href={`https://${site.host}/`}>
              <b>{site.name}</b>
              <span>{site.host}</span>
              <small>{site.line}</small>
            </a>
          </li>
        ))}
      </ul>
      <button className="text-link" type="button" onClick={() => store.setPage("home")}>
        Back to the desk
      </button>
    </main>
  );
}
