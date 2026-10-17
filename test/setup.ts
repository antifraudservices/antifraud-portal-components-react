// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)
