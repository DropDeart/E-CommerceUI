
"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category, NewCategory } from "@/app/models/Category"; // Kendi model dosyanızdan import
import { toast } from "react-toastify";
import { getSession } from 'next-auth/react';

// ====================================================================
// Arayüz Tanımları (Interfaces)
// ====================================================================

interface NewCategoryFormProps {
  onSubmit: (p: NewCategory) => void;
}

interface FormikUpdateCategoryProps {
  category: Category | null;
  onClose: () => void;
  onUpdated?: (updated: Category) => void;
}

interface ConfirmDeleteDialogProps {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  categoryName: string
}

// ====================================================================
// Bileşen 1: Yeni Kategori Ekleme Formu
// ====================================================================

export function NewCategoryForm({ onSubmit }: NewCategoryFormProps) {
  const initialValues = {
    name: "",
    description: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Kategori adı zorunludur"),
    description: Yup.string().nullable(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        onSubmit({
          name: values.name,
          description: values.description,
        });
        actions.resetForm();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <Label htmlFor="name">Kategori Adı</Label>
            <Field
              as={Input}
              name="name"
              id="name"
              placeholder="Örn: Elektronik"
            />
            <ErrorMessage
              name="name"
              component="div"
              className="text-red-500 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="description">Kategori Açıklaması</Label>
            <Field
              as="textarea"
              name="description"
              rows={4}
              placeholder="Açıklama giriniz..."
              className="border rounded p-2 w-full"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-xs"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            Kaydet
          </Button>
        </Form>
      )}
    </Formik>
  );
}

// ====================================================================
// Bileşen 2: Kategori Güncelleme Formu
// ====================================================================

export function FormikUpdateCategory({
  category,
  onClose,
  onUpdated,
}: FormikUpdateCategoryProps) {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!category) return null;

  const initialValues = {
    name: category.name,
    description: category.description || "",
    id: category.id,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Kategori adı zorunludur"),
    description: Yup.string().nullable(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const currentSession = await getSession();
      const response = await fetch(`${baseURL}/api/Category`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession?.accessToken}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || "Kategori güncellenemedi");
      }

      const updatedCategory: Category = await response.json();
      onUpdated?.(updatedCategory);
      toast.success("Kategori başarıyla güncellendi");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Kategori güncellenirken hata oluştu");
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <Label htmlFor="name">Kategori Adı</Label>
            <Field as={Input} name="name" />
            <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
          </div>
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Field
              as="textarea"
              name="description"
              rows={4}
              className="border rounded p-2 w-full"
            />
            <ErrorMessage name="description" component="div" className="text-red-500 text-xs" />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            Güncelle
          </Button>
        </Form>
      )}
    </Formik>
  );
}

// ====================================================================
// Bileşen 3: Silme Onayı Diyaloğu
// ====================================================================

export function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, categoryName }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Silme Onayı</DialogTitle>
        </DialogHeader>
        <p>“{categoryName}” kategorisini silmek istediğinize emin misiniz?</p>
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button variant="destructive" onClick={() => {
            onConfirm();
            // onClose() burada çağrılmamalı, onConfirm'in başarılı olması beklenmeli veya page.tsx'te ayarlanmalı
          }}>
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}