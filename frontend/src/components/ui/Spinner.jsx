import React from 'react'

const Spinner = ({ size = 32, color = '#4b5563', thickness = 3 }) => {
  const style = {
    width: size,
    height: size,
    border: `${thickness}px solid rgba(0,0,0,0.08)`,
    borderTop: `${thickness}px solid ${color}`,
    borderRadius: '50%',
    animation: 'vm_spin 0.9s linear infinite',
  }
  return (
    <>
      <style>{'@keyframes vm_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'}</style>
      <div style={style} />
    </>
  )
}

export default Spinner


