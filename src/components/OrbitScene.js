import React from 'react'

const OrbitScene = () => (
  <div className="orbit-scene" aria-hidden="true">
    <div className="orbit-halo" />
    <div className="orbit-ring orbit-ring-outer" />
    <div className="orbit-ring orbit-ring-inner" />
    <div className="orbit-sphere" />
    <span className="orbit-moon" />
    <span className="orbit-spark orbit-spark-one">✦</span>
    <span className="orbit-spark orbit-spark-two">✦</span>
    <span className="orbit-star orbit-star-one" />
    <span className="orbit-star orbit-star-two" />
    <span className="orbit-star orbit-star-three" />
  </div>
)

export default OrbitScene
