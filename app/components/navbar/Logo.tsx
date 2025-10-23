"use client"

import Link from "next/link"
import Image from "next/image"

const Logo = () => {
  return (
    <div className="text-2xl font-semibold primary-text-color">
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="Picture of the author"
          width={60}
          height={60}
        />
      </Link>
    </div>
  )
}

export default Logo