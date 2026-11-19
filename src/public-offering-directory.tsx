'use client'
import React, {useId, useState} from 'react'
import {searchPublicOfferingCatalog, type PublicOffering, type PublicOfferingQuery} from 'antifraud-data-utils-ts/public-offering-catalog'

export type {PublicOffering, PublicOfferingQuery} from 'antifraud-data-utils-ts/public-offering-catalog'
export type PublicOfferingOption = Readonly<{value: string; label: string}>
export type PublicOfferingDirectoryCopy = Readonly<{manufacturer?: string}> & Readonly<Record<
  'title'|'description'|'sector'|'allSectors'|'category'|'allCategories'|'country'|'allCountries'|'region'|'allRegions'|'query'|
  'grid'|'list'|'results'|'empty'|'details'|'publisher'|'seller'|'availableIn'|'delivery'|'operation'|'support'|'notSpecified'|'demo'|'website'|'offers', string>>
export type PublicOfferingDirectoryProps = Readonly<{
  copy: PublicOfferingDirectoryCopy
  entries: readonly PublicOffering[]
  sectors: readonly PublicOfferingOption[]
  categories: readonly PublicOfferingOption[]
  countries: readonly PublicOfferingOption[]
  regions: readonly (PublicOfferingOption & {country: string})[]
  query: PublicOfferingQuery
  view: 'grid'|'list'
  busy?: boolean
  showHeading?: boolean
  billingCopy?: Readonly<{monthly: string; annually: string; unpublished: string; image: string}>
  onQueryChange(query: PublicOfferingQuery): void
  onViewChange(view: 'grid'|'list'): void
}>
const safeUrl = (url?: string) => {
  if (!url) return undefined
  try {const parsed = new URL(url); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? url : undefined} catch {return undefined}
}

/** Controlled, product-neutral presentation. The host supplies only public metadata; filters never grant authority. */
export function PublicOfferingDirectory({copy, entries, sectors, categories, countries, regions, query, view, busy = false, showHeading = true, billingCopy, onQueryChange, onViewChange}: PublicOfferingDirectoryProps) {
  const id = useId()
  const results = searchPublicOfferingCatalog(entries, query)
  const label = (options: readonly PublicOfferingOption[], value: string) => options.find(option => option.value === value)?.label ?? value
  const countriesText = (values: readonly string[]) => values.length ? values.map(value => label(countries, value)).join(', ') : copy.notSpecified
  return <section className="afpc-public-offering-directory" aria-labelledby={showHeading ? `${id}-title` : undefined} aria-label={showHeading ? undefined : copy.title} aria-busy={busy}>
    {showHeading ? <h2 className="text-xl font-bold" id={`${id}-title`}>{copy.title}</h2> : null}
    <p className="mt-2 text-foreground-muted">{copy.description}</p>
    <label className="afpc-offering-search" htmlFor={`${id}-query`}>{copy.query}<input id={`${id}-query`} className="app-input" maxLength={200} type="search" value={query.query ?? ''} onChange={event => onQueryChange({...query, query: event.target.value})}/></label>
    <div className="afpc-offering-filters">
      <label className="grid gap-1 font-semibold" htmlFor={`${id}-sector`}>{copy.sector}<select id={`${id}-sector`} className="app-input" value={query.sector ?? ''} onChange={event => onQueryChange({...query, sector: event.target.value})}>
        <option value="">{copy.allSectors}</option>{sectors.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
      <label className="grid gap-1 font-semibold" htmlFor={`${id}-category`}>{copy.category}<select id={`${id}-category`} className="app-input" value={query.category ?? ''} onChange={event => onQueryChange({...query, category: event.target.value})}>
        <option value="">{copy.allCategories}</option>{categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
      <label className="grid gap-1 font-semibold" htmlFor={`${id}-country`}>{copy.country}<select id={`${id}-country`} className="app-input" value={query.country ?? ''} onChange={event => onQueryChange({...query, country: event.target.value, region: ''})}>
        <option value="">{copy.allCountries}</option>{countries.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
      <label className="grid gap-1 font-semibold" htmlFor={`${id}-region`}>{copy.region}<select id={`${id}-region`} className="app-input" disabled={!query.country} value={query.region ?? ''} onChange={event => onQueryChange({...query, region: event.target.value})}>
        <option value="">{copy.allRegions}</option>{regions.filter(option => option.country === query.country).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
    </div>
    <div className="afpc-offering-toolbar">
      {!busy ? <p role="status">{copy.results}: {results.length}</p> : null}
      <div className="afpc-offering-switch">{(['grid','list'] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => onViewChange(mode)}>{copy[mode]}</button>)}</div>
    </div>
    {!busy && !results.length ? <p className="mt-4">{copy.empty}</p> : null}
    <div className="afpc-offering-results mt-4 grid gap-4" data-view={view}>
      {results.map(item => <article key={item.id} className="afpc-offering-card">
        <OfferingGallery item={item} imageLabel={billingCopy?.image ?? 'Image'}/>
        <div className="afpc-offering-body">
        <div className="afpc-offering-brand">
          {item.images?.length && safeUrl(item.brand?.logoUrl) ? <img src={safeUrl(item.brand?.logoUrl)} alt="" loading="lazy" referrerPolicy="no-referrer"/> : null}
          <span>{item.brand?.name ?? item.publisher.name}</span><span>{label(categories, item.category)}</span>
        </div>
        <h3 className="mt-1 text-xl font-bold">{item.name}</h3>
        <p className="mt-2">{item.description}</p>
        {item.demo ? <p className="mt-2 text-sm font-semibold">{copy.demo}</p> : null}
        <ul className="afpc-offering-territories" aria-label={copy.availableIn}>{[...new Set(item.offers.flatMap(offer => offer.eligibleRegions.map(area => area.country)))].map(country => <li key={country}>{label(countries, country)}</li>)}</ul>
        <details className="afpc-offering-details" aria-label={copy.details}>
          <summary className="cursor-pointer font-semibold">{copy.details}</summary>
          <div className="afpc-offering-sellers">
            <p>{copy.publisher}: {item.publisher.name}</p>
            {item.manufacturer ? <p>{copy.manufacturer ?? 'Manufactured by'}: {item.manufacturer.name}</p> : null}
            {item.offers.map(offer => <section key={offer.id} aria-label={`${copy.seller}: ${offer.seller.name}`}>
            <h4 className="font-semibold">{offer.seller.name}</h4>
            <dl className="mt-2 text-sm">
              <dt className="font-semibold">{copy.availableIn}</dt><dd>{offer.eligibleRegions.map(area => area.regions.length ? `${label(countries, area.country)} (${area.regions.map(region => label(regions, region)).join(', ')})` : label(countries, area.country)).join('; ')}</dd>
              <dt className="mt-2 font-semibold">{copy.delivery}</dt><dd>{countriesText(offer.deliveryCountries)}</dd>
              <dt className="mt-2 font-semibold">{copy.operation}</dt><dd>{countriesText(offer.operationCountries)}</dd>
              <dt className="mt-2 font-semibold">{copy.support}</dt><dd>{countriesText(offer.supportCountries)}</dd>
            </dl>
            {offer.plans?.length ? <OfferingPlans plans={offer.plans} copy={billingCopy}/> : null}
            {safeUrl(offer.url) ? <a className="app-secondary-action mt-3" href={safeUrl(offer.url)} target="_blank" rel="noopener noreferrer">{copy.website}: {offer.seller.name}</a> : null}
          </section>)}</div>
        </details>
        {safeUrl(item.url) && !item.offers.some(offer => offer.url === item.url) ? <a href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer">{copy.website}</a> : null}
        </div>
      </article>)}
    </div>
  </section>
}

function OfferingGallery({item, imageLabel}: {item: PublicOffering; imageLabel: string}) {
  const [selected, setSelected] = useState<string>()
  const [failed, setFailed] = useState<readonly string[]>([])
  const photos = (item.images ?? []).filter(image => safeUrl(image) && !failed.includes(image))
  const logo = safeUrl(item.brand?.logoUrl)
  const image = (selected && photos.includes(selected) ? selected : photos[0]) ?? (logo && !failed.includes(logo) ? logo : undefined)
  if (!image) return null
  return <div className="afpc-offering-media" data-logo={!photos.length}>
    <img src={image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(current => [...current, image])}/>
    {photos.length > 1 ? <div className="afpc-offering-thumbs">{photos.map((photo, index) => <button key={photo} type="button" aria-label={`${imageLabel} ${index + 1}`} aria-pressed={photo === image} onClick={() => setSelected(photo)}>
      <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer"/>
    </button>)}</div> : null}
  </div>
}

function OfferingPlans({plans, copy}: {plans: NonNullable<PublicOffering['offers'][number]['plans']>; copy: PublicOfferingDirectoryProps['billingCopy']}) {
  const [period, setPeriod] = useState<'monthly'|'annually'>('monthly')
  const labels = copy ?? {monthly:'Monthly', annually:'Annual', unpublished:'Price not published'}
  return <div className="afpc-offering-pricing">
    <div className="afpc-offering-switch">{(['monthly','annually'] as const).map(value => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)}>{labels[value]}</button>)}</div>
    {plans.map((plan, index) => <div className="afpc-offering-plan" key={`${plan.name}-${index}`}>
      <h5>{plan.name}</h5>
      <strong>{plan[period] === undefined ? labels.unpublished : new Intl.NumberFormat(undefined, {style:'currency',currency:plan.currency, maximumFractionDigits:4}).format(Number(plan[period]))}</strong>
      {plan.description ? <p>{plan.description}</p> : null}
      {plan.features.length ? <ul>{plan.features.map((feature, i) => <li key={`${i}-${feature}`}>{feature}</li>)}</ul> : null}
    </div>)}
  </div>
}
