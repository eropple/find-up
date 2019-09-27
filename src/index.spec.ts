import * as OS from 'os';
import * as FS from 'fs';

import { findUp } from './index';

function f(path: string) {
  FS.closeSync(FS.openSync(path, 'w'));
}

describe('tests!', () => {
  let root!: string;

  beforeAll(() => {
    root = FS.mkdtempSync(`${OS.tmpdir()}/find-up-`);

    FS.mkdirSync(`${root}/a/b/c/d/e/f`, { recursive: true });
    FS.mkdirSync(`${root}/a/b/c/X/Y/Z`, { recursive: true });
    FS.mkdirSync(`${root}/1/2/3/4/5/6/abc`, { recursive: true });
    FS.mkdirSync(`${root}/1/abc`, { recursive: true });

    f(`${root}/a/b/c/d/e/f/package.json`);
    f(`${root}/a/b/c/package.json`);
    f(`${root}/1/2/3/4/abc`);
  });

  afterAll(() => {
    FS.rmdirSync(root);
  });

  it('should find a file in the current directory', () => {
    const ret = findUp(`${root}/a/b/c/d/e/f`, 'package.json');
    expect(ret).toBe(`${root}/a/b/c/d/e/f/package.json`);
  });

  it('should traverse upwards to find a file', () => {
    const ret = findUp(`${root}/a/b/c/d/e`, 'package.json');
    expect(ret).toBe(`${root}/a/b/c/package.json`);
  });

  it('should iterate multiple start paths', () => {
    const ret = findUp([`${root}/1/2/3/4/5/6`, `${root}/a/b/c/d/e`], 'package.json');
    expect(ret).toBe(`${root}/a/b/c/package.json`);
  });

  it('should skip directories when opts.searchFor === "files"', () => {
    const ret = findUp(`${root}/1/2/3/4/5/6`, 'abc', { searchFor: 'files' });
    expect(ret).toBe(`${root}/1/2/3/4/abc`);
  });

  it('should skip files when opts.searchFor === "directories"', () => {
    const ret = findUp(`${root}/1/2/3/4/5`, 'abc', { searchFor: 'directories' });
    expect(ret).toBe(`${root}/1/abc`);
  });
});
