# Integrate identity and workforce components

## Assign responsibilities

Controller applications administer departments, invitations, employees, groups
and reusable group authorizations. Professional applications contain the
sector workflows available to an authorized employee. Both reuse these neutral
components; each host owns navigation, localization, authentication, capability
resolution, persistence and its sector policy.

Components receive controlled state and emit typed intentions. Keep tenant
configuration, secrets, provider calls, verification and signing in trusted
adapters. Before a protected workforce change, the backend verifies the exact
organization, active assignment and membership, reusable group authorization
and any required student or lawful-representative authorization. A browser
selection alone is insufficient. Controller administration and professional
subject access retain their distinct permissions.

## Configure environment and catalog views

The environment selector labels Demo as a simulated blockchain. Keep Test
Network and Production disabled until the host supplies trusted server state.
Resolve that state on the server rather than from browser storage, query
strings, collection prefixes, hosts or client network settings.

Neutral Places, public Services and Products views receive publisher,
jurisdiction, sector and DCAT distribution metadata from their host. The shell
uses a header slot for the shared common header and its Inter typography,
light/dark/system preferences, text size and semantic colors.

## Present identity and access requests

`IdentityEntityEditorV2` collects legal name, contact, optional paired
identifiers and distinct identity/relationship files for a controller or related
entity. `IdentityEvidenceWorkspace` presents the selected subject, separate
controller identifiers and the host's evidence status and capabilities. The
host uploads selected bytes, protects them and records review status; a request
for review must remain pending until authoritative verification completes.

`SubjectAccessRequestPanel` presents host-supplied locators, resolved identity,
requested sections and pending status. Its resolution and request callbacks
call the host. Enable access only after the backend confirms permission.

`IdentityEvidenceEditor` is for an authenticated workforce member. It receives
opaque subject references and emits subject, relationship or age-over
intentions. The trusted host supplies actor, assignment, organization, group
and subject authorization, time and authoritative readback. Only threshold 18
maps to the standardized EUDI PID `age_over_18` element; other thresholds remain
governed predicates.

## Enroll a professional profile

`ProfessionalProfileActivationPanel` collects an invitation/activation code and
matching PIN entries. `ExistingProfessionalProfilePanel` instead accepts
existing evidence, asks the host to resolve it and presents the returned
profile choices. `toExistingProfessionalProfileRequest` preserves the distinct
request shapes. Camera and image decoding start only after user action; the
host verifies the decoded credential, chooses the issuer and protects the PIN.
Styles are available in `styles.css` and `professional-profile.css`.

## Separate presentation from issuance

A wallet presentation starts an OpenID for Verifiable Presentations journey
and displays the trusted verifier's result. Credential issuance is a later,
explicit provider operation: an authorized index provider reads its source and
issues a signed credential through OpenID for Verifiable Credential Issuance or
another configured protocol. Keep verifier results and issuance receipts
visually distinct, and keep provider signing keys outside React.

## Manage workforce and qualifications

Workforce components receive employee, department, group, membership,
authorization-summary and notification state. Handle invite, group changes,
suspend, reactivate and resend intentions through the trusted backend. Persist
the membership and reusable group authorization and create any required
Communication notice before projecting the resulting state.

For a qualification, resolve the claimed awarding organization by legal
identifier and jurisdiction rather than display text. `QualificationEvidenceEditor`
lets a controller select an active employee, describe the qualification and
select a PDF, PNG, JPEG or TIFF. The host handles upload, SHA3-384 CID,
authorization, persistence, signing and notification. Label an employer
attestation and its signature separately from source-issued proof.

`ProfessionalQualificationCard` displays the host's employer, awarding-body,
professional-body and licence status, along with the selected authority's legal
identifier, jurisdiction and verification time. Work and subject-access
permissions are evaluated independently by the backend.

## Verify the consuming application

Shared interaction tests cover controlled state, accessible keyboard operation
and callback behavior. The consuming application pins published dependencies
and tests its actual authentication, backend persistence and provider journey.
Run executable checks for each supported native wrapper; web DOM results alone
cover the web renderer. Record journey counts separately from their viewport,
theme, flavour and access-mode variants.
