import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreGauge from "@/components/ui/ScoreGauge";

describe("ScoreGauge", () => {
  it("renders the rounded score value", () => {
    render(<ScoreGauge score={82.6} />);
    expect(screen.getByText("83")).toBeInTheDocument();
  });

  it("clamps scores above 100 down to 100", () => {
    render(<ScoreGauge score={150} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("clamps negative scores up to 0", () => {
    render(<ScoreGauge score={-20} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("uses the provided label in the accessible name", () => {
    render(<ScoreGauge score={70} label="Overall" />);
    expect(screen.getByRole("img", { name: "Overall: 70 out of 100" })).toBeInTheDocument();
  });

  it("defaults to the ATS Score label", () => {
    render(<ScoreGauge score={50} />);
    expect(screen.getByText("ATS Score")).toBeInTheDocument();
  });
});
