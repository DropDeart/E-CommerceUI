// LeftMenu.tsx
"use client";
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { IoCameraOutline, IoCloudDownloadOutline } from 'react-icons/io5';
import Link from 'next/link';
import { IoClose } from 'react-icons/io5';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

const LeftMenu = () => {
  // useSession'dan hem data (session) hem de status'u alıyoruz.
  const { data: session, status, update } = useSession();

  // Preview state'i başlangıçta null olacak.
  // Bu, sunucuda ve client'ta ilk renderda her zaman aynı başlangıç değerine sahip olmasını sağlar.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // Başlangıçta null

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  // Session yüklendiğinde veya profil resmi değiştiğinde preview'i güncelle
  useEffect(() => {
    // Sadece session yüklenmiş ve profil resmi mevcutsa preview'i ayarla
    if (status === "authenticated" && session?.user?.profilePictureUrl) {
      setPreview(session.user.profilePictureUrl);
    } else if (status === "unauthenticated" || status === "loading") {
      // Oturum yoksa veya hala yükleniyorsa varsayılan resmi göster
      setPreview('/images/login/Sample_User_Icon.png');
    }
  }, [session?.user?.profilePictureUrl, status]); // status ve profilePictureUrl bağımlılıkları

  const handleUpload = async () => {
    console.log("Current session object:", session);
    console.log("Access Token from session:", session?.accessToken);

    if (!selectedImage) {
      toast.error('Lütfen bir resim seçin');
      return;
    }

    if (status !== "authenticated" || !session?.accessToken) {
      toast.error('Oturum bilgileri eksik veya doğrulanmamış. Lütfen tekrar giriş yapın.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('fileName', selectedImage.name);
    formData.append('type', "1");
  
    try {
      const response = await fetch(`${baseURL}/api/user/updateProfileImage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken || ''}`},
        body: formData,
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Backend Error:', data);
        toast.error(data.Error || data.message || 'İşlem başarısız oldu');
        return;
      }

      toast.success('Profil resminiz güncellendi!');
      await update({
        user: {
          ...session.user,
          profilePictureUrl: data.imageUrl, 
        },
      });
      
      setIsModalOpen(false);
      setSelectedImage(null);
      
    } catch (error) {
      console.error('Network Error:', error);
      toast.error('Sunucuyla bağlantı kurulamadı');
    }
  };

  const handleDeleteImage = async () => {
    // Burada backend'e bir "profil resmini sil" isteği göndermelisiniz.
    // Şimdilik sadece UI'ı güncelliyoruz.
    setPreview('/images/login/Sample_User_Icon.png');
    setSelectedImage(null);
    setIsModalOpen(false);
    toast.info('Profil resmi kaldırıldı.');
    
    // Session'daki profil resmini de sıfırlayalım
    await update({
        user: {
            ...session?.user,
            profilePictureUrl: '/images/login/Sample_User_Icon.png',
        }
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === "file-too-large") {
            toast.error(`Resim çok büyük. Max 2MB.`);
          } else if (err.code === "file-invalid-type") {
            toast.error(`Geçersiz dosya tipi. Sadece JPG, PNG veya GIF kabul edilir.`);
          } else {
            toast.error(`Hata: ${err.message}`);
          }
        });
      });
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  // Oturum yüklenirken veya oturum yokken loading/varsayılan gösterim
  if (status === "loading") {
    return (
      <div className='bg-gray-50 rounded-lg p-4 text-center'>
        <div className='flex items-center justify-center h-20 w-20 mx-auto rounded-full bg-white'>
          <IoCloudDownloadOutline className='animate-pulse text-gray-400' size={40} />
        </div>
        <p className='mt-4 text-gray-600'>Yükleniyor...</p>
      </div>
    );
  }

  // Session yüklendikten sonra normal içeriği render et
  return (
    <div>
      <div className='bg-gray-50 rounded-lg p-4 text-center'>
        <div className='image-container flex items-center justify-center'>
          <div className='rounded-full relative h-20 w-20 bg-white flex items-center justify-center'>
            {/* preview null olduğunda veya session yüklenmediğinde varsayılan resmi göster */}
            <Image
              src={preview || '/images/login/Sample_User_Icon.png'} 
              alt="Profil Resmi"
              width={80}
              height={80}
              className="rounded-full object-cover"
              priority
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
          <h3 className='text-xl font-semibold'>{session?.user?.name || 'Misafir'}</h3>
        </div>
        <div className='mt-8 menu-contianer text-left'>
          <ul>
            <li className='pb-4 pt-4 tracking-wide font-semibold border-b border-b-background'>
              <Link href="/kullanici-bilgilerim">Kullanıcı Bilgilerim</Link>
            </li>
            <li className='pb-4 pt-4 tracking-wide'><Link href="/adreslerim">Adreslerim</Link></li>
            <li className='pb-4 pt-4 tracking-wide'><Link href="/siparislerim">Siparişlerim</Link></li>
            <li className='pb-4 pt-4 tracking-wide'><Link href="/favorilerim">Favorilerim</Link></li>
            <li className='pb-4 pt-4 tracking-wide'>
              <button onClick={() => signOut()} className="w-full text-left">Çıkış</button>
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
              onClick={() => {
                setIsModalOpen(false);
                setSelectedImage(null);
                // Modalı kapatırken preview'i oturumdaki mevcut resme veya varsayılana döndür
                setPreview(session?.user?.profilePictureUrl || '/images/login/Sample_User_Icon.png');
              }}
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
              {/* Eğer preview null değilse veya seçili resim varsa göster */}
              {preview && preview !== '/images/login/Sample_User_Icon.png' ? ( 
                <div className="flex justify-center">
                  <Image
                    src={preview}
                    alt="Yeni Profil Resmi"
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="text-gray-500 grid justify-center items-center">
                  <p>Buraya tıklayarak resminizi yükleyin veya sürükleyin.</p>
                  <div className='flex items-center justify-center'>
                    <IoCloudDownloadOutline className='mt-3' size={32} />
                  </div>
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex justify-between space-x-4">
              {selectedImage ? ( 
                <>
                  <button
                    onClick={handleDeleteImage}
                    className="general-delete-btn"
                  >
                    Resmi Kaldır
                  </button>
                  <button
                    onClick={handleUpload}
                    className="general-btn"
                  >
                    Güncelle
                  </button>
                </>
              ) : (
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="general-btn w-full bg-gray-500 hover:bg-gray-600"
                >
                    Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftMenu;