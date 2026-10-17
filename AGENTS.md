# AGENTS.md

## Scope

This repository owns product-neutral React presentation components for identity presentation and authoritative-provider credential issuance. Components render controlled state and emit user intentions. They do not authenticate, fetch, persist, authorize, verify or sign.

## Development contract

- Use red-green-refactor test-driven development.
- Begin every test file with the required flow-contract comment.
- No hidden network calls, storage access, tenant hosts, product names or signing logic.
- Wallet presentation and provider issuance remain visibly separate.
- React and React DOM are peer dependencies.
- Components must be accessible, keyboard-operable and independently importable.
- Documentation and code are written in English.

