/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CurrencyInput from "react-currency-input-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreateProduct } from "@/app/models/Product";
import { Category } from "@/app/models/Category";
import { ComboBox } from "./components/combobox";
import { DropzoneField } from "./components/dropzone";
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react" 
import { Calendar } from "@/components/ui/calendar"
import { tr } from 'date-fns/locale';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Formik'in internal değerleri için güncellenmiş interface
interface MyFormValues extends CreateProduct {
  retainedImageUrls: string[]; // Formik'in kendi içinde tutacağı, mevcut URL'ler
  id?: string; // Update senaryosu için
  // deletedImageIds artık CreateProduct içinde olduğu için burada tekrar tanımlamaya gerek yok
}

interface NewProductFormProps {
  // onSubmit prop'unu FormData alacak şekilde güncellemek en sağlıklısıdır.
  // Çünkü resimler ve JSON verisi aynı anda gönderilecek.
  // Bu değişiklik size bağlı, şimdilik CreateProduct olarak kalacak ama yorum satırlarında öneri var.
  onSubmit: (values: CreateProduct & { id?: string }) => void;
  categories: Category[];
  initialValues?: Partial<CreateProduct & { id?: string }>;
}

export function NewProductForm({ categories, onSubmit, initialValues }: NewProductFormProps) {
  const defaultValues = useMemo(() => {
    return {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      imageFiles: [],
      retainedImageUrls: [],
      deletedImageIds: [], 
      taxRate:0,      
      discountRate: 0,
      discountStart: null as Date | null,
      discountEnd: null as Date | null
    };
  }, []);

  const memoizedInitialExistingImageUrls = useMemo(() => {
    if (initialValues?.images?.length) {
      return initialValues.images.map(img => img.fileUrl);
    }
    return [];
  }, [initialValues]);

  const combinedInitialValues = useMemo(() => {
    const combined = { ...defaultValues, ...initialValues } as MyFormValues;

    combined.retainedImageUrls = memoizedInitialExistingImageUrls;
    combined.imageFiles = [];

    if (initialValues?.images) {
      combined.images = initialValues.images;
    }

    combined.deletedImageIds = initialValues?.deletedImageIds || [];

    return combined;
  }, [defaultValues, initialValues, memoizedInitialExistingImageUrls]);


  const validationSchema = Yup.object({
    name: Yup.string().required("Ürün adı zorunludur"),
    description: Yup.string().nullable(),
    price: Yup.number()
      .typeError("Fiyat sayı olmalıdır")
      .positive("Pozitif sayı olmalı")
      .required("Fiyat zorunludur"),
    stock: Yup.number()
      .typeError("Stok sayı olmalıdır")
      .min(0, "Stok negatif olamaz")
      .required("Stok zorunludur"),
    categoryId: Yup.string().required("Kategori seçimi zorunludur"),
    taxRate: Yup.number()
      .typeError("Vergi oranı sayı olmalıdır")
      .min(0, "Vergi oranı negatif olamaz")
      .required("Vergi oranı zorunludur"),
    imageFiles: Yup.array()
      .of(
        Yup.mixed()
          .test("fileSize", "Dosya boyutu max 2MB olmalı", (file: any) => {
            return file ? file.size <= 2 * 1024 * 1024 : true;
          })
          .test("fileFormat", "Geçersiz dosya tipi. JPG, PNG veya GIF olmalı", (file: any) => {
            return file ? ["image/jpeg", "image/png", "image/gif"].includes(file.type) : true;
          })
      ),
    retainedImageUrls: Yup.array().of(Yup.string()),
    deletedImageIds: Yup.array().of(Yup.string()),
    discountStart: Yup.date().nullable(),
    discountEnd: Yup
      .date()
      .nullable()
      .min(Yup.ref("discountStart"), "Bitiş tarihi, başlangıçtan sonra olmalı")
  })
  .test(
    "totalImagesCount",
    "En az 1, en fazla 5 resim yükleyin",
    function (values) {
      const newFilesCount = (values.imageFiles?.length || 0);
      const retainedUrlsCount = (values.retainedImageUrls?.length || 0);
      const totalImages = newFilesCount + retainedUrlsCount;

      if (totalImages > 5) {
        return this.createError({
          path: "imageFiles",
          message: "En fazla 5 resim yüklenebilir",
        });
      }
      return true;
    }
  );


  return (
    <Formik
      enableReinitialize
      initialValues={combinedInitialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        // Backend'e göndermek için FormData objesi oluşturma
        const formData = new FormData();

        // Ürün ID'si varsa (düzenleme modunda) ekle
        if (values.id) {
          formData.append('id', values.id);
        }

        // Yeni yüklenen dosyalar (File objeleri)
        values.imageFiles.forEach((file) => {
          formData.append('newImages', file); // Backend'de 'newImages' olarak karşılayın
        });

        // Tutulması gereken mevcut resim URL'leri
        formData.append('retainedUrls', JSON.stringify(values.retainedImageUrls)); // Backend'de JSON parse edin

        // *** SİLİNEN RESİM ID'LERİ ***
        if (values.deletedImageIds && values.deletedImageIds.length > 0) {
            formData.append('deletedImageIds', JSON.stringify(values.deletedImageIds)); // Backend'de JSON parse edin
        }

        if(values.discountRate)
        {
          formData.append('discountRate', JSON.stringify(values.discountRate))
        }

        if (values.discountStart && values.discountStart.getTime() > Date.now()) {
          formData.append('discountStart', values.discountStart.toISOString());
        }

        if (values.discountEnd && values.discountEnd.getTime() > Date.now()) {
          formData.append('discountEnd', values.discountEnd.toISOString());
        }

        // Diğer form alanları
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('price', values.price.toString());
        formData.append('stock', values.stock.toString());
        formData.append('categoryId', values.categoryId);
        formData.append('taxRate', values.taxRate.toString());

        onSubmit({
          id: values.id,
          name: values.name,
          description: values.description,
          price: values.price,
          stock: values.stock,
          categoryId: values.categoryId,
          imageFiles: values.imageFiles, 
          deletedImageIds: values.deletedImageIds,
          taxRate:values.taxRate,   
          discountRate: values.discountRate,
          discountStart: values.discountStart,
          discountEnd: values.discountEnd      
        });

        actions.setSubmitting(false);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <Label htmlFor="name">Ürün Adı</Label>
            <Field as={Input} id="name" name="name" placeholder="Ürün adı giriniz" />
            <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows={4}
              placeholder="Açıklama giriniz"
              className="border rounded p-2 w-full"
               maxLength={200}
            />
            <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <Label htmlFor="price">Fiyat</Label>
            <Field name="price">
              {({ field, form }: any) => (
                <CurrencyInput
                  id="price"
                  name="price"
                  prefix="₺ "
                  decimalSeparator=","
                  groupSeparator="."
                  decimalsLimit={2}
                  allowNegativeValue={false}
                  className="border rounded p-2 w-full"
                  value={field.value ?? ""}
                  onValueChange={(value, name, values) => {
                    const floatValue = values?.float ?? null;
                    form.setFieldValue("price", floatValue);
                  }}
                  placeholder="Fiyat giriniz"
                />
              )}
            </Field>
            <ErrorMessage name="price" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Vergi Oranı</label>
            <Field name="taxRate">
              {({ field, form }: any) => (
                <CurrencyInput
                  id="taxRate"
                  name="taxRate"
                  prefix="% "
                  decimalSeparator=","
                  groupSeparator="."
                  decimalsLimit={2}
                  allowNegativeValue={false}
                  className="border rounded p-2 w-full"
                  value={field.value ?? ""}
                  onValueChange={(value, name, values) => {
                    const floatValue = values?.float ?? null;
                    form.setFieldValue("taxRate", floatValue);
                  }}
                  placeholder="Vergi oranını giriniz"
                />
              )}
            </Field>
            <ErrorMessage name="taxRate" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">İndirim Oranı</label>
            <Field name="discountRate">
              {({ field, form }: any) => (
                <CurrencyInput
                  id="discountRate"
                  name="discountRate"
                  prefix="% "
                  decimalSeparator=","
                  groupSeparator="."
                  decimalsLimit={2}
                  allowNegativeValue={false}
                  className="border rounded p-2 w-full"
                  value={field.value ?? ""}
                  onValueChange={(value, name, values) => {
                    const floatValue = values?.float ?? null;
                    form.setFieldValue("discountRate", floatValue);
                  }}
                  placeholder="İndirim oranını giriniz"
                />
              )}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 my-auto">
            {/* Discount Start Date */}
            <div>
              <label className="block mb-1 text-sm font-medium">İndirim Başlangıç Tarihi</label>
              <Field name="discountStart">
                {({ form, field }: any) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value  ? format(new Date(field.value), "PPP", { locale: tr })  : <span>Tarih seçin</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        locale={tr}
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => form.setFieldValue("discountStart", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </Field>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">İndirim Bitiş Tarihi</label>
              <Field name="discountEnd">
                {({ form, field }: any) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value  ? format(new Date(field.value), "PPP", { locale: tr })  : <span>Tarih seçin</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                      locale={tr}
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => form.setFieldValue("discountEnd", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </Field>
            </div>
          </div>

          <div>
            <Label htmlFor="stock">Stok</Label>
            <Field as={Input} id="stock" name="stock" type="number" placeholder="Stok adedi" />
            <ErrorMessage name="stock" component="div" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <ComboBox
              items={categories.map(cat => ({
                label: cat.name,
                value: cat.id,
              }))}
              selectedValue={values.categoryId}
              onChange={(val) => setFieldValue("categoryId", val)}
              placeholder="Kategori seçin"
            />
            <ErrorMessage name="categoryId" component="div" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <Label>Ürün Görselleri (max 5)</Label>
            <DropzoneField
              setFieldValue={setFieldValue}
              formikRetainedUrls={values.retainedImageUrls}
              formikExistingImagesDetails={values.images || []} // *** YENİ PROP'U İLETİLİYOR ***
              formikDeletedImageIds={values.deletedImageIds || []} // *** YENİ PROP'U İLETİLİYOR ***
            />
            <ErrorMessage name="imageFiles" component="div" className="text-red-500 text-xs mt-1" />
            <ErrorMessage name="retainedImageUrls" component="div" className="text-red-500 text-xs mt-1" />
            {/* deletedImageIds için de hata mesajı göstermek isterseniz ekleyebilirsiniz */}
            <ErrorMessage name="deletedImageIds" component="div" className="text-red-500 text-xs mt-1" />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            Kaydet
          </Button>
        </Form>
      )}
    </Formik>
  );
}