import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            {/* Left section*/}
            <div>
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam reprehenderit dignissimos dolores quis blanditiis porro illo eos possimus vitae sapiente repellendus voluptas at nulla fuga voluptate, soluta odit doloremque assumenda!</p>

            </div>

            {/*center  section*/}
            <div>
                <p className='text-xl font-medium mb-5'>Company</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact US</li>
                    <li>Privacy policy</li>
                </ul>

            </div>
            {/*Right section */}
            <div>
                <p className='text-xl font-medium mb-5'>Gett In Touch </p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>221-435-6567</li>
                    <li>KOC@gmail.com</li>
                </ul>
            </div>
        </div>
        {/*----------------Copyright Text-------------*/}
        <div>
            <hr />
            <p className='py-5 text-sm text-center'>&copy; 2021 KOC. All rights reserved</p>

        </div>
    </div>
  )
}

export default Footer
