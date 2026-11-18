import {useEffect,useRef,useState} from 'react'
import jsQR from 'jsqr'

type Detector=Readonly<{detect(source:HTMLVideoElement):Promise<readonly Readonly<{rawValue:string}>[]>}>
type DetectorConstructor=new(options:Readonly<{formats:readonly string[]}>)=>Detector
const MAX_BYTES=4*1024*1024,MAX_PIXELS=16_000_000
export class CredentialCaptureError extends Error{constructor(readonly reason:'invalidFile'|'tooLarge'|'cameraUnavailable'){super(reason)}}
const dimensions=(width:number,height:number)=>{if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new CredentialCaptureError('invalidFile');if(width*height>MAX_PIXELS)throw new CredentialCaptureError('tooLarge')}
function inertSvg(source:string):string{
 if(/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/iu.test(source))throw new CredentialCaptureError('invalidFile')
 const document=new DOMParser().parseFromString(source,'image/svg+xml'),root=document.documentElement
 if(root.localName!=='svg'||document.querySelector('parsererror'))throw new CredentialCaptureError('invalidFile')
 const tags=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','title','desc'])
 const attributes=new Set(['xmlns','width','height','viewBox','version','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','clip-rule','shape-rendering','opacity','fill-opacity','stroke-opacity','transform','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','points','d','preserveAspectRatio'])
 for(const node of [root,...Array.from(root.querySelectorAll('*'))]){
  if(!tags.has(node.localName)||node.namespaceURI!=='http://www.w3.org/2000/svg')throw new CredentialCaptureError('invalidFile')
  for(const attribute of Array.from(node.attributes))if(!attributes.has(attribute.name)||/url\s*\(|(?:https?:|data:|javascript:|file:)/iu.test(attribute.value)&&attribute.name!=='xmlns')throw new CredentialCaptureError('invalidFile')
 }
 const box=root.getAttribute('viewBox')?.trim().split(/[\s,]+/u).map(Number),width=Number(root.getAttribute('width')?.replace(/px$/u,''))||box?.[2],height=Number(root.getAttribute('height')?.replace(/px$/u,''))||box?.[3]
 if(width!==undefined&&height!==undefined)dimensions(width,height)
 return new XMLSerializer().serializeToString(root)
}
async function bitmapFor(file:Blob):Promise<Readonly<{width:number;height:number;source:CanvasImageSource;close:()=>void}>>{
 if(typeof createImageBitmap==='function'){try{const bitmap=await createImageBitmap(file);return {width:bitmap.width,height:bitmap.height,source:bitmap,close:()=>bitmap.close()}}catch{ /* Some browsers require Image rasterization for inert SVG. */ }}
 const url=URL.createObjectURL(file),image=new Image()
 try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new CredentialCaptureError('invalidFile'));image.src=url});return {width:image.naturalWidth,height:image.naturalHeight,source:image,close:()=>URL.revokeObjectURL(url)}}catch(error){URL.revokeObjectURL(url);throw error}
}
/** Local capture only. No parsing/verification, network, persistence or authority. */
export function useCredentialQrCapture(options:Readonly<{onScan?:()=>Promise<string|undefined>;onReadImage?:(file:File)=>Promise<string|undefined>}>={}){
 const videoRef=useRef<HTMLVideoElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),stream=useRef<MediaStream|undefined>(undefined),timer=useRef<number|undefined>(undefined),pending=useRef<((value:string|undefined)=>void)|undefined>(undefined),pendingFailure=useRef<((error:unknown)=>void)|undefined>(undefined),mounted=useRef(true),epoch=useRef(0)
 const [cameraActive,setCameraActive]=useState(false)
 function stopCamera(value?:string){epoch.current++;if(timer.current!==undefined)window.clearInterval(timer.current);timer.current=undefined;stream.current?.getTracks().forEach(track=>track.stop());stream.current=undefined;if(videoRef.current)videoRef.current.srcObject=null;const complete=pending.current;pending.current=undefined;pendingFailure.current=undefined;complete?.(value);if(mounted.current)setCameraActive(false)}
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stopCamera()}},[])
 async function scanCamera():Promise<string|undefined>{
  if(options.onScan)return options.onScan()
  stopCamera();const generation=epoch.current
  if(!navigator.mediaDevices?.getUserMedia)throw new CredentialCaptureError('cameraUnavailable')
  let media:MediaStream;try{media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false})}catch{throw new CredentialCaptureError('cameraUnavailable')}
  if(!mounted.current||generation!==epoch.current||!videoRef.current){media.getTracks().forEach(track=>track.stop());return undefined}
  stream.current=media;videoRef.current.srcObject=media
  try{await videoRef.current.play()}catch(error){stopCamera();throw error}
  if(!mounted.current||generation!==epoch.current)return undefined
  setCameraActive(true)
  return new Promise((resolve,reject)=>{
   pending.current=resolve;pendingFailure.current=reject;const Constructor=(window as typeof window&{BarcodeDetector?:DetectorConstructor}).BarcodeDetector;let detector:Detector|undefined;try{detector=Constructor?new Constructor({formats:['qr_code']}):undefined}catch{detector=undefined}let processing=false
   timer.current=window.setInterval(()=>{if(processing||generation!==epoch.current||!videoRef.current)return;processing=true;void(async()=>{
    let candidate:string|undefined
    if(detector){try{candidate=(await detector.detect(videoRef.current!))[0]?.rawValue}catch{detector=undefined}}
    if(!detector&&canvasRef.current&&videoRef.current?.videoWidth&&videoRef.current.videoHeight){const canvas=canvasRef.current;dimensions(videoRef.current.videoWidth,videoRef.current.videoHeight);canvas.width=videoRef.current.videoWidth;canvas.height=videoRef.current.videoHeight;const context=canvas.getContext('2d',{willReadFrequently:true});if(context){context.drawImage(videoRef.current,0,0,canvas.width,canvas.height);candidate=jsQR(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height)?.data}}
    if(candidate&&mounted.current&&generation===epoch.current)stopCamera(candidate)
   })().catch(error=>{if(generation===epoch.current){pendingFailure.current?.(error);stopCamera()}}).finally(()=>{processing=false})},400)
  })
 }
 async function readImage(file:File):Promise<string|undefined>{
  if(file.size>MAX_BYTES)throw new CredentialCaptureError('tooLarge')
  if(!['image/png','image/jpeg','image/svg+xml','image/webp'].includes(file.type))throw new CredentialCaptureError('invalidFile')
  const source=file.type==='image/svg+xml'?new Blob([inertSvg(await file.text())],{type:'image/svg+xml'}):file
  if(options.onReadImage)return options.onReadImage(file)
  const bitmap=await bitmapFor(source)
  try{dimensions(bitmap.width,bitmap.height);const canvas=canvasRef.current;if(!canvas)return undefined;canvas.width=bitmap.width;canvas.height=bitmap.height;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return undefined;context.drawImage(bitmap.source,0,0);return jsQR(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height)?.data}finally{bitmap.close()}
 }
 return {videoRef,canvasRef,cameraActive,scanCamera,readImage,stopCamera}
}
