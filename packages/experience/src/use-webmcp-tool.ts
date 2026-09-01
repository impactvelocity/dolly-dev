"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useOptionalWebMCPExperience } from "./experience-provider";
import { getModelContext } from "./model-context";
import type { WebMCPRegistrationOptions, WebMCPTool } from "./types";

export type ToolRegistrationState = "checking" | "unsupported" | "registering" | "registered" | "error";

export function useWebMCPTool<TInput = Record<string, unknown>, TResult = unknown>(
  tool: WebMCPTool<TInput, TResult>,
  options: WebMCPRegistrationOptions = {},
): ToolRegistrationState {
  const executeRef = useRef(tool.execute);
  executeRef.current = tool.execute;

  const schemaKey = useMemo(() => JSON.stringify(tool.inputSchema ?? {}), [tool.inputSchema]);
  const annotationsKey = useMemo(() => JSON.stringify(tool.annotations ?? {}), [tool.annotations]);
  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  const [state, setState] = useState<ToolRegistrationState>("checking");

  const experience = useOptionalWebMCPExperience();

  // Report UX metadata to the experience provider (when present) so
  // surfaces like the tools drawer can list every registered tool.
  const registerToolInfo = experience?.registerToolInfo ?? null;
  useEffect(() => {
    if (!registerToolInfo) return;
    return registerToolInfo({
      name: tool.name,
      description: tool.description,
      example: tool.example,
    });
  }, [registerToolInfo, tool.description, tool.example, tool.name]);

  // Auto-log a history entry around execute when the tool declares a `log`
  // template, interpolating %%key%% tokens from the tool input. Refs keep
  // the registered tool stable while templates or the provider change.
  const logRef = useRef({ log: tool.log, logIcon: tool.logIcon, logTask: experience?.logTask });
  logRef.current = { log: tool.log, logIcon: tool.logIcon, logTask: experience?.logTask };

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext) {
      setState("unsupported");
      return;
    }

    const controller = new AbortController();
    let active = true;
    const logOutcome = (input: TInput, status: "success" | "error") => {
      const { log, logIcon, logTask } = logRef.current;
      if (!log || !logTask) return;
      logTask(log, input as Record<string, unknown>, {
        icon: logIcon,
        status,
        toolName: tool.name,
      });
    };
    const registeredTool: WebMCPTool<TInput, TResult> = {
      name: tool.name,
      description: tool.description,
      inputSchema: JSON.parse(schemaKey) as Record<string, unknown>,
      annotations: JSON.parse(annotationsKey) as Record<string, unknown>,
      execute: async (input) => {
        try {
          const result = await executeRef.current(input);
          logOutcome(input, "success");
          return result;
        } catch (error) {
          logOutcome(input, "error");
          throw error;
        }
      },
    };
    const registrationOptions = JSON.parse(optionsKey) as WebMCPRegistrationOptions;

    setState("registering");
    Promise.resolve(
      modelContext.registerTool(registeredTool, {
        ...registrationOptions,
        signal: controller.signal,
      }),
    ).then(
      () => {
        if (active) setState("registered");
      },
      () => {
        if (active) setState("error");
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, [annotationsKey, optionsKey, schemaKey, tool.description, tool.name]);

  return state;
}
