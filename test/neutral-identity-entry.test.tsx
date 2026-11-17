// Flow contract: host-controlled identity entry keeps a dependent subject separate from its controller, preserves optional identifier/contact/document inputs, and emits evidence intentions without granting or inferring authority.
import {render,screen,fireEvent} from '@testing-library/react'
import {afterEach,expect,it,vi} from 'vitest'
import type {ComponentType} from 'react'
import * as portal from '../src/index'

afterEach(()=>vi.unstubAllGlobals())
const component=(name:string)=>{
 const value=(portal as unknown as Record<string,ComponentType<Record<string,unknown>>>)[name]
 expect(typeof value,`neutral AF public ${name} implementation is required`).toBe('function')
 return value!
}
const copy={entityType:'Entity type',personEntity:'Person',organizationEntity:'Organization',fullLegalName:'Controller full legal name',country:'Controller country',regionalIdentifier:'Regional identifier',region:'Region',identifierType:'Controller document type',identifierValue:'Controller document number',email:'Controller email',telephone:'Controller telephone',relationship:'Relationship',responsibleParty:'Responsible party',evidence:'Evidence',verificationMethod:'Review method',physicalInPerson:'Physical inspection',supervisedRemote:'Supervised remote',electronicId:'Electronic identity',unsupervisedRemote:'Unsupervised remote',identityDocument:'Controller identity document',relationshipDocument:'Relationship document',controllerConfirmation:'Controller confirmation'}
const relationshipOptions=[{value:'synthetic-host-relationship',label:'Host-approved responsible party'}]
const workspaceCopy={title:'Identity evidence',intro:'Host-controlled evidence',selectedSubject:'Selected dependent',subjectStepTitle:'Dependent',subjectStepBody:'Subject identity',editSubject:'Edit dependent',controllerStepTitle:'Controller',controllerStepBody:'Separate controller identifiers',noIdentifiers:'No controller identifiers',addIdentifier:'Add controller identifier',evidenceStepTitle:'Evidence',evidenceStepBody:'Review remains pending',selfUpload:'Upload private evidence',selfUploadHelp:'Host-controlled upload',organizationUpload:'Organization evidence',organizationUploadHelp:'Host-controlled organization upload',professionalAttestation:'Professional attestation',statusLabels:{verified:'Verified',pending:'Pending',rejected:'Rejected'}}
const subject={id:'synthetic-dependent',displayName:'Synthetic dependent',kind:'person'}

it('preserves distinct subject and controller legal names and scoped form field names',()=>{
 const Editor=component('IdentityEntityEditorV2')
 const ui=render(<form><input aria-label="Subject usual name" name="subjectName" defaultValue="Synthetic dependent"/><Editor copy={copy} mode="related" fieldPrefix="controller" relationshipOptions={relationshipOptions} requireIdentifier={false} showEvidence={false}/></form>)
 fireEvent.change(screen.getByLabelText('Controller full legal name'),{target:{value:'Synthetic responsible adult'}})
 const form=new FormData(ui.container.querySelector('form')!)
 expect(form.get('subjectName')).toBe('Synthetic dependent')
 expect(form.get('controller.controllerLegalName')).toBe('Synthetic responsible adult')
 expect(form.get('controller.relationship')).toBe('synthetic-host-relationship')
})

it('permits a provisional controller without an issued ID but requires both identifier parts when one is entered',()=>{
 const Editor=component('IdentityEntityEditorV2')
 render(<Editor copy={copy} mode="related" relationshipOptions={relationshipOptions} requireIdentifier={false} showEvidence={false}/>)
 const type=screen.getByLabelText('Controller document type'),number=screen.getByLabelText('Controller document number')
 expect(type).not.toBeRequired();expect(number).not.toBeRequired();expect(screen.getByLabelText('Controller country')).not.toBeRequired()
 fireEvent.change(type,{target:{value:'synthetic-document-type'}})
 expect(type).toBeRequired();expect(number).toBeRequired();expect(screen.getByLabelText('Controller country')).toBeRequired()
})

it('requires the chosen telephone contact without fabricating a required email',()=>{
 const Editor=component('IdentityEntityEditorV2')
 render(<Editor copy={copy} mode="related" relationshipOptions={relationshipOptions} requireIdentifier={false} requireTelephone showEvidence={false}/>)
 expect(screen.getByLabelText('Controller telephone')).toBeRequired()
 expect(screen.getByLabelText('Controller email')).not.toBeRequired()
})

it('keeps controller and relationship files distinct and does not upload or verify from a selection',()=>{
 const Editor=component('IdentityEntityEditorV2'),fetch=vi.fn();vi.stubGlobal('fetch',fetch)
 render(<Editor copy={copy} mode="related" relationshipOptions={relationshipOptions} fieldPrefix="controller" requireIdentifier={false}/>)
 const identity=screen.getByLabelText('Controller identity document') as HTMLInputElement,relationship=screen.getByLabelText('Relationship document') as HTMLInputElement
 const file=new File(['%PDF-1.4 synthetic'],'synthetic-controller.pdf',{type:'application/pdf'})
 fireEvent.change(identity,{target:{files:[file]}})
 expect(identity.files?.[0]).toBe(file);expect(identity.name).toBe('controller.ownerDocument');expect(relationship.name).toBe('controller.relationshipDocument')
 expect(fetch).not.toHaveBeenCalled();expect(screen.queryByText('Verified',{exact:true})).not.toBeInTheDocument()
})

it('hides evidence actions when the host grants no corresponding presentation capability',()=>{
 const Workspace=component('IdentityEvidenceWorkspace')
 render(<Workspace copy={workspaceCopy} subject={subject} identifiers={[]} capabilities={{editSubject:false,addIdentifier:false,selfUpload:false,organizationUpload:false,professionalAttestation:false}} onUploadEvidence={vi.fn()}/>)
 expect(screen.getByText('Synthetic dependent',{exact:true})).toBeVisible()
 expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('emits a requested evidence route while retaining the pending host readback',()=>{
 const Workspace=component('IdentityEvidenceWorkspace'),onUploadEvidence=vi.fn()
 render(<Workspace copy={workspaceCopy} subject={subject} identifiers={[{id:'synthetic-controller-id',typeLabel:'Document',jurisdictionLabel:'Host jurisdiction',displayValue:'Synthetic reference',status:'pending'}]} capabilities={{editSubject:false,addIdentifier:false,selfUpload:true,organizationUpload:false,professionalAttestation:false}} onUploadEvidence={onUploadEvidence}/>)
 fireEvent.click(screen.getByRole('button',{name:/Upload private evidence/u}))
 expect(onUploadEvidence).toHaveBeenCalledExactlyOnceWith('self')
 expect(screen.getByText('Pending',{exact:true})).toBeVisible();expect(screen.queryByText('Verified',{exact:true})).not.toBeInTheDocument()
})

it('keeps host subject and controller content inside their respective identity steps',()=>{
 const Workspace=component('IdentityEvidenceWorkspace')
 render(<Workspace copy={workspaceCopy} subject={subject} identifiers={[]} capabilities={{editSubject:false,addIdentifier:false,selfUpload:false,organizationUpload:false,professionalAttestation:false}}
  subjectContent={<section aria-label="Subject details">Host subject readback</section>}
  controllerContent={<section aria-label="Controller details">Host controller readback</section>}/> )
 expect(screen.getByRole('region',{name:'Subject details'}).closest('li')).toBe(screen.getByRole('heading',{name:'Dependent'}).closest('li'))
 expect(screen.getByRole('region',{name:'Controller details'}).closest('li')).toBe(screen.getByRole('heading',{name:'Controller'}).closest('li'))
})

it('keeps the host upload form beneath its action inside the evidence step',()=>{
 const Workspace=component('IdentityEvidenceWorkspace'),fetch=vi.fn();vi.stubGlobal('fetch',fetch)
 render(<Workspace copy={workspaceCopy} subject={subject} identifiers={[]} capabilities={{editSubject:false,addIdentifier:false,selfUpload:true,organizationUpload:false,professionalAttestation:false}} onUploadEvidence={vi.fn()}
  evidenceContent={<form aria-label="Private evidence upload"><input aria-label="Evidence document" type="file"/></form>}/> )
 const action=screen.getByRole('button',{name:/Upload private evidence/u}),form=screen.getByRole('form',{name:'Private evidence upload'})
 expect(form.closest('li')).toBe(action.closest('li'))
 expect(action.compareDocumentPosition(form)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
 expect(fetch).not.toHaveBeenCalled()
})
