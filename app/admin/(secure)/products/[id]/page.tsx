import { notFound } from "next/navigation";
import { getProducts } from "@/lib/store";
import { ProductForm } from "../ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await getProducts({ fresh: true });
  const product = all.find((p) => p.id === id);
  if (!product) notFound();
  const categories = Array.from(new Set(all.map((p) => p.category).filter(Boolean)));
  return (
    <>
      <h1>Edit {product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
