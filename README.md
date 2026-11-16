# Antifraud Portal Components React

Product-neutral React components for identity review, wallet presentation,
professional activation and provider-issued credential journeys. Applications
supply controlled state, localized content and trusted backend adapters.

## Choose a component

| Use case | Components |
| --- | --- |
| Identity and relationships | `IdentityEntityEditorV2`, `IdentityEvidenceWorkspace`, `IdentityEvidenceEditor` |
| Subject access requests | `SubjectAccessRequestPanel` |
| Professional activation | `ProfessionalProfileActivationPanel`, `ExistingProfessionalProfilePanel` |
| Qualifications | `QualificationEvidenceEditor`, `ProfessionalQualificationCard` |
| Device assistance | `DeviceAssistancePreferences` |

The package also provides wallet QR/deep-link presentation, verifier and
issuance status, attestation review, workforce assignment controls,
notification previews, a shared shell, Personal Trust workspace, Professional
operations home, and neutral Places/Services/Products catalog presentation.
Import components from their named subpaths or the package root.

## Connect the host application

Components render state and emit typed intentions. The application resolves
eligible actions and handles authentication, provider calls, uploads,
persistence, verification and signatures in its trusted backend.

Follow [identity and workforce integration](docs/PORTAL_OWNERSHIP.md) for the
activation, access, qualification and provider workflows. It describes the
server checks and the distinction between presentation and credential issuance.

Import `styles.css` once, or use the relevant independent stylesheet such as
`identity-entry.css` or `professional-profile.css`. The shared shell accepts a
header slot for the common `PortalHeader`, keeping typography, theme and text
size consistent across applications. React and React DOM are peer dependencies.

## Integrate device assistance

Use controlled feature state to show availability, opt-in and an explicit
preparation action. The [device assistance guide](docs/DEVICE_ASSISTANCE.md)
covers model downloads, worker cancellation, pending results and permissions.
Use the independent component/CSS subpaths on account pages to avoid loading
unrelated conversation modules.

## Planned attachment panel

The [attachment-panel use case](docs/ATTACHMENT_PANEL_USE_CASE.md) describes the
planned Schema.org metadata renderer and protected DIDComm transport boundary.

## Validate the application

Components must be accessible and keyboard-operable. Shared tests cover their
interaction states; consuming applications test their actual backend and
provider journeys before deployment. Native wrappers require their own
executable checks. See the integration guide for validation responsibilities.

## License

Apache-2.0.
