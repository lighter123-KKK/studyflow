"use client";

import { useEffect, useId, useRef, type FormEvent } from "react";
import { PROJECT_ROLES, type ProjectMemberProfile, type ProjectRole } from "@/lib/types";
import type { ProjectTeamMember } from "./project-utils";

export type MemberFormValues = Omit<ProjectMemberProfile, "projectId" | "id"> & { id?: string };

export function ProjectMemberForm({ member, onSave, onCancel }: {
  member?: ProjectTeamMember;
  onSave: (values: MemberFormValues) => void;
  onCancel: () => void;
}) {
  const headingId = useId();
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { nameInput.current?.focus(); }, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const displayName = String(fields.get("displayName") ?? "").trim();
    if (!displayName) {
      const input = event.currentTarget.elements.namedItem("displayName") as HTMLInputElement;
      input.setCustomValidity("Enter the member’s name.");
      input.reportValidity();
      return;
    }
    onSave({
      id: member?.id,
      displayName,
      role: fields.get("role") as ProjectRole,
      email: String(fields.get("email") ?? "").trim() || undefined,
      responsibilities: String(fields.get("responsibilities") ?? "").trim() || undefined,
    });
  }

  return (
    <form onSubmit={save} className="border rounded p-3 mb-3" aria-labelledby={headingId}>
      <h4 className="h4 mb-3" id={headingId}>{member ? `Edit ${member.displayName}` : "Add a team member"}</h4>
      <div className="row g-3">
        <label className="col-12 col-sm-7">
          <span className="form-label">Name</span>
          <input ref={nameInput} className="form-control" name="displayName" defaultValue={member?.displayName} maxLength={100}
            onChange={(event) => event.currentTarget.setCustomValidity("")} required />
        </label>
        <label className="col-12 col-sm-5">
          <span className="form-label">Project role</span>
          <select name="role" className="form-select" defaultValue={member?.role ?? "Member"}>
            {PROJECT_ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <label className="col-12 col-sm-7">
          <span className="form-label">Email (optional)</span>
          <input className="form-control" name="email" type="email" defaultValue={member?.email} maxLength={254} />
        </label>
        <label className="col-12">
          <span className="form-label">Responsibilities or notes (optional)</span>
          <textarea className="form-control" name="responsibilities" rows={2} maxLength={600} defaultValue={member?.responsibilities} />
        </label>
      </div>
      <p className="small text-secondary mt-3">Each project has one group leader. Saving a new leader transfers that role.</p>
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-primary" type="submit">Save member</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
