"use client"

import { useState, useEffect } from "react";
// Formik, Yup, Field, ErrorMessage gibi Form bileşeni bağımlılıkları CategoryForms.tsx'e taşındı.
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Category, NewCategory } from "@/app/models/Category";
import { toast, ToastContainer} from "react-toastify";
import { useSession, getSession } from 'next-auth/react';
import { MoreVerticalIcon, EditIcon, Trash2Icon,SearchIcon  } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; 

// 🎯 TAŞINAN YARDIMCI BİLEŞENLERİN İMPORTU
import { NewCategoryForm, FormikUpdateCategory, ConfirmDeleteDialog } from "./components/CategoryForms"; 


export default function CategoryPage() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<Category[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [searchText, setSearchText] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

 useEffect(() => {
  const fetchProducts = async () => {
    if (session?.accessToken) {
      try {
        // Backend'e search parametresi ekleniyor
        const url = new URL(`${baseURL}/api/Category/GetAllCategories`);
        if (searchText.trim() !== "") {
          url.searchParams.append("searchText", searchText.trim());
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.errorMessage ||
              errorData.message ||
              "Kategori listesi çekilemedi."
          );
        }
        const productList: Category[] = await response.json();
        setData(productList);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(error.message || "Kategori listesi yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  if (status === "authenticated") {
    fetchProducts();
  } else if (status === "unauthenticated") {
    setLoading(false);
  }
}, [session, status, baseURL, searchText]);

  // TanStack Table için sütun tanımları
  const columns: ColumnDef<Category>[] = [
    { accessorKey: "id", header: "Id" },
    { accessorKey: "name", header: "Kategori Adı" },
    { accessorKey: "description", header: "Açıklama" },   
    {
      id: "actions",
      header: "İşlemler", 
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreVerticalIcon className="h-4 w-4" /> 
              <span className="sr-only">Menüyü aç</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <EditIcon className="mr-2 h-4 w-4" /> Düzenle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteClick(row.original)}>
                <Trash2Icon className="mr-2 h-4 w-4" /> Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  // TanStack Table hook'unun başlatılması
  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  // Yeni kategori ekleme işlemi
  async function handleAdd(category: NewCategory) {
    try {
        const currentSession = await getSession(); 
        const response = await fetch(`${baseURL}/api/Category`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession?.accessToken}`,
        },
        body: JSON.stringify({
            name: category.name,
            description: category.description,
        }),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || errorData.message || "Kategori eklenemedi");
        }

        const createdCategory: Category = await response.json();
        setData(prev => [...prev, createdCategory]);
        toast.success("Yeni kategori başarıyla eklendi!");
        setIsOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        toast.error(err.message || "Kategori eklenirken bir hata oluştu");
    }
  }

  async function handleEdit(category: Category) {
    try {
            const response = await fetch(`${baseURL}/api/Category/${category.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.accessToken}`,
            },
            });
            if (!response.ok) {
            throw new Error("Kategori bilgileri alınamadı");
            }
            const data = await response.json();
            setSelectedCategory(data);
            setIsEditOpen(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Düzenleme için kategori alınamadı");
        }
    }

  function handleDeleteClick(category: Category) {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  }

async function handleDeleteConfirm() {

  if (!categoryToDelete) return;

  try {
    const currentSession = await getSession(); 
    const response = await fetch(`${baseURL}/api/Category/${categoryToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentSession?.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || "Kategori silinemedi");
    }

    setData(prev => prev.filter(c => c.id !== categoryToDelete.id));
    toast.success("Kategori başarıyla silindi!");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    toast.error(err.message || "Kategori silinirken hata oluştu");
  } finally {
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  }
}

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl">Kategoriler</h1>
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Kategori Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Yeni Kategori</DialogTitle>
            <NewCategoryForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
            <DialogTitle>Kategoriyi Düzenle</DialogTitle>
            <FormikUpdateCategory
                category={selectedCategory}
                onClose={() => setIsEditOpen(false)}
                onUpdated={(updatedCategory) => {
                    // local state'i güncelle
                    setData((prev) =>
                    prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
                    );
                }}
            />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ""}
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>            
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.column.columnDef.header as string}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    Gösterilecek kategori bulunamadı.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
        </Button>
      </div>      
      <ToastContainer />
    </div>
  )  
}