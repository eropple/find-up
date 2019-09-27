import * as FS from 'fs';
import * as Path from 'path';

export interface FindUpOpts {
  /**
   * Determines whether to search for directories or files. Leave undefined for either.
   */
  searchFor?: 'directories' | 'files';
}

/**
 * Searches upward from the given `startPath`(s) and return the full path of a file that
 * matches `searchFile`. **This is a synchronous operation.**
 *
 * While multiple `startPath` entries can be given, the first `searchFile` found in is the
 * only one that will be returned. Subsequent `startPath`s will not be evaluated.
 *
 * @param startPaths The set of paths to search from. Will search in order.
 * @param searchFile The filename to search for. Does not support globs.
 */
export function findUp(startPaths: string | Array<string>, searchFile: string, opts: FindUpOpts = {}): string | null {
  startPaths = (typeof startPaths === 'string') ? [startPaths] : startPaths;

  for (const startPath of startPaths) {
    let p: string = startPath;
    let lastPath: string | null = null;
    do {
      const candidate = `${p}/${searchFile}`;
      if (FS.existsSync(candidate)) {
        if (opts.searchFor) {
          const stat = FS.lstatSync(candidate);
          if (opts.searchFor === 'files' && stat.isFile()) {
            return candidate;
          }

          if (opts.searchFor === 'directories' && stat.isDirectory()) {
            return candidate;
          }
        } else {
          return candidate;
        }
      }

      // `path.resolve('/..') === '/'`; I assume the same is true on Windows.
      lastPath = p;
      p = Path.resolve(`${p}/..`);
    } while (p !== lastPath);
  }

  return null;
}
