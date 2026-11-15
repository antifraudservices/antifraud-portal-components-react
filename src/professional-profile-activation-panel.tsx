'use client'

import {useState,type FormEvent} from 'react'
export type ProfessionalProfileActivationCopy=Readonly<{eyebrow?:string;title:string;description:string;credentialLabel:string;pinLabel:string;pinConfirmationLabel:string;pinMismatch:string;submit:string;submitting:string}>
/** `credential` retains the established invitation-code wire field; it is not reusable professional evidence. */
export type ProfessionalProfileActivationInput=Readonly<{credential:string;pin:string}>
export type ProfessionalProfileActivationPanelProps=Readonly<{copy:ProfessionalProfileActivationCopy;busy:boolean;error?:string;onSubmit:(input:ProfessionalProfileActivationInput)=>void|Promise<void>}>

/** Emits an explicit temporary-invitation activation intention; the host owns recipient binding and enrollment. */
export function ProfessionalProfileActivationPanel({copy,busy,error,onSubmit}:ProfessionalProfileActivationPanelProps){
 const [credential,setCredential]=useState(''),[pin,setPin]=useState(''),[confirmation,setConfirmation]=useState(''),[localError,setLocalError]=useState('')
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;if(pin!==confirmation){setLocalError(copy.pinMismatch);return}setLocalError('');void onSubmit({credential:credential.trim(),pin})}
 return <section className="afpc-professional-profile afpc-professional-activation"><form onSubmit={submit}>
  <header>{copy.eyebrow?<p className="afpc-eyebrow">{copy.eyebrow}</p>:null}<h1>{copy.title}</h1><p>{copy.description}</p></header>
  <label><span>{copy.credentialLabel}</span><input name="professionalCredential" value={credential} onChange={event=>setCredential(event.currentTarget.value)} autoComplete="one-time-code" required disabled={busy}/></label>
  <label><span>{copy.pinLabel}</span><input name="newPin" type="password" inputMode="numeric" minLength={6} maxLength={12} autoComplete="new-password" value={pin} onChange={event=>setPin(event.currentTarget.value)} required disabled={busy}/></label>
  <label><span>{copy.pinConfirmationLabel}</span><input name="confirmPin" type="password" inputMode="numeric" minLength={6} maxLength={12} autoComplete="new-password" value={confirmation} onChange={event=>setConfirmation(event.currentTarget.value)} required disabled={busy}/></label>
  {localError||error?<p role="alert">{localError||error}</p>:null}<button type="submit" data-portal-action="activate-member-profile" disabled={busy}>{busy?copy.submitting:copy.submit}</button>
 </form></section>
}
