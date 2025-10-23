'use client';

import React from 'react'
import { useRouter } from 'next/router'

const ProductDetailPage = () => {
  const router = useRouter();
  const { slug, id } = router.query;

  if (!slug || !id) {
    return <div>Yükleniyor...</div>;
  }
  return (
    <div>
      <h1>Ürün Detay Sayfası</h1>
      <p>Slug: {slug}</p>
      <p>ID: {id}</p>
    </div>
  );
};

export default ProductDetailPage;