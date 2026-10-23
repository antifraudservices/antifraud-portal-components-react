import type { ReactNode } from 'react'

export type SectorPortalNavigationItem = Readonly<{
  id: string
  label: string
  description?: string
}>

export function SectorPortalShell({
  activeNavigation,
  children,
  header,
  navigation,
  onNavigate,
  portalName,
}: Readonly<{
  activeNavigation: string
  children: ReactNode
  header: ReactNode
  navigation: readonly SectorPortalNavigationItem[]
  onNavigate(id: string): void
  portalName: string
}>) {
  return <div className="afpc-sector-shell">
    <div className="afpc-sector-header-slot">{header}</div>
    <aside className="afpc-sector-navigation">
      <nav aria-label={`${portalName} navigation`}>
        {navigation.map(item => <button type="button" key={item.id} aria-label={item.label} aria-current={activeNavigation === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}><span className="afpc-nav-mark" aria-hidden="true">{navigationMark(item.id)}</span><span><strong>{item.label}</strong>{item.description ? <small>{item.description}</small> : null}</span></button>)}
      </nav>
    </aside>
    <main className="afpc-sector-main">{children}</main>
  </div>
}

export type TrustVerificationKind = 'employee-email' | 'organization-domain' | 'received-document'
export type TrustVerificationRequest = Readonly<{
  id: string
  kind: TrustVerificationKind
  detail: string
  provider?: string
  requestedAt: string
  status: 'pending-provider-response' | 'verified' | 'rejected' | 'expired'
}>

const TRUST_ACTIONS: readonly Readonly<{kind: TrustVerificationKind; title: string; description: string}>[] = Object.freeze([
  {kind: 'employee-email', title: 'Verify an employee email', description: 'Ask the named organization to confirm that it issued the address to an active employee.'},
  {kind: 'organization-domain', title: 'Verify an organization domain', description: 'Ask an authoritative organization contact to confirm control of a corporate domain.'},
  {kind: 'received-document', title: 'Verify a received document', description: 'Ask the named issuer to verify the exact received document and its immutable digest.'},
])

export function TrustVerificationWorkspace({onOpenRequest, onSelect, requests}: Readonly<{
  onOpenRequest?(requestId: string): void
  onSelect(kind: TrustVerificationKind): void
  requests: readonly TrustVerificationRequest[]
}>) {
  return <div className="afpc-trust-layout">
    <section className="afpc-trust-workspace" aria-labelledby="afpc-trust-title">
      <header><h1 id="afpc-trust-title">Trust</h1><p>Request verification from a trusted provider. A request is not verified until that provider checks its authoritative source and responds.</p></header>
      <section aria-labelledby="afpc-trust-actions-title"><h2 id="afpc-trust-actions-title">Verification actions</h2><p>Choose what you want a trusted provider to verify.</p><div className="afpc-trust-actions">
        {TRUST_ACTIONS.map(action => <article key={action.kind}><span className="afpc-action-symbol" aria-hidden="true">{navigationMark(action.kind)}</span><h3>{action.title}</h3><p>{action.description}</p><button type="button" onClick={() => onSelect(action.kind)}>{action.title}<span aria-hidden="true">→</span></button></article>)}
      </div></section>
      <section className="afpc-trust-requests" aria-labelledby="afpc-trust-requests-title"><h2 id="afpc-trust-requests-title">Recent verification requests</h2><p>Provider responses and safe status changes appear here.</p>
        {requests.length === 0 ? <div className="afpc-empty-state">No verification requests have been submitted.</div> : <div className="afpc-table-scroll"><table><thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Status</th><th>Provider</th><th>Action</th></tr></thead><tbody>{requests.map(request => <tr key={request.id}><td>{request.requestedAt}</td><td>{trustKindLabel(request.kind)}</td><td>{request.detail}</td><td><span className={`afpc-trust-status afpc-trust-status-${request.status}`}>{request.status.replaceAll('-', ' ')}</span></td><td>{request.provider ?? 'Awaiting provider'}</td><td>{onOpenRequest ? <button type="button" onClick={() => onOpenRequest(request.id)}>View details</button> : '—'}</td></tr>)}</tbody></table></div>}
      </section>
    </section>
    <aside className="afpc-trust-context"><h2>Trust and Marketplace are separate</h2><p>Trust is for verification requests addressed to trusted providers.</p><p>Marketplace is for discovering verified organizations, their products and public services.</p><hr/><h2>How verification works</h2><ol><li><strong>You send a request</strong><span>The request identifies the exact item and intended provider.</span></li><li><strong>The provider reviews it</strong><span>The provider checks its authoritative source.</span></li><li><strong>You receive the result</strong><span>The portal displays the signed result and status returned by the backend.</span></li></ol></aside>
  </div>
}

export type ProfessionalDestination = 'clients' | 'assigned-evidence' | 'scheduling' | 'catalog' | 'communications' | 'trust'

const PROFESSIONAL_ACTIONS: readonly Readonly<{id: ProfessionalDestination; title: string; description: string}>[] = Object.freeze([
  {id: 'clients', title: 'Manage clients', description: 'View authorized client organizations, contacts and subject records.'},
  {id: 'assigned-evidence', title: 'Review assigned evidence', description: 'Open evidence addressed to the active organization and take an authorized action.'},
  {id: 'scheduling', title: 'Manage availability', description: 'Maintain service availability, appointments and assigned work.'},
  {id: 'catalog', title: 'Manage catalog', description: 'Places, public Services and Products'},
  {id: 'trust', title: 'Open Trust', description: 'Manage verification requests and received documents.'},
])

export function ProfessionalOperationsHome({organizationName, profileLabel, onOpen}: Readonly<{
  organizationName: string
  profileLabel: string
  onOpen(destination: ProfessionalDestination): void
}>) {
  return <div className="afpc-professional-home"><header><h1>Home</h1><p>Your work, schedule and authorized management areas at a glance.</p></header><div className="afpc-professional-actions">{PROFESSIONAL_ACTIONS.map(action => <button type="button" key={action.id} aria-label={action.title} onClick={() => onOpen(action.id)}><span className="afpc-action-symbol" aria-hidden="true">{navigationMark(action.id)}</span><strong>{action.title}</strong><span>{action.description}</span><b aria-hidden="true">→</b></button>)}</div><div className="afpc-professional-columns"><section><h2>Today’s work</h2><div className="afpc-empty-state">Assigned tasks will appear after authoritative workspace readback.</div><h2>Upcoming appointments</h2><div className="afpc-empty-state">No appointments are available.</div></section><aside><h2>Organization</h2><strong>{organizationName}</strong><p>Resolved by the trusted backend.</p><hr/><h2>Your role</h2><strong>Authorized professional</strong><p>Capabilities come from the active assignment and Group authorization.</p><hr/><h2>Enabled sector profile</h2><strong>{profileLabel}</strong><p>This profile controls vocabulary and available modules; it does not grant authority.</p></aside></div></div>
}

export function NeutralWorkspace({title, description, children}: Readonly<{title: string; description: string; children?: ReactNode}>) {
  return <section className="afpc-neutral-workspace"><h1>{title}</h1><p>{description}</p>{children ?? <div className="afpc-empty-state">This area is waiting for authoritative backend data.</div>}</section>
}

export function CatalogManagementWorkspace({onOpen}: Readonly<{onOpen(kind: 'places' | 'services' | 'products'): void}>) {
  return <section className="afpc-neutral-workspace"><h1>Catalog</h1><p>Manage the organization’s discoverable catalog. Creating a record does not publish it automatically.</p><div className="afpc-catalog-areas"><button type="button" aria-label="Places" onClick={() => onOpen('places')}><strong>Places</strong><span>Locations, addresses, opening hours and public media.</span></button><button type="button" aria-label="Public Services" onClick={() => onOpen('services')}><strong>Public Services</strong><span>Services offered by departments at one or more public Places.</span></button><button type="button" aria-label="Products" onClick={() => onOpen('products')}><strong>Products</strong><span>Public product entries offered by the organization.</span></button></div><p className="afpc-boundary-note">The trusted backend supplies publisher, jurisdiction, sector and DCAT distribution details.</p></section>
}

function navigationMark(id: string): string {
  if (id.includes('trust')) return '✓'
  if (id.includes('market') || id.includes('catalog')) return '▦'
  if (id.includes('schedule')) return '□'
  if (id.includes('communication')) return '◫'
  if (id.includes('document') || id.includes('evidence') || id.includes('work')) return '▤'
  if (id.includes('client') || id.includes('email')) return '◉'
  if (id.includes('domain')) return '⌂'
  return '◇'
}

function trustKindLabel(kind: TrustVerificationKind): string {
  return TRUST_ACTIONS.find(action => action.kind === kind)?.title.replace(/^Verify an? /u, '') ?? kind
}
