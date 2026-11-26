import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  useDiagramTheme,
  getDiagramTheme,
  setDiagramTheme,
  clearDiagramThemeOverride,
  isLightCanvasWebp,
  getWebpThemeClass,
  siteThemeToDiagramTheme,
} from "@/lib/diagram-theme";
import { WhiteboardThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";
import { WhiteboardCard } from "@/components/architecture/whiteboard-card";
import { architectureDiagrams } from "@/data/diagrams";

function ThemeProbe() {
  const [diagramTheme, , , meta] = useDiagramTheme();
  return (
    <div>
      <span data-testid="resolved">{diagramTheme}</span>
      <span data-testid="site">{meta.siteTheme}</span>
      <span data-testid="overridden">{String(meta.isOverridden)}</span>
    </div>
  );
}

describe("WebP & Diagram Theme Synchronization", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "dark";
    clearDiagramThemeOverride();
  });

  it("maps all 4 site themes to expected diagram polarity", () => {
    expect(siteThemeToDiagramTheme("dark")).toBe("dark");
    expect(siteThemeToDiagramTheme("grey")).toBe("dark");
    expect(siteThemeToDiagramTheme("light")).toBe("light");
    expect(siteThemeToDiagramTheme("e-ink")).toBe("light");
  });

  it("classifies dark-canvas vs light-canvas .webp assets accurately", () => {
    expect(isLightCanvasWebp("/diagrams/catalyst_photon_engine.webp")).toBe(false);
    expect(isLightCanvasWebp("/cheatsheets/images/databricks_sparksql_poster.webp")).toBe(false);
    expect(isLightCanvasWebp("/cheatsheets/images/spark_architecture_catalyst_cheatsheet.webp")).toBe(true);
    expect(isLightCanvasWebp("/cheatsheets/images/incident_runbooks_page_1.webp")).toBe(true);
    expect(isLightCanvasWebp("/cheatsheets/images/databricks_manual_poster.webp")).toBe(true);

    expect(getWebpThemeClass("dark", "/diagrams/catalyst_photon_engine.webp")).toBe("whiteboard-dark");
    expect(getWebpThemeClass("light", "/diagrams/catalyst_photon_engine.webp")).toBe("whiteboard-light");
    expect(getWebpThemeClass("dark", "/cheatsheets/images/spark_architecture_catalyst_cheatsheet.webp")).toBe(
      "webp-light-canvas-dark"
    );
    expect(getWebpThemeClass("light", "/cheatsheets/images/spark_architecture_catalyst_cheatsheet.webp")).toBe(
      "webp-light-canvas-light"
    );
  });

  it("follows active html theme class across dark, light, grey, and e-ink", async () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(screen.getByTestId("site").textContent).toBe("dark");

    await act(async () => {
      document.documentElement.className = "light";
      await Promise.resolve();
    });
    expect(getDiagramTheme()).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(screen.getByTestId("site").textContent).toBe("light");

    await act(async () => {
      document.documentElement.className = "grey";
      await Promise.resolve();
    });
    expect(getDiagramTheme()).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(screen.getByTestId("site").textContent).toBe("grey");

    await act(async () => {
      document.documentElement.className = "e-ink";
      await Promise.resolve();
    });
    expect(getDiagramTheme()).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(screen.getByTestId("site").textContent).toBe("e-ink");
  });

  it("supports explicit user override toggle and removes override when returning to site theme", () => {
    document.documentElement.className = "light";
    render(
      <>
        <WhiteboardThemeToggle />
        <ThemeProbe />
      </>
    );

    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(screen.getByTestId("overridden").textContent).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: /Dark Blueprint/i }));
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(screen.getByTestId("overridden").textContent).toBe("true");
    expect(localStorage.getItem("fabric-prep-diagram-theme")).toBe("dark");

    // Switching back to Light Canvas removes the pinned override
    fireEvent.click(screen.getByRole("button", { name: /Light Canvas/i }));
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(screen.getByTestId("overridden").textContent).toBe("false");
    expect(localStorage.getItem("fabric-prep-diagram-theme")).toBeNull();
  });

  it("renders WhiteboardCard with theme-matched container and image classes", () => {
    document.documentElement.className = "e-ink";
    const sampleDiagram = architectureDiagrams[0];
    const { container } = render(<WhiteboardCard diagram={sampleDiagram} />);

    expect(container.querySelector(".whiteboard-container-light")).not.toBeNull();
    expect(container.querySelector(".whiteboard-light")).not.toBeNull();

    act(() => {
      setDiagramTheme("dark");
    });
    expect(container.querySelector(".whiteboard-container-dark")).not.toBeNull();
    expect(container.querySelector(".whiteboard-dark")).not.toBeNull();
  });
});
