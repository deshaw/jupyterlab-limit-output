const NEW_LINE = '\n';
const SPACER = '\n\n\n';

/**
 * Return a string with at most head starting characters and tail ending (plus a warning)
 */
export const limitByCharacters = (
  text: string,
  head: number,
  tail: number
): string => {
  const maxChars = head + tail;
  if (text.length > maxChars) {
    const headstr = text.substring(0, head);
    const tailstr = text.substring(text.length - tail);
    let msg = '';
    if (head) {
      msg = ` first ${head}`;
    }
    if (tail) {
      msg += `${head ? ' and' : ''} last ${tail}`;
    }
    return `${headstr}${
      head ? SPACER : ''
    }WARNING: Output limited. Showing${msg} characters.${
      tail ? SPACER : ''
    }${tailstr}`;
  }
  return text;
};

/**
 * Find the nth index of the newline character
 */
function _nthNewLineIndex(text: string, n: number): number | null {
  let idx = 0;
  while (n-- > 0 && idx++ < text.length) {
    idx = text.indexOf(NEW_LINE, idx);
    // Not found before we ran out of n
    if (idx < 0) {
      return null;
    }
  }
  return idx;
}

/**
 * Find the nth newline from the end of the string (excluding a possible final new line)
 */
function _nthNewLineFromLastIndex(text: string, n: number): number | null {
  let idx = text.length - 1; // Ignore a possible final trailing \n
  while (n-- > 0 && idx-- >= 0) {
    idx = text.lastIndexOf(NEW_LINE, idx);
    // Not found before we ran out of n
    if (idx < 0) {
      return null;
    }
  }
  return idx;
}

/**
 * Return a string with at most head starting lines and tail ending (plus a warning)
 */
export const limitByLines = (
  text: string,
  head: number,
  tail: number
): string => {
  const headEndPos = head > 0 ? _nthNewLineIndex(text, head) : -1;
  if (headEndPos === null) {
    return text;
  }
  const tailStartPos =
    tail > 0 ? _nthNewLineFromLastIndex(text, tail) : text.length;
  if (tailStartPos === null) {
    return text;
  }
  if (tailStartPos <= headEndPos) {
    return text;
  }
  const headstr = text.substring(0, headEndPos);
  const tailstr = text.substring(tailStartPos);
  let msg = '';
  if (head) {
    msg = ` first ${head}`;
  }
  if (tail) {
    msg += `${head ? ' and' : ''} last ${tail}`;
  }
  return `${headstr}${
    head ? SPACER : ''
  }WARNING: Output limited. Showing${msg} lines.${
    tail ? SPACER : ''
  }${tailstr}`;
};
