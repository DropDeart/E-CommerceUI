/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from "react"; // useCallback'i de import edin
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { ExistingProductImage } from "@/app/models/Product"; // *** YENİ IMPORT ***

interface DropzoneFieldProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  formikRetainedUrls: string[];
  // existingPreviews prop'u artık direkt kullanılmadığı için kaldırıldı veya isteğe bağlı yapıldı.
  // formikExistingImagesDetails ve formikDeletedImageIds artık NewProductForm'dan gelen güncel durum.
  formikExistingImagesDetails: ExistingProductImage[]; // *** YENİ PROP ***
  formikDeletedImageIds: string[]; // *** YENİ PROP ***
}

interface FileWithPreview {
  file: File;
  preview: string;
}

export function DropzoneField({
  setFieldValue,
  formikRetainedUrls,
  formikExistingImagesDetails, // *** YENİ PROP'U ALIYORUZ ***
  formikDeletedImageIds,       // *** YENİ PROP'U ALIYORUZ ***
}: DropzoneFieldProps) {
  const [newFilesWithPreviews, setNewFilesWithPreviews] = useState<FileWithPreview[]>([]);

  // useEffect içinde setFieldValue kullanacağımız için useCallback ile sarmalamak daha iyi.
  const updateFormikFields = useCallback(() => {
    setFieldValue("imageFiles", newFilesWithPreviews.map(f => f.file), false);
    // retainedImageUrls ve deletedImageIds'ı burada direkt set etmiyoruz,
    // çünkü handleRemoveImage içinde zaten ilgili setFieldValue çağrıları var.
    // Sadece yeni dosyaları güncelliyoruz.
  }, [newFilesWithPreviews, setFieldValue]);

  useEffect(() => {
    updateFormikFields();

    return () => {
      newFilesWithPreviews.forEach((fwp) => URL.revokeObjectURL(fwp.preview));
    };
  }, [newFilesWithPreviews, updateFormikFields]); // Bağımlılık olarak updateFormikFields eklendi


  const allDisplayUrls = [
    ...formikRetainedUrls,
    ...newFilesWithPreviews.map((fwp) => fwp.preview),
  ];

  const onDrop = (acceptedFiles: File[]) => {
    const currentCount = formikRetainedUrls.length + newFilesWithPreviews.length;
    if (currentCount + acceptedFiles.length > 5) {
      toast.error("Maksimum 5 resim yükleyebilirsiniz.");
      return;
    }

    const newWithPreviews: FileWithPreview[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewFilesWithPreviews((prev) => [...prev, ...newWithPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    const targetUrl = allDisplayUrls[index];
    const isBlob = targetUrl.startsWith("blob:");

    if (isBlob) {
      // Yeni yüklenmiş bir dosyayı siliyoruz
      setNewFilesWithPreviews((prev) => {
        const filtered = prev.filter((fwp) => fwp.preview !== targetUrl);
        URL.revokeObjectURL(targetUrl);
        return filtered;
      });
    } else {
      // *** Mevcut (backend'den gelen) bir resmi siliyoruz ***
      // 1. formikRetainedUrls listesinden kaldır: Bu, backend'e bu URL'in artık tutulmaması gerektiğini bildirecek.
      const updatedRetainedUrls = formikRetainedUrls.filter((url) => url !== targetUrl);
      setFieldValue("retainedImageUrls", updatedRetainedUrls, false);

      // 2. Silinen resmin ID'sini bul ve Formik'teki 'deletedImageIds' listesine ekle:
      // formikExistingImagesDetails prop'unu kullanarak, URL'den ID'yi buluyoruz.
      const deletedImage = formikExistingImagesDetails.find(img => img.fileUrl === targetUrl);

      if (deletedImage) {
        // Formik'teki 'deletedImageIds' alanını güncelliyoruz.
        // Mevcut listeye yeni silinen resmin ID'sini ekliyoruz.
        // formikDeletedImageIds prop'u sayesinde güncel deletedImageIds değerine sahibiz.
        setFieldValue("deletedImageIds", [...formikDeletedImageIds, deletedImage.id], false);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 2 * 1024 * 1024,
    onDrop,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ errors }) => {
        errors.forEach((err) => {
          if (err.code === "file-too-large") {
            toast.error("Resim çok büyük. Maksimum 2MB.");
          } else if (err.code === "file-invalid-type") {
            toast.error("Geçersiz dosya tipi.");
          } else {
            toast.error(`Hata: ${err.message}`);
          }
        });
      });
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-blue-400 transition-all text-center"
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-500">Görselleri buraya bırakın veya tıklayın</p>
      </div>

      {allDisplayUrls.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {allDisplayUrls.map((url, index) => (
            <div
              key={url}
              className="relative w-32 h-32 rounded overflow-hidden border border-gray-300"
            >
              <img
                src={url}
                alt={`preview-${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}