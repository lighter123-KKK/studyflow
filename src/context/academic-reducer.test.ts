import { describe, expect, it } from "vitest";
import { createDemoData } from "@/lib/demo-data";
import { academicReducer } from "./academic-reducer";

const changedAt = "2026-11-10T08:00:00.000Z";

describe("academic reducer", () => {
  it("transfers leadership within one project and retains member profiles after sync", () => {
    const state = createDemoData(new Date(changedAt));
    const withLeader = academicReducer(state, {
      type: "project/member-save",
      profile: { id: "member-maya", projectId: "project-hci", displayName: "Maya Wong", role: "Group leader", responsibilities: "Builds the calendar." },
    });
    const transferred = academicReducer(withLeader, {
      type: "project/member-save",
      profile: { id: "manual-member", projectId: "project-hci", displayName: "Taylor Lee", role: "Group leader" },
    });
    const synced = academicReducer(transferred, { type: "canvas/sync", state });
    expect(synced.projectMemberProfiles).toMatchObject([
      { id: "member-maya", role: "Member", responsibilities: "Builds the calendar." },
      { id: "manual-member", role: "Group leader" },
    ]);
  });

  it("adds a task to the shared source of truth", () => {
    const state = createDemoData(new Date("2026-11-10T12:00:00+08:00"));
    const next = academicReducer(state, {
      type: "task/add",
      task: {
        id: "task-new",
        title: "New assignment",
        courseId: "ee4213",
        assessmentType: "assignment",
        dateMeaning: "submission-deadline",
        date: "2026-11-20",
        priority: "medium",
        status: "not-started",
        createdAt: changedAt,
        updatedAt: changedAt,
      },
    });

    expect(next.tasks.at(-1)?.title).toBe("New assignment");
  });

  it("updates status metadata and can reopen completed work", () => {
    const state = createDemoData(new Date("2026-11-10T12:00:00+08:00"));
    const completed = academicReducer(state, {
      type: "task/update",
      id: "task-reading",
      changes: { status: "done" },
      changedAt,
    });
    expect(completed.tasks.find((task) => task.id === "task-reading")).toMatchObject({
      status: "done",
      updatedAt: changedAt,
      statusUpdatedAt: changedAt,
    });

    const reopened = academicReducer(completed, {
      type: "task/update",
      id: "task-reading",
      changes: { status: "not-started" },
      changedAt: "2026-11-10T09:00:00.000Z",
    });
    expect(reopened.tasks.find((task) => task.id === "task-reading")?.status).toBe("not-started");
  });

  it("deletes a group task and removes its project reference", () => {
    const state = createDemoData(new Date("2026-11-10T12:00:00+08:00"));
    const next = academicReducer(state, { type: "task/delete", id: "group-wireframes" });
    expect(next.tasks.some((task) => task.id === "group-wireframes")).toBe(false);
    expect(next.projects.find((project) => project.id === "project-hci")?.taskIds).not.toContain("group-wireframes");
  });
});
