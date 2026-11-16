# Controlled attachment panel use case

## Display document metadata

The intended reusable panel presents Schema.org `DigitalDocument` and
`MediaObject` metadata supplied by its host. Keep that representation distinct
from FHIR `DocumentReference`.

Display media type, exact size, CID/digest, protected retrieval state, sender
and purpose. Show delivery, read, acceptance and signature states independently
so receiving bytes is not presented as accepting or signing their contents.

## Connect protected transport

The host sends allowed PDF, spreadsheet, Word, image, video and other binary
content through DIDComm `attachments[]`. It owns upload, protected retrieval,
authorization, persistence, verification and signing. The panel receives
metadata and callbacks for the available actions.

## Implementation status

The reusable panel remains planned. Implementation and interaction acceptance
are tracked in [GitHub issue #5](https://github.com/antifraudservices/antifraud-portal-components-react/issues/5).
