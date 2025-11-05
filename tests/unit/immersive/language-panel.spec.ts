import fs from 'fs';
import path from 'path';

describe('LanguagePanel — no answer leakage (source scan)', () => {
  it('does not include the leakage label "目標" in the component source', () => {
    const p = path.resolve(process.cwd(), 'components/immersive/LanguagePanel.tsx');
    const src = fs.readFileSync(p, 'utf8');
    expect(src).not.toContain('目標');
  });
});
