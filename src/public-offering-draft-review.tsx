'use client'

import React, {useState} from 'react'
import {validatePublicOfferingDraftResource,type PublicOfferingDraftDocument} from 'antifraud-data-utils-ts/public-offering-catalog'

type Fields = Readonly<Record<string, unknown>>
const object = (value: unknown): Fields => value && typeof value === 'object' && !Array.isArray(value) ? value as Fields : {}
const rows = (value: unknown): readonly Fields[] => Array.isArray(value) ? value.map(object) : []
const text = (value: unknown): string => typeof value === 'string' ? value : ''
const words = (value: string): string[] => value.split(/[,\r\n]+/u).map(item=>item.trim()).filter(Boolean)
const formatList = (value: unknown): string => Array.isArray(value) ? value.map(text).join(', ') : ''
const imageTypes = ['image/jpeg', 'image/png', 'image/webp']

export type PublicOfferingDraftImages = Readonly<{id:string;files:readonly File[]}>

const en = {
  product:'Product', service:'Service', name:'Offering name', description:'Description', category:'Category', website:'Product or service website',
  brand:'Brand name', logo:'Brand logo URL', images:'Photo URLs', manufacturer:'Manufacturer', identifier:'Identifier', partyName:'Name',
  uploadImages:'Upload photos', clearImages:'Remove selected photos', invalidImages:'Choose up to four JPEG, PNG or WebP files of up to 512 KB each, with up to eight photos per listing including URLs.',
  offers:'Territorial offers', addOffer:'Add offer', removeOffer:'Remove offer', seller:'Seller', checkout:'External checkout URL',
  territories:'Eligible territories', territoryHelp:'Enter one country per line. Use CA:CA-BC,CA-ON for regions within a country.',
  delivery:'Delivery countries', operation:'Operation countries', support:'Support countries', plans:'Subscription plans', addPlan:'Add plan',
  removePlan:'Remove plan', currency:'Currency code', features:'Features', monthly:'Monthly price', annually:'Annual price',
  previous:'Previous entry', next:'Next entry', review:'Mark as reviewed', reviewed:'Reviewed', publish:'Publish reviewed entries',
  invalid:'Complete the name, category and description, and check any offers, territories and HTTPS links before reviewing this entry.',
}
const es: Record<keyof typeof en,string> = {
  product:'Producto', service:'Servicio', name:'Nombre de la ficha', description:'Descripción', category:'Categoría', website:'Web del producto o servicio',
  brand:'Marca', logo:'URL del logotipo', images:'URL de las fotos', manufacturer:'Fabricante', identifier:'Identificador', partyName:'Nombre',
  uploadImages:'Subir fotos', clearImages:'Quitar fotos seleccionadas', invalidImages:'Selecciona hasta cuatro archivos JPEG, PNG o WebP de hasta 512 KB cada uno, con un máximo de ocho fotos por ficha contando las URL.',
  offers:'Ofertas territoriales', addOffer:'Añadir oferta', removeOffer:'Eliminar oferta', seller:'Vendedor', checkout:'URL externa de compra',
  territories:'Territorios de venta', territoryHelp:'Introduce un país por línea. Usa CA:CA-BC,CA-ON para indicar regiones dentro del país.',
  delivery:'Países de entrega', operation:'Países de operación', support:'Países de soporte', plans:'Planes de suscripción', addPlan:'Añadir plan',
  removePlan:'Eliminar plan', currency:'Código de moneda', features:'Prestaciones', monthly:'Precio mensual', annually:'Precio anual',
  previous:'Ficha anterior', next:'Ficha siguiente', review:'Marcar como revisada', reviewed:'Revisada', publish:'Publicar fichas revisadas',
  invalid:'Completa el nombre, la categoría y la descripción. Comprueba las ofertas, los territorios y los enlaces HTTPS antes de revisar la ficha.',
}

type Copy = typeof en

function change(fields:Fields,key:string,value:unknown):Fields {
  const updated={...fields}
  if(value===''||value===undefined)delete updated[key]
  else updated[key]=value
  return updated
}

function field(label:string,value:unknown,update:(value:string)=>void,multiline=false){
  return <label>{label}{multiline
    ? <textarea value={text(value)} onChange={event=>update(event.currentTarget.value)}/>
    : <input value={text(value)} onChange={event=>update(event.currentTarget.value)}/>}</label>
}

function listField(label:string,value:unknown,update:(values:string[])=>void){
  return <label>{label}<textarea defaultValue={formatList(value)} onChange={event=>update(words(event.currentTarget.value))}/></label>
}

function partyFields(copy:Copy,label:string,value:unknown,update:(value:unknown)=>void){
  const party=object(value)
  function updateParty(key:string,value:string){
    const updated=change(party,key,value)
    update(Object.keys(updated).length?updated:undefined)
  }
  return <fieldset><legend>{label}</legend>
    {field(copy.identifier,party.id,value=>updateParty('id',value))}
    {field(copy.partyName,party.name,value=>updateParty('name',value))}
  </fieldset>
}

function territoryLines(value:unknown):string {
  return rows(value).map(territory=>{
    const regions=formatList(territory.regions)
    return `${text(territory.country)}${regions?`:${regions}`:''}`
  }).join('\n')
}

function readTerritoryLines(value:string){
  return value.split(/\r?\n/u).map(line=>line.trim()).filter(Boolean).map(line=>{
    const [country,...subdivisions]=line.split(':')
    return {country:country!.trim(),regions:words(subdivisions.join(':'))}
  })
}

function OfferFields({copy,offer,onChange}:{copy:Copy;offer:Fields;onChange(value:Fields):void}){
  const plans=rows(offer.plans)
  const update=(key:string,value:unknown)=>onChange(change(offer,key,value))
  return <>
    {field(copy.identifier,offer.id,value=>update('id',value))}
    {partyFields(copy,copy.seller,offer.seller,value=>update('seller',value))}
    {field(copy.checkout,offer.url,value=>update('url',value))}
    <label>{copy.territories}<textarea defaultValue={territoryLines(offer.eligibleRegions)}
      onChange={event=>update('eligibleRegions',readTerritoryLines(event.currentTarget.value))}/></label>
    <p>{copy.territoryHelp}</p>
    {listField(copy.delivery,offer.deliveryCountries,value=>update('deliveryCountries',value))}
    {listField(copy.operation,offer.operationCountries,value=>update('operationCountries',value))}
    {listField(copy.support,offer.supportCountries,value=>update('supportCountries',value))}
    <fieldset><legend>{copy.plans}</legend>
      {plans.map((plan,index)=>{
        const setPlan=(key:string,value:unknown)=>update('plans',plans.map((item,i)=>i===index?change(item,key,value):item))
        return <fieldset key={index}>
          {field(copy.partyName,plan.name,value=>setPlan('name',value))}
          {field(copy.description,plan.description,value=>setPlan('description',value))}
          {field(copy.currency,plan.currency,value=>setPlan('currency',value.toUpperCase()))}
          {field(copy.monthly,plan.monthly,value=>setPlan('monthly',value))}
          {field(copy.annually,plan.annually,value=>setPlan('annually',value))}
          {listField(copy.features,plan.features,value=>setPlan('features',value))}
        </fieldset>
      })}
      <button type="button" disabled={plans.length>=12} onClick={()=>update('plans',[...plans,{features:[]}])}>{copy.addPlan}</button>
      {plans.length>0&&<button type="button" onClick={()=>update('plans',plans.slice(0,-1))}>{copy.removePlan}</button>}
    </fieldset>
  </>
}

export function PublicOfferingDraftReview({initialDocument,publish,busy=false,locale='en',allowImageUploads=false}:Readonly<{
  initialDocument:PublicOfferingDraftDocument
  publish(document:PublicOfferingDraftDocument,images?:readonly PublicOfferingDraftImages[]):Promise<boolean>
  busy?:boolean
  locale?:string
  allowImageUploads?:boolean
}>){
  const copy=locale.split('-')[0]==='es'?es:en
  const [data,setData]=useState(initialDocument.data)
  const [index,setIndex]=useState(0)
  const [reviewed,setReviewed]=useState<ReadonlySet<string>>(()=>new Set())
  const [invalid,setInvalid]=useState(false)
  const [publishing,setPublishing]=useState(false)
  const [images,setImages]=useState<ReadonlyMap<string,readonly File[]>>(()=>new Map())
  const draft=data[index]
  if(!draft)return null
  const {attributes}=draft
  const brand=object(attributes.brand)
  const offers=rows(attributes.offers)
  const disabled=busy||publishing
  const selectedPhotos=images.get(draft.id)??[]
  const imageLinks=Array.isArray(attributes.images)?attributes.images.length:0
  const invalidImages=selectedPhotos.length>4||selectedPhotos.length+imageLinks>8||
    selectedPhotos.some(file=>!file.size||file.size>512_000||!imageTypes.includes(file.type))

  function markDirty(){
    setInvalid(false)
    setReviewed(current=>new Set([...current].filter(id=>id!==draft!.id)))
  }
  function selectPhotos(files:readonly File[]){
    markDirty()
    setImages(current=>{
      const next=new Map(current)
      if(files.length)next.set(draft!.id,files)
      else next.delete(draft!.id)
      return next
    })
  }
  function update(key:string,value:unknown){
    markDirty()
    setData(current=>current.map(resource=>resource.id===draft!.id?{...resource,attributes:change(resource.attributes,key,value)}:resource))
  }
  function updateBrand(key:string,value:string){
    const updated=change(brand,key,value)
    update('brand',Object.keys(updated).length?updated:undefined)
  }
  function goTo(nextIndex:number){setInvalid(false);setIndex(nextIndex)}
  function review(){
    if(invalidImages)return
    try{validatePublicOfferingDraftResource(draft!)}catch{setInvalid(true);return}
    const accepted=new Set([...reviewed,draft!.id])
    setReviewed(accepted)
    const next=data.findIndex(resource=>!accepted.has(resource.id))
    if(next>=0)goTo(next)
  }
  async function publishReviewed(){
    if(disabled||reviewed.size!==data.length)return
    setPublishing(true)
    try{
      const document={...initialDocument,data}
      if(images.size)await publish(document,[...images].map(([id,files])=>({id,files})))
      else await publish(document)
    }finally{setPublishing(false)}
  }

  return <div className="form">
    <fieldset key={draft.id} disabled={disabled}>
      <legend>{draft.type==='Product'?copy.product:copy.service} {index+1} / {data.length}</legend>
      {field(copy.name,attributes.name,value=>update('name',value))}
      {field(copy.category,attributes.category,value=>update('category',value))}
      {field(copy.description,attributes.description,value=>update('description',value),true)}
      {field(copy.website,attributes.url,value=>update('url',value))}
      {field(copy.brand,brand.name,value=>updateBrand('name',value))}
      {field(copy.logo,brand.logoUrl,value=>updateBrand('logoUrl',value))}
      {listField(copy.images,attributes.images,value=>update('images',value.length?value:undefined))}
      {allowImageUploads&&<>
        <label>{copy.uploadImages}<input type="file" multiple accept={imageTypes.join(',')}
          onChange={event=>{
            const input=event.currentTarget
            if(input.files?.length)selectPhotos(Array.from(input.files))
            input.value=''
          }}/></label>
        {selectedPhotos.length>0&&<>
          <ul>{selectedPhotos.map((file,i)=><li key={`${i}:${file.name}`}>{file.name}</li>)}</ul>
          <button type="button" onClick={()=>selectPhotos([])}>{copy.clearImages}</button>
        </>}
        {invalidImages&&<p role="alert">{copy.invalidImages}</p>}
      </>}
      {draft.type==='Product'&&partyFields(copy,copy.manufacturer,attributes.manufacturer,value=>update('manufacturer',value))}
      <fieldset><legend>{copy.offers}</legend>
        {offers.map((offer,position)=><fieldset key={position}>
          <OfferFields copy={copy} offer={offer} onChange={edited=>update('offers',offers.map((item,i)=>i===position?edited:item))}/>
        </fieldset>)}
        <button type="button" onClick={()=>update('offers',[...offers,{id:crypto.randomUUID(),eligibleRegions:[],deliveryCountries:[],operationCountries:[],supportCountries:[]}])}>{copy.addOffer}</button>
        {offers.length>0&&<button type="button" onClick={()=>update('offers',offers.slice(0,-1))}>{copy.removeOffer}</button>}
      </fieldset>
    </fieldset>
    {invalid&&<p role="alert">{copy.invalid}</p>}
    <div className="inline-actions">
      <button type="button" disabled={disabled||index===0} onClick={()=>goTo(index-1)}>{copy.previous}</button>
      <button type="button" disabled={disabled||index===data.length-1} onClick={()=>goTo(index+1)}>{copy.next}</button>
      <button type="button" disabled={disabled||invalidImages||reviewed.has(draft.id)} onClick={review}>{reviewed.has(draft.id)?copy.reviewed:copy.review}</button>
      <button type="button" disabled={disabled||reviewed.size!==data.length} onClick={()=>void publishReviewed()}>{copy.publish}</button>
    </div>
  </div>
}
