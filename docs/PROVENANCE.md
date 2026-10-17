# Source provenance

The controlled profile selection and presentation progress concepts were migrated from `connect-ica-identity-app`, commit `4a3a29055cde8e98c24fe642ee00d67f62392cbb`.

The implementation is new semantic HTML for React web portals. It does not copy Expo, React Native, application screens, hosts, product labels, storage or networking. The source repository was not modified.

`OrganizationWorkforceAdministration` and its narrowly required styles were
migrated from the public Apache-2.0 `uhc-portal-components-react` repository,
source commit `33d9a8d`. The Antifraud copy remains controlled presentation
only: it emits intentions and contains no UHC product policy, gateway host,
authentication, signing or persistence.
