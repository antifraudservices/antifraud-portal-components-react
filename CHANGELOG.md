# Changelog

## 0.3.0 - 2026-11-08

- Add one controlled device-assistance preferences surface with independently
  supplied enablement, availability, preparation and detail state. Keep opt-out
  possible after a runtime becomes unavailable. Preparation requires an
  explicit click and an enabled, available, idle feature.
- Keep runtime detection, models, downloads, device storage and all permission
  decisions in application adapters. Export the component independently.
- Supply an independent stylesheet. The current renderer uses web DOM;
  sharing its controlled state contract does not implement a native renderer.
- Four component cases, package hygiene, typecheck and build pass. Host browser
  acceptance separately verifies phone-authenticated preferences and reloads.

## 0.2.2 - 2026-11-06

- Deprecate the compatibility workforce administration export in favor of the
  canonical controller screen from `antifraud-hosting-components-react`.
- Keep the compatibility implementation and its explicit legacy test while
  removing that test from the package's normal active-surface suite.

## 0.2.1 - 2026-11-06

- Add the independently importable React Native/Web conversation surface.
  Hosts provide authorized messages and retain delivery, attachments and
  governed-resource rendering; the component supplies no transport or storage.
- Select platform implementations behind that single contract: the maintained
  React Native chat for Expo and a dependency-free browser adapter for Next.js.

## 0.2.0 - 2026-10-23

- Add shared sector portal shell, Trust verification, Professional operations,
  neutral workspace and Places/Public Services/Products catalog surfaces.
- Expose a header slot so consumers can reuse the Connect Health `PortalHeader`,
  Inter typography, navy/turquoise palette and light/dark/system preference
  contract.

## 0.1.1 - 2026-10-18

- Add an accessible controlled environment selector with an honestly labelled
  simulated Demo and disabled Test Network and Production defaults.
- Keep environment authority outside React; applications may enable an option
  only from trusted server configuration.

- Let host portals localize the identity-evidence editor without changing its
  emitted neutral target contract.
- Let host portals attach their stable end-to-end action identifier to the
  shared submit control.

- Add a controlled, sector-neutral organization workforce component and its
  required styles without application policy, storage or networking.

- Add a controlled identity-evidence editor for subject identity,
  subject-to-subject relationships and configurable age-over predicates.

- Add controlled credential-profile and verification-journey components.
- Define controlled workforce administration components for invitations,
  departments, group membership, and assignment-change notifications while
  host portals retain their own sector journeys.
- Define qualification evidence UI that resolves awarding organizations by
  legal identifier and jurisdiction and displays employer and source proofs
  separately.
- Add the controlled `ProfessionalQualificationCard` with independent employer,
  issuer, professional-body and licence badges and accessible proof details.
- Add the controlled `QualificationEvidenceEditor` for active employee
  selection, authoritative issuer resolution, scanned-document handoff,
  employer-attestation acknowledgement and issuer-delivery status.
