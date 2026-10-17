# Portal Ownership

The public Antifraud controller portal owns organization administration. It is
separate from professional portals:

1. `antifraud-controller-nextjs` manages departments, invitations, employees,
   groups and reusable group authorizations;
2. `qualification-education` will contain authorized education roles; and
3. the existing multisector VetChain professional portal owns animal-sector
   workflows and may reuse these neutral components.

The education portal is currently a public scaffold, not a working
application. There is no separate Antifraud animal portal.

Controller membership is not an employee-specific Consent. Selecting a group
in the browser grants nothing. The trusted backend must confirm the exact
organization, active assignment, active membership, reusable group
authorization and any separate student or lawful-representative authorization.

The portal components remain product-neutral. Each host applies its own roles,
licences, subject vocabulary and authorization policy. The controller portal
never opens a subject record; professional portals never administer controller
authority.

The controller application now exists locally and passes fixture UI tests, but
uses an unpublished local component dependency. Until it pins a published
version and passes the real backend and gateway journey, tests prove only
controlled user intent and responsive interaction.
