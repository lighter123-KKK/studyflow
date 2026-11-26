"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ACADEMIC_STORAGE_KEY, isAcademicState, parseStoredState, serializeState } from "@/lib/storage";
import { createPresentationData } from "@/lib/demo-data";
import { STORAGE_VERSION, type AcademicState, type ProjectMemberProfile, type Task, type TaskDraft } from "@/lib/types";
import { academicReducer } from "./academic-reducer";

const EMPTY_STATE: AcademicState = {
  version: STORAGE_VERSION,
  currentMemberId: "",
  courses: [],
  members: [],
  tasks: [],
  projects: [],
};

interface TaskDialogState {
  isOpen: boolean;
  taskId?: string;
  projectId?: string;
  afterCreate?: () => void;
}

interface AcademicContextValue {
  state: AcademicState;
  isHydrated: boolean;
  recoveryNotice: string;
  taskDialog: TaskDialogState;
  toastMessage: string;
  openTask: (taskId?: string, afterCreate?: () => void) => void;
  openProjectTask: (projectId: string) => void;
  closeTask: () => void;
  addTask: (draft: TaskDraft) => Task;
  importTasks: (drafts: TaskDraft[]) => void;
  saveProjectMember: (profile: Omit<ProjectMemberProfile, "id"> & { id?: string }) => void;
  updateTask: (id: string, changes: Partial<Task>, confirmation?: string) => void;
  deleteTask: (id: string) => void;
  canvasSync: { busy: boolean; message: string; syncedAt?: string };
  syncCanvas: () => Promise<void>;
  presentation?: { connected: boolean; publicImport: boolean; connect: (token: string) => Promise<void> };
  showToast: (message: string) => void;
  clearToast: () => void;
}

const AcademicContext = createContext<AcademicContextValue | null>(null);

function uniqueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AcademicProvider({ children, presentationMode = false, publicImport = false }: {
  children: ReactNode;
  presentationMode?: boolean;
  publicImport?: boolean;
}) {
  const [state, dispatch] = useReducer(academicReducer, EMPTY_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const [taskDialog, setTaskDialog] = useState<TaskDialogState>({ isOpen: false });
  const [toastMessage, setToastMessage] = useState("");
  const [canvasSync, setCanvasSync] = useState<AcademicContextValue["canvasSync"]>({ busy: false, message: "" });
  const syncInProgress = useRef(false);
  const presentationToken = useRef<string | undefined>(undefined);
  const [canvasConnected, setCanvasConnected] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const raw = presentationMode ? null : window.localStorage.getItem(ACADEMIC_STORAGE_KEY);
      const stored = parseStoredState(raw);
      if (raw && !stored) setRecoveryNotice("Saved dashboard data could not be read.");
      dispatch({ type: "state/load", state: presentationMode ? createPresentationData() : stored ?? EMPTY_STATE });
      setIsHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [presentationMode]);

  useEffect(() => {
    if (!isHydrated || presentationMode) return;
    window.localStorage.setItem(ACADEMIC_STORAGE_KEY, serializeState(state));
  }, [isHydrated, presentationMode, state]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(""), 4200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const showToast = useCallback((message: string) => setToastMessage(message), []);
  const clearToast = useCallback(() => setToastMessage(""), []);
  const openTask = useCallback((taskId?: string, afterCreate?: () => void) =>
    setTaskDialog({ isOpen: true, taskId, afterCreate }), []);
  const openProjectTask = useCallback((projectId: string) => setTaskDialog({ isOpen: true, projectId }), []);
  const closeTask = useCallback(() => setTaskDialog({ isOpen: false }), []);

  const requestCanvas = useCallback(async (token?: string) => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setCanvasSync((current) => ({ ...current, busy: true, message: "" }));
    try {
      const response = await fetch("/api/canvas/sync", {
        method: "POST", cache: "no-store",
        ...(token ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        } : {}),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : "Canvas sync failed.");
      if (!isAcademicState(payload.state)) throw new Error("Canvas returned an invalid workspace.");
      if (token) {
        presentationToken.current = token;
        setCanvasConnected(true);
      }
      dispatch({ type: "canvas/sync", state: payload.state });
      setRecoveryNotice("");
      setCanvasSync({ busy: false, message: "", syncedAt: payload.syncedAt });
    } catch (error) {
      const message = error instanceof Error && !(error instanceof TypeError)
        ? error.message
        : "Could not reach the Canvas sync service.";
      setCanvasSync((current) => ({ ...current, busy: false, message }));
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  const syncCanvas = useCallback(() => requestCanvas(presentationToken.current), [requestCanvas]);

  useEffect(() => {
    if (!isHydrated || presentationMode) return;
    const initialSync = window.setTimeout(() => { void syncCanvas(); }, 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void syncCanvas();
    }, 5 * 60_000);
    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(timer);
    };
  }, [isHydrated, presentationMode, syncCanvas]);

  const addTask = useCallback((draft: TaskDraft) => {
    const changedAt = new Date().toISOString();
    const task: Task = {
      ...draft,
      id: uniqueId(),
      createdAt: changedAt,
      updatedAt: changedAt,
      ...(draft.status !== "not-started" ? { statusUpdatedAt: changedAt } : {}),
    };
    dispatch({ type: "task/add", task });
    setToastMessage(`${task.title} was added to ${task.courseId.toUpperCase()}.`);
    return task;
  }, []);

  const importTasks = useCallback((drafts: TaskDraft[]) => {
    const timestamp = new Date().toISOString();
    dispatch({ type: "task/import", tasks: drafts.map((draft) => ({
      ...draft, id: uniqueId(), createdAt: timestamp, updatedAt: timestamp,
    })) });
  }, []);

  const saveProjectMember = useCallback((profile: Omit<ProjectMemberProfile, "id"> & { id?: string }) => {
    const displayName = profile.displayName.trim();
    if (!displayName) return;
    dispatch({ type: "project/member-save", profile: { ...profile, displayName, id: profile.id ?? uniqueId() } });
    setToastMessage(`${displayName}’s project profile was saved.`);
  }, []);

  const updateTask = useCallback((id: string, changes: Partial<Task>, confirmation?: string) => {
    dispatch({ type: "task/update", id, changes, changedAt: new Date().toISOString() });
    setToastMessage(confirmation ?? "Task changes saved.");
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "task/delete", id });
    setToastMessage("Task deleted.");
    setTaskDialog({ isOpen: false });
  }, []);

  const value = useMemo<AcademicContextValue>(
    () => ({
      state,
      isHydrated,
      recoveryNotice,
      taskDialog,
      toastMessage,
      openTask,
      openProjectTask,
      closeTask,
      addTask,
      importTasks,
      saveProjectMember,
      updateTask,
      deleteTask,
      canvasSync,
      syncCanvas,
      presentation: presentationMode ? { connected: canvasConnected, publicImport, connect: requestCanvas } : undefined,
      showToast,
      clearToast,
    }),
    [
      state,
      isHydrated,
      recoveryNotice,
      taskDialog,
      toastMessage,
      openTask,
      openProjectTask,
      closeTask,
      addTask,
      importTasks,
      saveProjectMember,
      updateTask,
      deleteTask,
      canvasSync,
      syncCanvas,
      presentationMode,
      canvasConnected,
      publicImport,
      requestCanvas,
      showToast,
      clearToast,
    ],
  );

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic(): AcademicContextValue {
  const context = useContext(AcademicContext);
  if (!context) throw new Error("useAcademic must be used inside AcademicProvider");
  return context;
}
