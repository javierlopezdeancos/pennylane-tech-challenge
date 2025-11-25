import React from 'react'
import { Image } from 'react-bootstrap'

interface LogoProps {
  src?: string
  width?: number | string
  height?: number | string
  alt?: string
}

const Logo: React.FC<LogoProps> = ({
  // default to the downloaded PNG in public/
  // place a `pennylane-logo.svg` or `pennylane-logo.png` in `public/` to override
  src = '/pennylane-logo.png',
  width = 140,
  height = 'auto',
  alt = 'Pennylane',
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      rounded={false}
      fluid
    />
  )
}

export default Logo
