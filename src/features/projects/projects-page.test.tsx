import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AcademicProvider } from "@/context/academic-context";
import { createDemoData } from "@/lib/demo-data";
import { ACADEMIC_STORAGE_KEY, serializeState } from "@/lib/storage";
import { ProjectsPage } from "./projects-page";

describe("ProjectsPage", () => {
  beforeEach(() => localStorage.setItem(ACADEMIC_STORAGE_KEY, serializeState(createDemoData())));
  afterEach(cleanup);

  it("provides the route heading and primary add-task action", async () => {
    render(
      <AcademicProvider>
        <ProjectsPage />
      </AcademicProvider>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Group Projects" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Add task" })).toBeVisible();
  });

  it("keeps the actions header in normal table flow for mobile overflow containment", async () => {
    render(
      <AcademicProvider>
        <ProjectsPage />
      </AcademicProvider>,
    );

    const actionsHeader = await screen.findByRole("columnheader", { name: "Actions" });
    expect(actionsHeader.querySelector(".visually-hidden")).toBeNull();
  });

  it("opens the selected project's details even when it was already selected", async () => {
    render(
      <AcademicProvider>
        <ProjectsPage />
      </AcademicProvider>,
    );

    const heading = await screen.findByRole("heading", { level: 2, name: "Student Academic Dashboard" });
    const scrollIntoView = vi.fn();
    heading.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole("button", { name: "View project details for Student Academic Dashboard" }));
    expect(heading).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });

    const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    try {
      fireEvent.click(screen.getByRole("button", { name: "View project details for Adaptive Filter Study" }));
      const detail = screen.getByRole("region", { name: "Adaptive Filter Study" });
      expect(within(detail).getByRole("heading", { name: "Adaptive Filter Study" })).toHaveFocus();
      expect(within(detail).getByText("Official project submission deadline")).toBeVisible();

      const leader = within(detail).getByText("Group leader").closest("details")!;
      expect(within(leader).getByText("Noor Rahman")).toBeVisible();
      fireEvent.click(leader.querySelector("summary")!);
      expect(leader).toHaveAttribute("open");
      expect(within(leader).getByText(/Coordinates the study/)).toBeVisible();
    } finally {
      if (originalScroll) {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
      }
    }
  });

  it("adds a member with local details and displays the project leader on both views", async () => {
    const { unmount } = render(<AcademicProvider><ProjectsPage /></AcademicProvider>);
    const detail = await screen.findByRole("region", { name: "Student Academic Dashboard" });
    fireEvent.click(within(detail).getByRole("button", { name: "Add member" }));
    const form = within(detail).getByRole("form", { name: "Add a team member" });
    fireEvent.change(within(form).getByLabelText("Name"), { target: { value: "Taylor Lee" } });
    fireEvent.change(within(form).getByLabelText("Project role"), { target: { value: "Group leader" } });
    fireEvent.change(within(form).getByLabelText("Responsibilities or notes (optional)"), {
      target: { value: "Coordinates weekly reviews." },
    });
    fireEvent.submit(form);
    const profile = within(detail).getByText("Taylor Lee").closest("details")!;
    expect(within(profile).getByText("Group leader")).toBeVisible();
    expect(within(detail).getAllByText("Group leader")).toHaveLength(1);
    fireEvent.click(profile.querySelector("summary")!);
    expect(within(profile).getByText("Coordinates weekly reviews.")).toBeVisible();
    expect(screen.getByRole("region", { name: "Project overview" })).toHaveTextContent("Group leader · Taylor Lee");
    expect(localStorage.getItem(ACADEMIC_STORAGE_KEY)).toContain("Taylor Lee");
    unmount();
    render(<AcademicProvider><ProjectsPage /></AcademicProvider>);
    expect(await screen.findByRole("region", { name: "Project overview" })).toHaveTextContent("Group leader · Taylor Lee");
  });
});
