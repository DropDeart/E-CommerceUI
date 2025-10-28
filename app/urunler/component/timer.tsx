import React from 'react'
import Countdown from 'react-countdown';

interface TimerProps {
  endDate?: Date | string;
}

const timer = ({endDate}: TimerProps) => {
  console.log(endDate);
 const date = endDate ? new Date(endDate) : undefined;
 return (
    <div>
      <div className='text-lg mb-3'>Teklif geçerlilik süresi:</div>
        <Countdown className={ endDate && new Date(endDate).getTime() >= Date.now() ? "block" : "hidden"}
            date={date ?? new Date()}
            renderer={({ days, hours, minutes, seconds }) => (
            <div className='flex items-center gap-4'>
              <div className='countdown-container'>
                <div className='countdown-item'>
                  <span className='flex justify-center align-items-center text-[34px] font-semibold'>{days}</span>
                </div>
                <div className='mt-2 text-center text-gray-500'>Gün</div>
              </div>
              <div className='countdown-container'>
                <div className='countdown-item'>
                  <span className='flex justify-center align-items-center text-[34px] font-semibold'>{hours}</span>
                </div>
                <div className='mt-2 text-center text-gray-500'>Saat</div>
              </div>
              <div className='countdown-container'>
                <div className='countdown-item'>
                  <span className='flex justify-center align-items-center text-[34px] font-semibold'>{minutes}</span>
                </div>
                <div className='mt-2 text-center text-gray-500'>Dakika</div>
              </div>
              <div className='countdown-container'>
                <div className='countdown-item'>
                  <span className='flex justify-center align-items-center text-[34px] font-semibold'>{seconds}</span>
                </div>
                <div className='mt-2 text-center text-gray-500'>Saniye</div>
              </div>
              

            </div>
          )}
        />
    </div>
  )
}

export default timer