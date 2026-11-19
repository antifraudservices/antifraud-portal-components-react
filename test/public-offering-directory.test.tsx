// Flow contract: one controlled public catalogue renders category before optional geography, groups distributors, and emits filter/view intentions without authority or persistence.
import React, {useState} from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {PublicOfferingDirectory, type PublicOfferingDirectoryCopy} from '../src/public-offering-directory'

export const copy: PublicOfferingDirectoryCopy = {
  title: 'Data space', description: 'Discover products and services.', sector: 'Sector', allSectors: 'All sectors', category: 'Category', allCategories: 'All categories',
  country: 'Available in: Country (optional)', allCountries: 'All countries', region: 'Region (optional)', allRegions: 'All regions', query: 'Search products, services or distributors',
  grid: 'Grid', list: 'List', results: 'Results', empty: 'No matching offers.', details: 'View offers', publisher: 'Published by', seller: 'Offered by',
  availableIn: 'Available in', delivery: 'Delivery', operation: 'Operation', support: 'Support', notSpecified: 'Not specified', demo: 'Demo example', website: 'Visit website', offers: 'Offers',
}
function Harness() {
  const [query, onQueryChange] = useState({}), [view, onViewChange] = useState<'grid'|'list'>('grid')
  return <PublicOfferingDirectory copy={copy} query={query} onQueryChange={onQueryChange} view={view} onViewChange={onViewChange}
    sectors={[{value:'animal-care',label:'Animal health'}]} categories={[{value:'services',label:'Healthcare services'},{value:'insurance',label:'Insurance'},{value:'devices',label:'Devices'}]}
    countries={[{value:'ES',label:'Spain'},{value:'CA',label:'Canada'}]} regions={[{value:'CA-BC',label:'British Columbia',country:'CA'}]}
    entries={[{id:'tracker',type:'Product',category:'devices',sector:'animal-care',name:'Example tracker',description:'Monitoring device',publisher:{id:'maker',name:'Example manufacturer'},demo:true,
      offers:[{id:'es',seller:{id:'seller-es',name:'Example distributor ES'},eligibleRegions:[{country:'ES',regions:[]}],deliveryCountries:['ES'],operationCountries:[],supportCountries:[]},
        {id:'ca',seller:{id:'seller-ca',name:'Example distributor CA'},eligibleRegions:[{country:'CA',regions:['CA-BC']}],deliveryCountries:['CA'],operationCountries:[],supportCountries:[]}]}]}/>
}
describe('public offering discovery', () => {
  it('keeps geography optional, filters offers, resets subdivisions and switches presentation', async () => {
    const user = userEvent.setup()
    render(<Harness/> )
    const filters = screen.getAllByRole('combobox')
    expect(filters[1]).toHaveAccessibleName('Category')
    expect(filters[2]).toHaveAccessibleName(copy.country)
    expect(screen.getByLabelText(copy.country)).toHaveValue('')
    expect(screen.getByLabelText(copy.region)).toBeDisabled()
    expect(screen.getAllByRole('heading',{name:'Example tracker'})).toHaveLength(1)
    await user.selectOptions(screen.getByLabelText(copy.category), 'devices')
    await user.click(screen.getByText(copy.details))
    expect(screen.getByText('Example distributor ES')).toBeVisible()
    expect(screen.getByText('Example distributor CA')).toBeVisible()
    expect(screen.getByText(copy.demo)).toBeVisible()
    await user.selectOptions(screen.getByLabelText(copy.country), 'CA')
    expect(screen.queryByText('Example distributor ES')).not.toBeInTheDocument()
    expect(screen.getByText('Example distributor CA')).toBeVisible()
    await user.selectOptions(screen.getByLabelText(copy.region), 'CA-BC')
    await user.selectOptions(screen.getByLabelText(copy.country), 'ES')
    expect(screen.getByLabelText(copy.region)).toHaveValue('')
    await user.click(screen.getByRole('button',{name:copy.list}))
    expect(screen.getByRole('button',{name:copy.list})).toHaveAttribute('aria-pressed','true')
    await user.selectOptions(screen.getByLabelText(copy.category), 'insurance')
    expect(screen.getByText(copy.empty)).toBeVisible()
  })
  it('searches before country selection and keeps unknown operation separate from delivery', async () => {
    render(<Harness/> )
    await userEvent.type(screen.getByLabelText(copy.query), 'Example distributor CA')
    expect(screen.getByRole('heading',{name:'Example tracker'})).toBeVisible()
    await userEvent.click(screen.getByText(copy.details))
    const details = screen.getByRole('group', {name:copy.details})
    expect(within(details).getAllByText(copy.notSpecified).length).toBeGreaterThan(0)
    expect(screen.queryByText(/verified|certified/i)).not.toBeInTheDocument()
  })
})
