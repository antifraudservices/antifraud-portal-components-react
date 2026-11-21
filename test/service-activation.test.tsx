// Flow contract: a controller can select several services, accept each current agreement, and confirm only the quoted options; payment progress comes from the portal.
import {fireEvent, render, screen} from '@testing-library/react'
import {expect, it, vi} from 'vitest'
import {ServiceActivation, type ServiceActivationItem} from '../src/service-activation.js'

const terms = {version: '1', href: '/terms/service/1'}
const common = {terms, status: 'available'} as const
const free = {...common, id: 'first', name: 'Data service'}
const paid = {
  ...common, id: 'second', name: 'Analytics',
  payment: {
    defaultQuantity: 2, maximumQuantity: 5, quantityLabel: 'Licences',
    methods: [{id: 'card', label: 'Card'}, {id: 'transfer', label: 'Bank transfer', description: 'Payment is due within 30 days.'}],
    quote: {id: 'quote-2', quantity: 2, methodId: 'card', formattedTotal: '€20.00'},
  },
} satisfies ServiceActivationItem
const copy = {
  select: 'Activate this service', termsLink: 'Read terms', acceptTerms: 'Accept terms',
  confirm: 'Confirm', paymentMethod: 'Payment method', total: 'Total', quotePending: 'Updating price',
  invoice: 'View invoice', checkout: 'Continue to payment', paymentDue: 'Payment due',
  graceEnds: 'Grace period ends', awaitingPayment: 'Awaiting payment', active: 'Active',
  suspended: 'Suspended', failed: 'Activation failed', retry: 'Retry activation',
}
function open(name: string) { fireEvent.click(screen.getByText(name)) }
function selectAll(label: string) { screen.getAllByRole('checkbox', {name: label}).forEach(element => fireEvent.click(element)) }

it('requires independent current terms and a matching quote for every selected service', () => {
  const onConfirm = vi.fn()
  const onQuote = vi.fn()
  const props = {copy, onConfirm, onQuote}
  const {rerender} = render(<ServiceActivation {...props} services={[free, paid]} />)
  expect(screen.getByText(free.name).closest('details')).not.toHaveAttribute('open')
  expect(screen.getByText(paid.name).closest('details')).not.toHaveAttribute('open')
  open(free.name)
  open(paid.name)
  selectAll(copy.select)
  fireEvent.click(screen.getAllByRole('checkbox', {name: copy.acceptTerms})[0]!)
  expect(screen.getByRole('button', {name: copy.confirm})).toBeDisabled()
  fireEvent.click(screen.getAllByRole('checkbox', {name: copy.acceptTerms})[1]!)
  expect(screen.getByText('€20.00')).toBeVisible()
  fireEvent.change(screen.getByRole('spinbutton', {name: 'Licences'}), {target: {value: '3'}})
  fireEvent.change(screen.getByRole('combobox', {name: copy.paymentMethod}), {target: {value: 'transfer'}})
  expect(onQuote).toHaveBeenLastCalledWith({serviceId: 'second', quantity: 3, methodId: 'transfer'})
  expect(screen.getByText(copy.quotePending)).toBeVisible()
  expect(screen.getByText('Payment is due within 30 days.')).toBeVisible()
  expect(screen.getByRole('button', {name: copy.confirm})).toBeDisabled()
  rerender(<ServiceActivation {...props} services={[{...free, terms: {...terms, version: '2'}},
    {...paid, payment: {...paid.payment, quote: {id: 'quote-3', quantity: 3, methodId: 'transfer', formattedTotal: '€30.00'}}},
  ]} />)
  expect(screen.getByText('€30.00')).toBeVisible()
  expect(screen.getByRole('button', {name: copy.confirm})).toBeDisabled()
  fireEvent.click(screen.getAllByRole('checkbox', {name: copy.acceptTerms})[0]!)
  fireEvent.click(screen.getByRole('button', {name: copy.confirm}))
  expect(onConfirm).toHaveBeenCalledExactlyOnceWith([
    {serviceId: 'first', termsVersion: '2'},
    {serviceId: 'second', termsVersion: '1', quoteId: 'quote-3'},
  ])
})

it('shows server-confirmed payment and service progress independently', () => {
  const onRetry = vi.fn()
  const {rerender} = render(<ServiceActivation copy={copy} onConfirm={vi.fn()} onRetry={onRetry} services={[
    {...free, status: 'failed', activationId: 'activation-1'},
    {...paid, status: 'awaiting-payment', invoice: {href: '/invoices/2', due: '2026-12-20'}, checkoutHref: '/checkout/2'},
  ]} />)
  open(free.name)
  open(paid.name)
  fireEvent.click(screen.getByRole('button', {name: copy.retry}))
  expect(onRetry).toHaveBeenCalledExactlyOnceWith('activation-1')
  expect(screen.getByRole('link', {name: copy.invoice})).toHaveAttribute('href', '/invoices/2')
  expect(screen.getByRole('link', {name: copy.checkout})).toHaveAttribute('href', '/checkout/2')
  expect(screen.queryByText(/Grace period ends/)).not.toBeInTheDocument()
  rerender(<ServiceActivation copy={copy} onConfirm={vi.fn()} services={[{...paid, status: 'active'}]} />)
  expect(screen.getByText(copy.active)).toBeVisible()
  expect(screen.queryByRole('link', {name: copy.checkout})).not.toBeInTheDocument()
  rerender(<ServiceActivation copy={copy} onConfirm={vi.fn()} services={[
    {...paid, status: 'active', invoice: {href: '/invoices/2', due: '2026-12-20', graceEnds: '2026-12-20'}},
  ]} />)
  expect(screen.getByText(copy.active)).toBeVisible()
  expect(screen.getByText('Grace period ends 2026-12-20')).toBeVisible()
  rerender(<ServiceActivation copy={copy} onConfirm={vi.fn()} services={[{...paid, status: 'suspended'}]} />)
  expect(screen.getByText(copy.suspended)).toBeVisible()
  expect(screen.queryByRole('link', {name: copy.checkout})).not.toBeInTheDocument()
})
