# Controlled attachment panel use case

The reusable panel renders Schema.org `DigitalDocument` and `MediaObject`
metadata supplied by its host. It does not render a FHIR `DocumentReference`.

The host transports PDF, spreadsheet, Word, image, video and any other allowed
binary through DIDComm `attachments[]`. The component displays media type,
exact size, CID/digest, protected retrieval state, sender, purpose and distinct
delivery, read, acceptance and signature states. It emits user intentions but
does not upload, fetch, authorize, persist, verify or sign.

Implementation and interaction acceptance are tracked in
[GitHub issue #5](https://github.com/antifraudservices/antifraud-portal-components-react/issues/5).
