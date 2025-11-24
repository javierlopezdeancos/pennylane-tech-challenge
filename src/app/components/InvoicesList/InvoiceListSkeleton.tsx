import React from 'react'
import classnames from 'classnames'

const Shimmer = () => (
  <style>
    {`
  .shimmer-pair {
    animation: shimmer 2.5s infinite linear;
    background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
    background-size: 1000px 100%;
  }

  .shimmer-odd {
    animation: shimmer 2.5s infinite linear;
    background: linear-gradient(to right, #e0e0e0 4%, #f0f0f0 25%, #e0e0e0 36%);
    background-size: 1000px 100%;
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  `}
  </style>
)

const InvoiceListSkeleton = ({
  rows = 10,
  columns = 9,
}: {
  rows?: number
  columns?: number
}) => {
  return (
    <>
      <Shimmer />
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex}>
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex}>
              <div
                className={classnames({
                  'shimmer-pair': (rowIndex + 1) % 2 === 0,
                  'shimmer-odd': (rowIndex + 1) % 2 !== 0,
                })}
                style={{
                  height: '20px',
                  borderRadius: '4px',
                  opacity: '0.7',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default InvoiceListSkeleton
