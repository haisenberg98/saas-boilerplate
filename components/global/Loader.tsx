'use client';

import { ThreeCircles } from 'react-loader-spinner';

function Loader({ className = '' }) {
  return (
    <>
      <ThreeCircles
        height='100'
        width='100'
        color='#42413D'
        wrapperStyle={{}}
        wrapperClass={className}
        visible={true}
        ariaLabel='three-circles-rotating'
        outerCircleColor=''
        innerCircleColor=''
        middleCircleColor=''
      />
    </>
  );
}

export default Loader;
