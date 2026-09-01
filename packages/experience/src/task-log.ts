/**
 * Interpolate `%%key%%` tokens in a task-log template from a values object,
 * e.g. formatTaskMessage("Added %%name%% as a contact", { name: "Bob" }).
 * Tokens whose key is missing (or null/undefined) are left in place so a
 * template/input mismatch is visible instead of silently producing gaps.
 */
export function formatTaskMessage(
  template: string,
  values?: Record<string, unknown>,
): string {
  if (!values) return template;
  return template.replace(/%%([\w.-]+)%%/g, (token, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return token;
    return String(value);
  });
}
