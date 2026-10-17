# Antifraud Portal Components React

Reusable, product-neutral React components for identity verification, attestation, wallet presentation, and provider-issued credential journeys.

## Status

Public implementation foundation. No package has been published and no production readiness is claimed yet.

## Component boundary

Components render state and emit typed user intentions. They do not contain tenant hosts, product names, secrets, signing code, trust decisions, or hidden network calls.

Applications supply adapters and localized content. This keeps the same components reusable in different portals while each backend preserves its own authorization and session boundary.

Planned components include:

- verification-method selection;
- wallet QR and deep-link presentation;
- presentation status and recoverable errors;
- subject and relationship attestation review;
- authoritative-provider handoff confirmation;
- credential issuance status and receipt;
- accessible audit-event summaries without exposing personal data.

## Protocol boundary

The interface starts an OpenID for Verifiable Presentations journey and displays the result reported by a trusted verifier. It must not label that result as a newly issued credential.

A separate step asks an authorized index provider to read its authoritative source and issue a signed credential. Issuance may use OpenID for Verifiable Credential Issuance or another explicit provider protocol. The component never signs and never receives a provider signing key.

## Reuse rules

- React is a peer dependency.
- Network and storage behavior are supplied through typed adapters.
- Components are independently importable to avoid unnecessary bundle cost.
- Long-running work is started by user actions, not by rendering.
- Personal claims and wallet responses are not persisted by components.
- Accessibility and keyboard operation are acceptance criteria.
- Web and supported native wrappers require separate executable tests.

## Intended dependency direction

```text
antifraud-data-utils-ts
          ↓
antifraud-sdk-core-ts
          ↓
antifraud-portal-components-react
          ↓
portal applications
```

## Implementation gate

The first visual increment will be test-driven against the shared flow states. Storybook or screenshots may document appearance, but only interaction tests and a real application journey prove behavior.

## License

Apache-2.0.

