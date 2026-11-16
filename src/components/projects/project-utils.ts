import { isTaskAttentionNeeded } from "@/lib/selectors";
import { getDemoProjectDetails } from "@/lib/demo-project-details";
import type { AcademicState, GroupProject, ProjectMemberProfile, Task, TeamMember } from "@/lib/types";

export type ProjectTaskFilter = "all" | "attention";
export type ProjectTeamMember = TeamMember & Partial<Pick<ProjectMemberProfile, "role" | "email" | "responsibilities">>;

export function getProjectTeam(state: AcademicState, project: GroupProject): ProjectTeamMember[] {
  const profiles = (state.projectMemberProfiles ?? []).filter((profile) => profile.projectId === project.id);
  const members = new Map<string, ProjectTeamMember>();
  const details = getDemoProjectDetails(project.id);
  const hasLocalLeader = profiles.some((profile) => profile.role === "Group leader");
  for (const member of state.members) {
    if (project.memberIds.includes(member.id)) {
      members.set(member.id, {
        ...member,
        role: !hasLocalLeader && member.id === details?.leaderId ? "Group leader" : "Member",
        responsibilities: details?.responsibilities[member.id],
      });
    }
  }
  for (const { id, displayName, role, email, responsibilities } of profiles) {
    const initials = displayName.split(/\s+/).slice(0, 2).map((name) => Array.from(name)[0]).join("").toUpperCase();
    members.set(id, { id, displayName, initials, role, email, responsibilities });
  }
  return [...members.values()];
}

export function getProjectTasks(state: AcademicState, project: GroupProject): Task[] {
  const tasksById = new Map(state.tasks.map((task) => [task.id, task]));
  return project.taskIds
    .map((taskId) => tasksById.get(taskId))
    .filter((task): task is Task => Boolean(task));
}

export function getLatestProjectUpdate(tasks: Task[]): string | undefined {
  return tasks.reduce<string | undefined>((latest, task) => {
    const recordedAt = getTaskRecordedAt(task);
    return latest === undefined || recordedAt > latest ? recordedAt : latest;
  }, undefined);
}

export function getTaskRecordedAt(task: Task): string {
  return task.statusUpdatedAt && task.statusUpdatedAt > task.updatedAt
    ? task.statusUpdatedAt
    : task.updatedAt;
}

export function filterProjectTasks(
  tasks: Task[],
  filter: ProjectTaskFilter,
  now = new Date(),
): Task[] {
  if (filter === "all") return tasks;
  return tasks.filter((task) => isTaskAttentionNeeded(task, now));
}
