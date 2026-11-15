// Flow contract: temporary employee invitations stay separate from reusable professional evidence; an explicit host resolution precedes optional local PIN setup, multiple returned profiles require a user choice, and QR capture emits only candidate evidence. No renderer authenticates, enrolls, persists or grants a role.
import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor,act} from '@testing-library/react'
import type {ComponentType} from 'react'
import * as portal from '../src/index.js'
const component=(name:string)=>{const value=(portal as unknown as Record<string,ComponentType<Record<string,unknown>>>)[name];expect(typeof value,`neutral public ${name} is required`).toBe('function');return value!}
const copy={eyebrow:'Professional access',title:'Existing professional profile',description:'Use host-issued professional evidence.',credentialMethodLabel:'Professional credential',organizationMethodLabel:'Find an organization',manualMethodLabel:'Use DID or URN',scanProfessionalCredential:'Scan credential',uploadProfessionalCredentialQr:'Upload credential image',professionalCredentialReady:'Credential ready',professionalCredentialRequired:'Provide a professional credential.',closeCamera:'Close camera',cameraActive:'Camera active',credentialQrUnreadable:'No credential QR found.',professionalIdentifierLabel:'Professional DID or URN',countryLabel:'Country',countryPlaceholder:'Choose country',regionalIdentifierLabel:'Regional identifier',regionLabel:'Region',regionPlaceholder:'Choose region',organizationIdentifierLabel:'Organization identifier',sectorLabel:'Sector',pinLabel:'New device PIN',pinConfirmationLabel:'Repeat device PIN',pinMismatch:'PIN values differ.',verify:'Resolve profile',verifying:'Resolving...',verifiedProfile:'Resolved profile',changeEvidence:'Change evidence',verificationFailed:'Profile could not be resolved.',submit:'Register this device',submitting:'Registering...'}
const activationCopy={title:'Activate invitation',description:'Use the invitation sent by the organization.',credentialLabel:'Invitation code',pinLabel:copy.pinLabel,pinConfirmationLabel:copy.pinConfirmationLabel,pinMismatch:copy.pinMismatch,submit:'Activate profile',submitting:'Activating...'}
const sectors=[{value:'host-sector',label:'Host sector'}],countries=[{value:'ES',label:'Spain'}]
const fillPin=(different=false)=>{fireEvent.change(screen.getByLabelText(copy.pinLabel),{target:{value:'7'.repeat(6)}});fireEvent.change(screen.getByLabelText(copy.pinConfirmationLabel),{target:{value:(different?'8':'7').repeat(6)}})}
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals()})
it('emits only the temporary invitation and confirmed PIN after an explicit activation action',()=>{
 const Panel=component('ProfessionalProfileActivationPanel'),onSubmit=vi.fn();render(<Panel copy={activationCopy} busy={false} onSubmit={onSubmit}/>)
 expect(screen.queryByLabelText(copy.professionalIdentifierLabel)).toBeNull();expect(screen.queryByLabelText(copy.sectorLabel)).toBeNull();expect(onSubmit).not.toHaveBeenCalled()
 fireEvent.change(screen.getByLabelText(activationCopy.credentialLabel),{target:{value:' synthetic-invitation '}});fillPin();fireEvent.click(screen.getByRole('button',{name:activationCopy.submit}))
 expect(onSubmit).toHaveBeenCalledExactlyOnceWith({credential:'synthetic-invitation',pin:'7'.repeat(6)})
})
it('retains invitation PIN mismatch feedback without invoking enrollment',()=>{
 const Panel=component('ProfessionalProfileActivationPanel'),onSubmit=vi.fn();render(<Panel copy={activationCopy} busy={false} onSubmit={onSubmit}/>)
 fireEvent.change(screen.getByLabelText(activationCopy.credentialLabel),{target:{value:'synthetic-invitation'}});fillPin(true);fireEvent.click(screen.getByRole('button',{name:activationCopy.submit}))
 expect(screen.getByRole('alert')).toHaveTextContent(copy.pinMismatch);expect(onSubmit).not.toHaveBeenCalled()
})
it('serializes all three evidence methods without renaming them as an invitation or adding authority',()=>{
 const serialize=(portal as unknown as {toExistingProfessionalProfileRequest?:(value:unknown)=>unknown}).toExistingProfessionalProfileRequest;expect(typeof serialize).toBe('function')
 const pin='7'.repeat(6)
 expect(serialize!(Object.freeze({method:'credential',professionalCredential:'synthetic-professional-evidence',pin}))).toEqual({professionalCredential:'synthetic-professional-evidence',pin})
 expect(serialize!({method:'identifier',professionalIdentifier:'synthetic-opaque-identifier',sector:'host-sector',pin})).toEqual({professionalIdentifier:'synthetic-opaque-identifier',sectorHint:'host-sector',pin})
 expect(serialize!({method:'organization',country:'ES',region:'ES-MD',organizationIdentifier:'synthetic-organization',sector:'host-sector',selectedProfile:'host-profile-a',pin})).toEqual({country:'ES',region:'ES-MD',organizationIdentifier:'synthetic-organization',sectorHint:'host-sector',selectedProfile:'host-profile-a',pin})
})
it('keeps PIN and enrollment unavailable while an explicit host resolution is pending',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onSubmit=vi.fn();let complete!:(value:{title:string;subtitle:string})=>void
 const onResolve=vi.fn(()=>new Promise(resolve=>{complete=resolve}));render(<Panel copy={copy} sectors={sectors} busy={false} onResolve={onResolve} onSubmit={onSubmit}/>)
 fireEvent.click(screen.getByLabelText(copy.manualMethodLabel));fireEvent.change(screen.getByLabelText(copy.professionalIdentifierLabel),{target:{value:' synthetic-opaque-identifier '}});fireEvent.click(screen.getByRole('button',{name:copy.verify}))
 expect(onResolve).toHaveBeenCalledExactlyOnceWith({method:'identifier',professionalIdentifier:'synthetic-opaque-identifier',sector:'host-sector'});expect(screen.queryByLabelText(copy.pinLabel)).toBeNull();expect(onSubmit).not.toHaveBeenCalled()
 await act(async()=>complete({title:'Host-resolved role',subtitle:'Host-resolved organization'}));expect(screen.getByText('Host-resolved role')).toBeVisible();fillPin();fireEvent.click(screen.getByRole('button',{name:copy.submit}))
 expect(onSubmit).toHaveBeenCalledExactlyOnceWith({method:'identifier',professionalIdentifier:'synthetic-opaque-identifier',sector:'host-sector',pin:'7'.repeat(6)})
})
it('requires explicit selection of one returned organization profile before PIN setup',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onSubmit=vi.fn(),onResolve=vi.fn().mockResolvedValue([{title:'Role A',selectionValue:'host-profile-a'},{title:'Role B',selectionValue:'host-profile-b'}])
 render(<Panel copy={copy} sectors={sectors} countries={countries} regionsByCountry={{ES:[{value:'ES-MD',label:'Community of Madrid'}]}} busy={false} onResolve={onResolve} onSubmit={onSubmit}/>)
 fireEvent.click(screen.getByLabelText(copy.organizationMethodLabel));fireEvent.change(screen.getByLabelText(copy.countryLabel),{target:{value:'ES'}});fireEvent.click(screen.getByLabelText(copy.regionalIdentifierLabel));fireEvent.change(screen.getByLabelText(copy.regionLabel),{target:{value:'ES-MD'}});fireEvent.change(screen.getByLabelText(copy.organizationIdentifierLabel),{target:{value:'synthetic-organization'}});fireEvent.click(screen.getByRole('button',{name:copy.verify}))
 await screen.findByText('Role A');expect(screen.queryByLabelText(copy.pinLabel)).toBeNull();expect(onSubmit).not.toHaveBeenCalled()
 fireEvent.click(screen.getByRole('button',{name:/Role B/u}));fillPin();fireEvent.click(screen.getByRole('button',{name:copy.submit}))
 expect(onSubmit).toHaveBeenCalledExactlyOnceWith({method:'organization',country:'ES',region:'ES-MD',organizationIdentifier:'synthetic-organization',sector:'host-sector',selectedProfile:'host-profile-b',pin:'7'.repeat(6)})
})
it('keeps failed provider resolution unresolved without exposing internal diagnostics or offering PIN enrollment',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onSubmit=vi.fn(),onResolve=vi.fn().mockRejectedValue(new Error('private_provider_diagnostic'))
 render(<Panel copy={copy} sectors={sectors} busy={false} onResolve={onResolve} onSubmit={onSubmit}/>);fireEvent.click(screen.getByLabelText(copy.manualMethodLabel));fireEvent.change(screen.getByLabelText(copy.professionalIdentifierLabel),{target:{value:'synthetic-identifier'}});fireEvent.click(screen.getByRole('button',{name:copy.verify}))
 expect(await screen.findByRole('alert')).toHaveTextContent(copy.verificationFailed);expect(screen.queryByText('private_provider_diagnostic')).toBeNull();expect(screen.queryByLabelText(copy.pinLabel)).toBeNull();expect(onSubmit).not.toHaveBeenCalled()
})
it('uses provided QR adapters only on explicit capture and never resolves or submits a captured candidate automatically',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onSubmit=vi.fn(),onResolve=vi.fn(),scan=vi.fn().mockResolvedValue('synthetic-scanned-evidence'),read=vi.fn().mockResolvedValue('synthetic-image-evidence')
 render(<Panel copy={copy} sectors={sectors} busy={false} onSubmit={onSubmit} onResolve={onResolve} onScanProfessionalCredential={scan} onReadProfessionalCredentialImage={read}/>)
 expect(scan).not.toHaveBeenCalled();expect(read).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:copy.scanProfessionalCredential}));await screen.findByText(copy.professionalCredentialReady)
 const file=new File(['synthetic-image'],'evidence.png',{type:'image/png'});fireEvent.change(screen.getByLabelText(copy.uploadProfessionalCredentialQr),{target:{files:[file]}});await waitFor(()=>expect(read).toHaveBeenCalledExactlyOnceWith(file))
 expect(onResolve).not.toHaveBeenCalled();expect(onSubmit).not.toHaveBeenCalled();expect(screen.queryByLabelText(copy.pinLabel)).toBeNull()
})
it('runs the real QR fallback against blank image pixels and releases its decoded bitmap without claiming evidence',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onSubmit=vi.fn(),close=vi.fn()
 vi.stubGlobal('createImageBitmap',vi.fn().mockResolvedValue({width:4,height:4,close}));vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:vi.fn(),getImageData:()=>({data:new Uint8ClampedArray(4*4*4).fill(255)})} as unknown as CanvasRenderingContext2D)
 render(<Panel copy={copy} sectors={sectors} busy={false} onSubmit={onSubmit}/>);fireEvent.change(screen.getByLabelText(copy.uploadProfessionalCredentialQr),{target:{files:[new File(['blank'],'blank.png',{type:'image/png'})]}})
 expect(await screen.findByRole('alert')).toHaveTextContent(copy.credentialQrUnreadable);expect(close).toHaveBeenCalledOnce();expect(screen.queryByText(copy.professionalCredentialReady)).toBeNull();expect(onSubmit).not.toHaveBeenCalled()
})
it('releases a locally opened camera on unmount without treating capture as profile resolution',async()=>{
 const Panel=component('ExistingProfessionalProfilePanel'),onResolve=vi.fn(),stop=vi.fn(),stream={getTracks:()=>[{stop}]}
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:vi.fn().mockResolvedValue(stream)}});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(undefined)
 const view=render(<Panel copy={copy} sectors={sectors} busy={false} onResolve={onResolve} onSubmit={vi.fn()}/>);fireEvent.click(screen.getByRole('button',{name:copy.scanProfessionalCredential}));await screen.findByText(copy.cameraActive);view.unmount()
 expect(stop).toHaveBeenCalledOnce();expect(onResolve).not.toHaveBeenCalled()
})
