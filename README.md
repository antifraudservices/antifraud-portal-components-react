# Antifraud Portal Components React

Reusable, product-neutral React components for identity verification, attestation, wallet presentation, and provider-issued credential journeys.

## Status

Public implementation foundation. No package has been published and no production readiness is claimed yet.

## Component boundary

Components render state and emit typed user intentions. They do not contain tenant hosts, product names, secrets, signing code, trust decisions, or hidden network calls.

Applications supply adapters and localized content. This keeps the same components reusable in different portals while each backend preserves its own authorization and session boundary.

The component set covers:

- verification-method selection;
- wallet QR and deep-link presentation;
- presentation status and recoverable errors;
- subject and relationship attestation review;
- authoritative-provider handoff confirmation;
- credential issuance status and receipt;
- accessible audit-event summaries without exposing personal data;
- collapsible employee assignment panels;
- optional department and group proposals during invitation;
- current-group selectors with explicit add and remove intentions;
- assignment-change notification previews and delivery status;
- awarding-organization lookup by legal identifier and jurisdiction;
- employee identity and qualification evidence review with clearly separated
  employer and source-issuer proofs.
- professional qualification cards with independent employer, awarding-body,
  professional-body and licence status badges plus authoritative proof details.
- a controlled identity-evidence editor for subject evidence, relationships and
  configurable age-over predicates, without browser-authored actor or
  authorization fields.

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

## Workforce component contract

Workforce components receive employee, department, group, membership,
authorization-summary, and notification state as controlled properties. They
emit typed intentions such as invite, add to group, remove from group, suspend,
reactivate, or resend notification.

They do not create Consent, infer authority from a selected organization, or
call a gateway. The consuming portal and its trusted backend verify controller
authority, persist membership changes, preserve the reusable authorization for
the group, and create any required Communication notice. A subject or lawful
representative authorization is displayed separately when the use case needs
one.

Organization administration belongs to a controller portal. Sector-specific
employee journeys belong to professional portals. Both may reuse these neutral
components. Every consuming application owns its navigation, localization,
authentication, capability resolution and persistence.

Qualification UI must never infer a university from display text. It emits a
lookup intention containing legal identifier and jurisdiction, then renders
the authoritative organization result returned by the host. When no
source-issued credential exists, it labels the action as an employer
attestation and identifies the employer signature separately.

`ProfessionalQualificationCard` is controlled: it renders qualification and
proof state supplied by the host, exposes proof-selection intentions, and
shows the legal identifier, jurisdiction, verification time and status of the
selected authority. It does not decide whether the user may work, access a
subject, or perform a professional action.

`QualificationEvidenceEditor` lets a controller select an active employee,
describe a qualification, resolve the claimed issuer by legal identifier and
jurisdiction, and select a scanned PDF, PNG, JPEG or TIFF. The host owns upload,
SHA3-384 CID calculation, authorization, persistence, signing and notification.
The component submits an explicit employer-attestation intention and never
labels it as issuer verification.

`IdentityEvidenceEditor` is used by an already authenticated workforce member.
The host supplies opaque subject references and labels. The component emits a
subject, relationship or age-over intention, but the trusted host supplies the
actor, assignment, organization, group authorization, subject authorization,
time and authoritative readback. Only threshold 18 may be projected as the
standardized EUDI PID `age_over_18` element; other thresholds remain governed
predicates.

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

Each visual increment is test-driven against the shared flow states. Storybook
or screenshots may document appearance, but only interaction tests and a real
application journey prove behavior.

## License

Apache-2.0.
