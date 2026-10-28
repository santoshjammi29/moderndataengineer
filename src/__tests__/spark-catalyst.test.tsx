import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SparkCatalystClient } from "../app/spark-catalyst/spark-catalyst-client";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("SparkCatalystClient", () => {
  it("renders without crashing", () => {
    const { container } = render(<SparkCatalystClient />);
    expect(screen.getByText(/Spark Catalyst Optimizer/i)).toBeDefined();
    expect(screen.getByText(/Interactive Cluster Simulator/i)).toBeDefined();
  });
});
