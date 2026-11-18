'use client'

import {useEffect,useRef,useState,type FormEvent} from 'react'
import {useCredentialQrCapture} from './credential-qr-capture-internal.js'
import {ProfileIdentityTarget,type ProfileProtectionTargetV2} from 'antifraud-common-components-react'

export type ExistingProfessionalProfileCopy=Readonly<{
 eyebrow?:string;title:string;description:string;credentialMethodLabel:string;organizationMethodLabel:string;manualMethodLabel:string
 scanProfessionalCredential:string;uploadProfessionalCredentialQr:string;professionalCredentialReady:string;professionalCredentialRequired:string
 closeCamera:string;cameraActive:string;credentialQrUnreadable:string;professionalIdentifierLabel:string
 countryLabel?:string;countryPlaceholder?:string;regionalIdentifierLabel?:string;regionLabel?:string;regionPlaceholder?:string;organizationIdentifierLabel?:string
 sectorLabel:string;pinLabel:string;pinConfirmationLabel:string;pinMismatch:string;verify?:string;verifying?:string;verifiedProfile?:string;changeEvidence?:string;verificationFailed?:string;submit:string;submitting:string
}>
export type ExistingProfessionalEvidenceInput=
 |Readonly<{method:'credential';professionalCredential:string}>
 |Readonly<{method:'identifier';professionalIdentifier:string;sector:string}>
 |Readonly<{method:'organization';country:string;region?:string;organizationIdentifier:string;sector:string}>
export type ExistingProfessionalProfileInput=
 |Readonly<{method:'credential';professionalCredential:string;pin:string}>
 |Readonly<{method:'identifier';professionalIdentifier:string;sector:string;pin:string}>
 |Readonly<{method:'organization';country:string;region?:string;organizationIdentifier:string;sector:string;selectedProfile:string;pin:string}>
export type ResolvedExistingProfessionalProfile=Omit<ProfileProtectionTargetV2,'eyebrow'>&Readonly<{eyebrow?:string;selectionValue?:string}>
export type ExistingProfessionalProfileRequest=
 |Readonly<{professionalCredential:string;pin:string}>
 |Readonly<{professionalIdentifier:string;sectorHint:string;pin:string}>
 |Readonly<{country:string;region?:string;organizationIdentifier:string;sectorHint:string;selectedProfile:string;pin:string}>
export type ExistingProfessionalSectorOption=Readonly<{value:string;label:string}>
export type ExistingProfessionalJurisdictionOption=Readonly<{value:string;label:string}>
export type ExistingProfessionalProfilePanelProps=Readonly<{
 copy:ExistingProfessionalProfileCopy;sectors:readonly ExistingProfessionalSectorOption[];countries?:readonly ExistingProfessionalJurisdictionOption[];regionsByCountry?:Readonly<Record<string,readonly ExistingProfessionalJurisdictionOption[]>>
 busy:boolean;error?:string;onScanProfessionalCredential?:()=>Promise<string|undefined>;onReadProfessionalCredentialImage?:(file:File)=>Promise<string|undefined>
 onResolve?:(input:ExistingProfessionalEvidenceInput)=>Promise<ResolvedExistingProfessionalProfile|readonly ResolvedExistingProfessionalProfile[]>
 onSubmit:(input:ExistingProfessionalProfileInput)=>void|Promise<void>
}>

/** Pure BFF field projection; it neither accepts an invitation nor verifies professional evidence. */
export function toExistingProfessionalProfileRequest(input:ExistingProfessionalProfileInput):ExistingProfessionalProfileRequest{
 if(input.method==='credential')return Object.freeze({professionalCredential:input.professionalCredential,pin:input.pin})
 if(input.method==='identifier')return Object.freeze({professionalIdentifier:input.professionalIdentifier,sectorHint:input.sector,pin:input.pin})
 return Object.freeze({country:input.country,...(input.region?{region:input.region}:{}),organizationIdentifier:input.organizationIdentifier,sectorHint:input.sector,selectedProfile:input.selectedProfile,pin:input.pin})
}

const list=(value:ResolvedExistingProfessionalProfile|readonly ResolvedExistingProfessionalProfile[]):readonly ResolvedExistingProfessionalProfile[]=>Array.isArray(value)?value:[value as ResolvedExistingProfessionalProfile]

/** Local evidence capture and host-resolved profile selection; the host alone authorizes enrollment and device custody. */
export function ExistingProfessionalProfilePanel({copy,sectors,countries=[],regionsByCountry={},busy,error,onScanProfessionalCredential,onReadProfessionalCredentialImage,onResolve,onSubmit}:ExistingProfessionalProfilePanelProps){
 const [method,setMethod]=useState<'credential'|'identifier'|'organization'>('credential'),[credential,setCredential]=useState(''),[identifier,setIdentifier]=useState(''),[sector,setSector]=useState(sectors[0]?.value??'')
 const [country,setCountry]=useState(''),[regional,setRegional]=useState(false),[region,setRegion]=useState(''),[organization,setOrganization]=useState('')
 const [pin,setPin]=useState(''),[confirmation,setConfirmation]=useState(''),[profiles,setProfiles]=useState<readonly ResolvedExistingProfessionalProfile[]>([]),[selected,setSelected]=useState<ResolvedExistingProfessionalProfile>(),[resolving,setResolving]=useState(false),[localError,setLocalError]=useState('')
 const {videoRef:video,canvasRef:canvas,cameraActive,scanCamera,readImage,stopCamera}=useCredentialQrCapture({...(onScanProfessionalCredential?{onScan:onScanProfessionalCredential}:{}),...(onReadProfessionalCredentialImage?{onReadImage:onReadProfessionalCredentialImage}:{})})
 const mounted=useRef(true),captureEpoch=useRef(0),resolveEpoch=useRef(0)
 const failure=copy.verificationFailed??'The profile could not be resolved.'
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;captureEpoch.current++;resolveEpoch.current++;stopCamera()}},[])
 function resetResolution(){resolveEpoch.current++;setProfiles([]);setSelected(undefined);setResolving(false);setPin('');setConfirmation('');setLocalError('')}
 function chooseMethod(value:typeof method){stopCamera();captureEpoch.current++;resetResolution();setMethod(value)}
 async function capture(read:()=>Promise<string|undefined>,message:string){
  const epoch=++captureEpoch.current;setLocalError('')
  try{const candidate=await read();if(!mounted.current||epoch!==captureEpoch.current)return;const value=typeof candidate==='string'?candidate.trim():'';if(!value){setLocalError(message);return}setCredential(value);resetResolution()}
  catch{if(mounted.current&&epoch===captureEpoch.current)setLocalError(message)}
 }
 function evidence():ExistingProfessionalEvidenceInput|undefined{
  if(method==='credential'){if(!credential.trim()){setLocalError(copy.professionalCredentialRequired);return}return {method,professionalCredential:credential.trim()}}
  if(method==='identifier')return {method,professionalIdentifier:identifier.trim(),sector}
  return {method,country,...(regional?{region}:{}),organizationIdentifier:organization.trim(),sector}
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy||resolving)return;const input=evidence();if(!input)return
  if(onResolve&&!profiles.length){
   const epoch=++resolveEpoch.current;setResolving(true);setLocalError('')
   try{const result=list(await onResolve(input));if(!mounted.current||epoch!==resolveEpoch.current)return;if(!result.length){setLocalError(failure);return}setProfiles(result);setSelected(result.length===1?result[0]:undefined)}
   catch{if(mounted.current&&epoch===resolveEpoch.current)setLocalError(failure)}
   finally{if(mounted.current&&epoch===resolveEpoch.current)setResolving(false)}
   return
  }
  if(pin!==confirmation){setLocalError(copy.pinMismatch);return}setLocalError('')
  if(input.method==='organization'){if(!selected?.selectionValue){setLocalError(failure);return}void onSubmit({...input,selectedProfile:selected.selectionValue,pin});return}
  void onSubmit({...input,pin})
 }
 const pinFields=<><label><span>{copy.pinLabel}</span><input name="newPin" type="password" inputMode="numeric" minLength={6} maxLength={12} autoComplete="new-password" value={pin} onChange={event=>setPin(event.currentTarget.value)} required disabled={busy}/></label><label><span>{copy.pinConfirmationLabel}</span><input name="confirmPin" type="password" inputMode="numeric" minLength={6} maxLength={12} autoComplete="new-password" value={confirmation} onChange={event=>setConfirmation(event.currentTarget.value)} required disabled={busy}/></label></>
 if(onResolve&&profiles.length)return <section className="afpc-professional-profile afpc-professional-activation afpc-professional-pin-setup"><header><h1>{copy.verifiedProfile??copy.title}</h1><p>{copy.description}</p></header>
  {profiles.length>1?<div className="afpc-resolved-professional-options" role="group" aria-label={copy.verifiedProfile??copy.title}>{profiles.map(profile=><button type="button" key={profile.selectionValue??profile.title} aria-pressed={profile===selected} onClick={()=>setSelected(profile)} disabled={busy}><ProfileIdentityTarget target={{...profile,eyebrow:profile.eyebrow??copy.verifiedProfile??''}}/></button>)}</div>:selected?<ProfileIdentityTarget target={{...selected,eyebrow:selected.eyebrow??copy.verifiedProfile??''}}/>:null}
  <form onSubmit={submit}>{selected?pinFields:null}{localError||error?<p role="alert">{localError||error}</p>:null}{selected?<button type="submit" disabled={busy}>{busy?copy.submitting:copy.submit}</button>:null}<button type="button" className="afpc-secondary-action" disabled={busy} onClick={resetResolution}>{copy.changeEvidence??copy.manualMethodLabel}</button></form>
 </section>
 return <section className="afpc-professional-profile afpc-professional-activation"><form onSubmit={submit}><header>{copy.eyebrow?<p className="afpc-eyebrow">{copy.eyebrow}</p>:null}<h1>{copy.title}</h1><p>{copy.description}</p></header>
  <fieldset className="afpc-professional-evidence-methods"><label><input type="radio" name="professionalEvidenceMethod" value="credential" checked={method==='credential'} onChange={()=>chooseMethod('credential')} disabled={busy}/><span>{copy.credentialMethodLabel}</span></label>{countries.length?<label><input type="radio" name="professionalEvidenceMethod" value="organization" checked={method==='organization'} onChange={()=>chooseMethod('organization')} disabled={busy}/><span>{copy.organizationMethodLabel}</span></label>:null}<label><input type="radio" name="professionalEvidenceMethod" value="identifier" checked={method==='identifier'} onChange={()=>chooseMethod('identifier')} disabled={busy}/><span>{copy.manualMethodLabel}</span></label></fieldset>
  {method==='credential'?<div className="afpc-professional-credential-capture"><button type="button" disabled={busy} onClick={()=>void capture(scanCamera,copy.professionalCredentialRequired)}>{copy.scanProfessionalCredential}</button><label><span>{copy.uploadProfessionalCredentialQr}</span><input name="professionalCredentialQrImage" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event=>{const file=event.currentTarget.files?.[0];if(file)void capture(()=>readImage(file),copy.credentialQrUnreadable)}}/></label><video ref={video} hidden={!cameraActive} playsInline muted aria-label={copy.cameraActive}/>{cameraActive?<><p role="status">{copy.cameraActive}</p><button type="button" onClick={()=>stopCamera()}>{copy.closeCamera}</button></>:null}<canvas ref={canvas} hidden aria-hidden="true"/>{credential?<p role="status">{copy.professionalCredentialReady}</p>:null}</div>:<>
   {method==='organization'?<><label><span>{copy.countryLabel??'Country'}</span><select name="professionalCountry" value={country} onChange={event=>{resetResolution();setCountry(event.currentTarget.value);setRegional(false);setRegion('')}} required disabled={busy}><option value="" disabled>{copy.countryPlaceholder??copy.countryLabel??'Country'}</option>{countries.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="afpc-professional-regional-identifier"><input type="checkbox" checked={regional} disabled={busy||!country||!regionsByCountry[country]?.length} onChange={event=>{resetResolution();setRegional(event.currentTarget.checked);if(!event.currentTarget.checked)setRegion('')}}/><span>{copy.regionalIdentifierLabel??'The legal identifier is regional'}</span></label>{regional?<label><span>{copy.regionLabel??'Region'}</span><select name="professionalRegion" value={region} onChange={event=>{resetResolution();setRegion(event.currentTarget.value)}} required disabled={busy}><option value="" disabled>{copy.regionPlaceholder??copy.regionLabel??'Region'}</option>{(regionsByCountry[country]??[]).map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>:null}<label><span>{copy.organizationIdentifierLabel??'Organization legal identifier'}</span><input name="organizationIdentifier" value={organization} onChange={event=>{resetResolution();setOrganization(event.currentTarget.value)}} autoComplete="off" required disabled={busy}/></label></>:<label><span>{copy.professionalIdentifierLabel}</span><input name="professionalIdentifier" value={identifier} onChange={event=>{resetResolution();setIdentifier(event.currentTarget.value)}} autoComplete="off" required disabled={busy}/></label>}
   <label><span>{copy.sectorLabel}</span><select name="professionalSector" value={sector} onChange={event=>{resetResolution();setSector(event.currentTarget.value)}} required disabled={busy}>{sectors.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  </>}
  {!onResolve?pinFields:null}{localError||error?<p role="alert">{localError||error}</p>:null}<button type="submit" disabled={busy||resolving}>{resolving?(copy.verifying??copy.submitting):onResolve?(copy.verify??copy.submit):busy?copy.submitting:copy.submit}</button>
 </form></section>
}
