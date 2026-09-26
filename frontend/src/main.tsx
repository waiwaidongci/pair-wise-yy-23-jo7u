import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import "./styles.css";

const readHash = () => {
  const hash = window.location.hash.replace(/^#/, "");
  return routes.some((r) => r.route === hash) ? hash : routes[0].route;
};

function App() {
  const [active, setActive] = useState<string>(readHash);

  useEffect(() => {
    const onHashChange = () => setActive(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const current = routes.find((r) => r.route === active) ?? routes[0];
  const Page = current.component;

  return (
    <div className="shell">
      <aside>
        <div className="brand">盲文点字学习训练器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => {
                window.location.hash = route.route;
                setActive(route.route);
              }}
            >
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <Page />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
