"use client";
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { IoCameraOutline, IoCloudDownloadOutline } from 'react-icons/io5';
import Link from 'next/link';
import { IoClose } from 'react-icons/io5'; // Çarpı ikonu için
import { useDropzone } from 'react-dropzone'; // react-dropzone importu
import { toast } from 'react-toastify'; // Toast mesajı için

const LeftMenu = () => {
  const { data: session, update } = useSession();
  const image = session?.user.profilePictureUrl || '/images/login/Sample_User_Icon.png';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(image);

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('Lütfen bir resim seçin');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('token', session?.user.token || '');
    formData.append('userId', session?.user.id || '');
    formData.append('fileName', selectedImage.name);
    formData.append('type', "1");
  
    try {
      const response = await fetch(`${baseURL}/api/user/updateProfileImage`, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Backend Error:', data);
        toast.error(data.Error || data.message || 'İşlem başarısız oldu');
        return;
      }
  
      toast.success('Profil resminiz güncellendi!');
      update({
        user: {
          ...session?.user,
          profilePictureUrl: data.imageUrl, // API'den dönen doğru URL'yi kullanın
        },
      });
      
    } catch (error) {
      console.error('Network Error:', error);
      toast.error('Sunucuyla bağlantı kurulamadı');
    }
  };

  const handleDeleteImage = () => {
    setPreview('/images/login/Sample_User_Icon.png');
    setIsModalOpen(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  })

  return (
    <div>
      <div className='bg-gray-50 rounded-lg p-4 text-center'>
        <div className='image-container flex items-center justify-center'>
          <div className='rounded-full relative h-20 w-20 bg-white flex items-center justify-center'>
            <Image
              src={preview || '/images/login/Sample_User_Icon.png'}
              alt="Profil Resmi"
              width={80}
              height={80}
              className="rounded-full object-contain"
              layout="intrinsic"
            />
            <button
              className='bg-white z-10 shadow-lg rounded-full flex items-center w-9 h-9 justify-center absolute -bottom-3 -right-3 p-1'
              onClick={() => setIsModalOpen(true)}
            >
              <IoCameraOutline size={32} />
            </button>
          </div>
        </div>
        <div className='mt-8'>
          <h3 className='text-xl font-semibold'>{session?.user.name}</h3>
        </div>
        <div className='mt-8 menu-contianer text-left'>
          <ul>
            <li className='pb-4 pt-4 tracking-wide font-semibold border-b border-b-background'>
              <Link href="/">Kullanıcı Bilgilerim</Link>
            </li>
            <li className='pb-4 pt-4 tracking-wide'><Link href="/siparislerim">Siparişlerim</Link></li>
            <li className='pb-4 pt-4 tracking-wide'><Link href="/odeme-bilgilerim">Ödeme Bilgilerim</Link></li>
            <li className='pb-4 pt-4 tracking-wide'>
              <button onClick={() => signOut()}>Çıkış</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-md relative">
            {/* Çarpı İkonu ile Kapatma */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full border "
            >
              <IoClose size={24} />
            </button>

            {/* Dropzone alanı */}
            <div
              {...getRootProps()}
              className="mb-4 text-center border-2 flex items-center justify-center border-dashed min-h-[200px] p-4 rounded-md cursor-pointer"
            >
              <input {...getInputProps()} />
              {preview === '/images/login/Sample_User_Icon.png' ? (
                <div className="text-gray-500 grid justify-center items-center">
                  <p>Buraya tıklayarak resminizi yükleyin veya sürükleyin.</p>
                  <div className='flex items-center justify-center'>
                    <IoCloudDownloadOutline className='mt-3' size={32} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Image
                    src={preview || '/images/login/Sample_User_Icon.png'}
                    alt="Yeni Profil Resmi"
                    width={80}
                    height={80}
                    layout="intrinsic"
                    className="rounded-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex justify-between space-x-4">
              {preview === '/images/login/Sample_User_Icon.png' ? (
                <button
                  onClick={handleUpload}
                  className="general-btn"
                >
                  Yükle
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDeleteImage}
                    className="general-delete-btn"
                  >
                    Sil
                  </button>
                  <button
                    onClick={handleUpload}
                    className="general-btn"
                  >
                    Güncelle
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftMenu;
