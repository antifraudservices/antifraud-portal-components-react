// Flow contract: Review and correct each homogeneous catalogue draft before publishing the completed batch in one action.
// @vitest-environment jsdom
import React from 'react'
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, expect, it, vi} from 'vitest'
import {readPublicOfferingDraftDocument} from 'antifraud-data-utils-ts/public-offering-catalog'
import {PublicOfferingDraftReview} from '../src/public-offering-draft-review'

afterEach(cleanup)

it('prefills and reviews each product before publishing, retaining edits and identifiers', async()=>{
  const offers=[{id:'spain',seller:{id:'demo-seller',name:'Demo seller'},eligibleRegions:[{country:'ES',regions:[]}],
    deliveryCountries:[],operationCountries:[],supportCountries:[],url:'https://example.invalid/checkout'}]
  const document=readPublicOfferingDraftDocument({data:['Tracker','Collar'].map(name=>({id:name.toLowerCase(),type:'Product',
    attributes:{name,category:'devices',description:name,offers}}))})
  const publish=vi.fn(async()=>true)
  render(<PublicOfferingDraftReview initialDocument={document} publish={publish}/>)
  const button=(name:string)=>screen.getByRole('button',{name}) as HTMLButtonElement
  expect((screen.getByLabelText('Offering name') as HTMLInputElement).value).toBe('Tracker')
  expect((screen.getByLabelText('Eligible territories') as HTMLTextAreaElement).value).toBe('ES')
  expect(button('Publish reviewed entries').disabled).toBe(true)
  fireEvent.change(screen.getByLabelText('Offering name'),{target:{value:'Updated tracker'}})
  fireEvent.click(button('Mark as reviewed'))
  expect((screen.getByLabelText('Offering name') as HTMLInputElement).value).toBe('Collar')
  expect(button('Publish reviewed entries').disabled).toBe(true)
  fireEvent.click(button('Mark as reviewed'))
  fireEvent.click(button('Previous entry'))
  fireEvent.change(screen.getByLabelText('Offering name'),{target:{value:'Final tracker'}})
  expect(button('Publish reviewed entries').disabled).toBe(true)
  fireEvent.click(button('Mark as reviewed'))
  expect(publish).not.toHaveBeenCalled()
  fireEvent.click(button('Publish reviewed entries'))
  await waitFor(()=>expect(publish).toHaveBeenCalledWith({...document,data:[{...document.data[0],attributes:{...document.data[0].attributes,name:'Final tracker'}},document.data[1]]}))
})

it('keeps files attached to their listing and requires review again after changing them',async()=>{
  const image='https://example.invalid/existing-photo.png'
  const document=readPublicOfferingDraftDocument({data:['Tracker','Collar'].map(name=>({id:name.toLowerCase(),type:'Product',
    attributes:{name,category:'devices',description:name,images:[image],offers:[]}}))})
  const photo=new File(['synthetic image fixture'],'tracker.png',{type:'image/png'})
  const publish=vi.fn(async()=>true)
  render(<PublicOfferingDraftReview initialDocument={document} publish={publish} allowImageUploads/>)
  const button=(name:string)=>screen.getByRole('button',{name}) as HTMLButtonElement
  fireEvent.click(button('Mark as reviewed'))
  fireEvent.click(button('Mark as reviewed'))
  fireEvent.click(button('Previous entry'))
  fireEvent.change(screen.getByLabelText('Upload photos'),{target:{files:[photo]}})
  expect(button('Publish reviewed entries').disabled).toBe(true)
  expect(screen.getByText(photo.name)).toBeDefined()
  expect((screen.getByLabelText('Photo URLs') as HTMLTextAreaElement).value).toBe(image)
  fireEvent.click(button('Mark as reviewed'))
  fireEvent.click(button('Next entry'))
  expect(screen.queryByText(photo.name)).toBeNull()
  fireEvent.click(button('Publish reviewed entries'))
  await waitFor(()=>expect(publish).toHaveBeenCalledWith(document,[{id:'tracker',files:[photo]}]))
})
