/** بيملى {المتغيرات} في النص:  fill('باقي {count}', { count: 3 }) */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}
