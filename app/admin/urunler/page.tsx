/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useSession, getSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import {
  MoreVerticalIcon,
  EditIcon,
  Trash2Icon,
  ArrowRightFromLine,
  SearchIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Product, CreateProduct } from "@/app/models/Product";
import { Category } from "@/app/models/Category";
import { NewProductForm } from "./create-product-form";

export default function ProductPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(CreateProduct & { id: string }) | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState("");

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session?.accessToken) return;

      const url = new URL(`${baseURL}/api/Product/GetAllProducts`);
      if (searchText.trim() !== "") {
          url.searchParams.append("searchText", searchText.trim());
        }


      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }),
          fetch(`${baseURL}/api/Category/GetAllCategories`, {
            method: "GET",
            headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json"},
          }),
        ]);

        if (!productRes.ok || !categoryRes.ok) {
          throw new Error("Veriler alınamadı.");
        }

        const [products, categories] = await Promise.all([
          productRes.json(),
          categoryRes.json(),
        ]);

        setProducts(products);
        setCategories(categories);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err.message || "Veriler yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") fetchInitialData();
  }, [session, status, baseURL, searchText]); // searchText bağımlılık olarak eklendi

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "Id" },
    { accessorKey: "name", header: "Ürün Adı" },
    { accessorKey: "categoryName", header: "Kategori" },
    { accessorKey: "description", header: "Açıklama" },
    { accessorKey: "price", header: "Fiyat" },
    { accessorKey: "stock", header: "Stok" },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => startEdit(row.original)}>
              <EditIcon className="mr-2 h-4 w-4" /> Düzenle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => confirmDelete(row.original)}>
              <Trash2Icon className="mr-2 h-4 w-4" /> Sil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/urunler/${row.original.id}`} className="flex items-center">
                <ArrowRightFromLine className="mr-2 h-4 w-4" />
                Detay
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

async function handleAdd(product: CreateProduct) {
  const currentSession = await getSession();
  const formData = new FormData();

  formData.append("Name", product.name);
  formData.append("Description", product.description || "");
  formData.append("Price", String(product.price));
  formData.append("Stock", String(product.stock));
  formData.append("CategoryId", product.categoryId);
  formData.append("taxRate",String(product.taxRate));

  if(product.discountRate)
  {
    formData.append("discountRate", String(product.discountRate));
  }

  if (product.discountStart !== undefined && product.discountStart !== null) {
    formData.append("discountStart", new Date(product.discountStart).toISOString());
  }

  if (product.discountEnd !== undefined && product.discountEnd !== null) {
    formData.append("discountEnd", new Date(product.discountEnd).toISOString());
  }

if (product.imageFiles && product.imageFiles.length > 0) {
      product.imageFiles.forEach((file, index) => {
        formData.append(`Images[${index}].File`, file);
        formData.append(`Images[${index}].FileName`, file.name);
        formData.append(`Images[${index}].FileDescription`, "");
        formData.append(`Images[${index}].Type`, "2");
      });
    }
  
  formData.append("DeletedImageIds", JSON.stringify([]));

  try {
    const res = await fetch(`${baseURL}/api/Product`, {
      method: "POST",
      headers: { Authorization: `Bearer ${currentSession?.accessToken}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Ürün eklenemedi.");
    const newProduct = await res.json();
    console.log(newProduct);
    setProducts((prev) => [...prev, newProduct]);
    toast.success("Ürün başarıyla eklendi");
    setIsAddOpen(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    toast.error(err.message || "Ürün eklenirken hata oluştu");
  }
}

async function startEdit(product: Product) {
  try {
    const res = await fetch(`${baseURL}/api/Product/${product.id}`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });
    if (!res.ok) throw new Error("Ürün detayları alınamadı");
    const data = await res.json();
    console.log(data);

    setSelectedProduct({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      imageFiles: [], // Sadece yeni seçilecek dosyalar içindir
      images: data.images || [], // Backend'den gelen mevcut resimleri göstermek için
      // Backend'den gelen deletedImageIds yoksa boş dizi olarak başlatın
      deletedImageIds: [], // Başlangıçta silinmiş resim ID'leri yok
      taxRate: data.taxRate,
      discountRate: data.discountRate,
      discountStart: data.discountStart ? new Date(data.discountStart) : undefined,
      discountEnd: data.discountEnd ? new Date(data.discountEnd) : undefined,
    });
    setIsEditOpen(true);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (err: any) {
      toast.error(err.message || "Güncelleme sırasında hata");
    }
}

  async function handleUpdate(updatedProduct: CreateProduct & { id: string }) {
    const currentSession = await getSession();
    const formData = new FormData();

    formData.append("Id", updatedProduct.id);
    formData.append("Name", updatedProduct.name);
    formData.append("Description", updatedProduct.description || "");
    formData.append("Price", String(updatedProduct.price));
    formData.append("Stock", String(updatedProduct.stock));
    formData.append("CategoryId", updatedProduct.categoryId);
    formData.append("taxRate",String(updatedProduct.taxRate));

  if(updatedProduct.discountRate)
  {
    formData.append("discountRate", String(updatedProduct.discountRate));
  }

  if (updatedProduct.discountStart !== undefined && updatedProduct.discountStart !== null) {
    formData.append("discountStart", new Date(updatedProduct.discountStart).toISOString());
  }

  if (updatedProduct.discountEnd !== undefined && updatedProduct.discountEnd !== null) {
    formData.append("discountEnd", new Date(updatedProduct.discountEnd).toISOString());
  }


    // Yeni yüklenen resimleri FormData'ya ekle
    if (updatedProduct.imageFiles && updatedProduct.imageFiles.length > 0) {
      updatedProduct.imageFiles.forEach((file, index) => {
        formData.append(`Images[${index}].File`, file);
        formData.append(`Images[${index}].FileName`, file.name);
        formData.append(`Images[${index}].FileDescription`, "");
        formData.append(`Images[${index}].Type`, "2");
      });
    }

    if (updatedProduct.deletedImageIds && updatedProduct.deletedImageIds.length > 0) {
      formData.append("DeletedImageIds", JSON.stringify(updatedProduct.deletedImageIds));
    } else {
      formData.append("DeletedImageIds", JSON.stringify([])); 
    }

    try {
      const res = await fetch(`${baseURL}/api/Product`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${currentSession?.accessToken}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Ürün güncellenemedi");
      // Backend'den güncel ürünü alıp state'i güncellemek için
      const updatedResponse = await res.json(); 
      // API'niz güncel ürünü döndürmüyorsa, manuel olarak product'ı bulup güncelleyebilirsiniz.
      // Ya da tüm ürün listesini yeniden çekebilirsiniz.
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedResponse } : p))
      );
      toast.success("Ürün güncellendi!");
      setIsEditOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Güncelleme sırasında hata");
    }
  }

  function confirmDelete(product: Product) {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;

    try {
      const currentSession = await getSession();
      const res = await fetch(`${baseURL}/api/Product/${productToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentSession?.accessToken}` },
      });

      if (!res.ok) throw new Error("Ürün silinemedi, ürüne ait resimleri silip tekrar deneyin.");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success("Ürün silindi!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Silme işlemi başarısız");
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ürünler</h1>
                <div className="flex justify-center w-full">
            <div className="relative w-2/3">
                <input
                type="text"
                placeholder="Ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full border border-gray-300 rounded-3xl pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e5e7eb]"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Ürün Ekle</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            </DialogHeader>
            <NewProductForm onSubmit={handleAdd} categories={categories} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  Gösterilecek ürün yok
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Ürünü Düzenle</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <NewProductForm
              onSubmit={async (values) => {
                if (values.id) {
                  await handleUpdate(values as CreateProduct & { id: string });
                } else {
                  await handleAdd(values);
                }
              }}
              categories={categories}
              initialValues={selectedProduct ?? undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Silme Onayı</DialogTitle>
          </DialogHeader>
          <p>
            “{productToDelete?.name}” adlı ürünü silmek istediğinize emin misiniz?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}