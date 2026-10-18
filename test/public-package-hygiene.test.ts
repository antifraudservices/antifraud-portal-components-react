// Flow contract: public package files remain sector and product neutral.
// Journey: inspect every shipped source and document before packing; reject
// inherited product names so consumers never receive another product's policy.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function filesBelow(path: string): string[] {
  return readdirSync(path).flatMap(name => {
    const entry = resolve(path, name)
    return statSync(entry).isDirectory() ? filesBelow(entry) : [entry]
  })
}

describe('public package hygiene', () => {
  it('ships no inherited product names or product-derived CSS prefix', () => {
    const root = process.cwd()
    const files = [
      resolve(root, 'README.md'),
      resolve(root, 'CHANGELOG.md'),
      ...filesBelow(resolve(root, 'docs')),
      ...filesBelow(resolve(root, 'src')),
    ]
    const contents = files.map(file => readFileSync(file, 'utf8')).join('\n')

    expect(contents).not.toMatch(/VetChain|SOSChain|UHC|GlobalDataCare|Fundaci[oó]n UNID/i)
    expect(contents).not.toContain('uhcp-')
  })
})
