/**
 * Selects HTMLElements matching `selector` within `root` that are NOT inside elements matching `excludeAncestorSelector`.
 */
export function queryExcludeNested(
  selector: string,
  excludeAncestorSelector: string,
  root: Element | Document = document
): HTMLElement[] {
  const results: HTMLElement[] = [];
  const elements = root.querySelectorAll(selector);

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!(el instanceof HTMLElement)) continue;

    let ancestor: HTMLElement | null = el.parentElement;
    let isInsideExcluded = false;

    while (ancestor && root.contains(ancestor)) {
      if (ancestor.matches(excludeAncestorSelector)) {
        isInsideExcluded = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }

    if (!isInsideExcluded) {
      results.push(el);
    }
  }

  return results;
}

/**
 * Selects the first HTMLElement matching `selector` within `root` that is NOT inside elements matching `excludeAncestorSelector`.
 */
export function querySingleExcludeNested(
  selector: string,
  excludeAncestorSelector: string,
  root: Element | Document = document
): HTMLElement | null {
  const matches = queryExcludeNested(selector, excludeAncestorSelector, root);
  return matches.length > 0 ? matches[0] : null;
}
