import { useCallback } from 'react'
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate'

import { Customer } from 'types'
import { useApi } from 'api'
import { GroupBase } from 'react-select'

interface Props {
  value: Customer | null
  onChange: (Customer: Customer | null) => void
  size?: 'sm' | 'md'
}

const defaultAdditional = { page: 1 }

const getCustomerLabel = (customer: Customer) => {
  return `${customer.first_name} ${customer.last_name}`
}

const CustomerAutocomplete = ({ value, onChange, size = 'md' }: Props) => {
  const api = useApi()

  const loadOptions: LoadOptions<
    Customer,
    GroupBase<Customer>,
    { page: number }
  > = useCallback(
    async (search, loadedOptions, additional) => {
      const page = additional?.page ?? 1

      const { data } = await api.getSearchCustomers({
        query: search,
        per_page: 10,
        page,
      })

      return {
        options: data.customers,
        hasMore: data.pagination.page < data.pagination.total_pages,
        additional: {
          page: page + 1,
        },
      }
    },
    [api]
  )

  const smallStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '28px',
      height: '28px',
      fontSize: '12px',
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 6px',
      height: '28px',
    }),
    input: (base: any) => ({
      ...base,
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: '28px',
    }),
    option: (base: any) => ({
      ...base,
      fontSize: '12px',
      padding: '6px 10px',
    }),
    placeholder: (base: any) => ({
      ...base,
      fontSize: '12px',
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: '12px',
    }),
  }

  return (
    <AsyncPaginate
      placeholder={size === 'sm' ? 'Filter...' : 'Search a customer'}
      getOptionLabel={getCustomerLabel}
      additional={defaultAdditional}
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      isClearable
      styles={size === 'sm' ? smallStyles : undefined}
    />
  )
}

export default CustomerAutocomplete
