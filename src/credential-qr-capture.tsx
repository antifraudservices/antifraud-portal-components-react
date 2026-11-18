'use client'
import {useEffect,useId,useRef,useState} from 'react'
import {CredentialCaptureError,useCredentialQrCapture} from './credential-qr-capture-internal.js'
export type CredentialQrCaptureCopy=Readonly<{valueLabel:string;valueHint:string;scan:string;upload:string;verify:string;verifying:string;closeCamera:string;cameraActive:string;cameraUnavailable:string;unreadable:string;invalidFile:string;tooLarge:string}>
export type CredentialQrCaptureProps=Readonly<{value:string;onChange:(value:string)=>void;onVerify:(value:string)=>void|Promise<void>;copy:CredentialQrCaptureCopy;busy?:boolean;error?:string}>
/** Candidate capture is separate from the host's explicit verification operation. */
export function CredentialQrCapture({value,onChange,onVerify,copy,busy=false,error}:CredentialQrCaptureProps){
 const hintId=useId(),capture=useCredentialQrCapture(),generation=useRef(0),mounted=useRef(true),[localError,setLocalError]=useState('')
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++}},[])
 useEffect(()=>{if(busy){generation.current++;capture.stopCamera()}},[busy])
 async function read(operation:()=>Promise<string|undefined>){const request=++generation.current;setLocalError('');try{const candidate=await operation();if(!mounted.current||request!==generation.current)return;if(candidate===undefined)return;if(!candidate){setLocalError(copy.unreadable);return}onChange(candidate)}catch(reason){if(mounted.current&&request===generation.current)setLocalError(reason instanceof CredentialCaptureError?copy[reason.reason]:copy.unreadable)}}
 return <div className="afpc-credential-qr-capture">
  <label><span>{copy.valueLabel}</span><textarea aria-describedby={hintId} value={value} disabled={busy} spellCheck={false} autoComplete="off" onChange={event=>{generation.current++;setLocalError('');onChange(event.currentTarget.value)}}/></label><p id={hintId}>{copy.valueHint}</p>
  <button type="button" disabled={busy} onClick={()=>void read(capture.scanCamera)}>{copy.scan}</button>
  <label><span>{copy.upload}</span><input type="file" accept="image/png,image/jpeg,image/svg+xml" disabled={busy} onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void read(()=>capture.readImage(file))}}/></label>
  <video ref={capture.videoRef} hidden={!capture.cameraActive} playsInline muted aria-label={copy.cameraActive}/>
  {capture.cameraActive?<><p role="status">{copy.cameraActive}</p><button type="button" onClick={()=>{generation.current++;capture.stopCamera()}}>{copy.closeCamera}</button></>:null}
  <canvas ref={capture.canvasRef} hidden aria-hidden="true"/>
  {localError||error?<p role="alert">{localError||error}</p>:null}
  <button type="button" aria-label={copy.verify} disabled={busy||!value} onClick={()=>void onVerify(value)}>{busy?copy.verifying:copy.verify}</button>
 </div>
}
