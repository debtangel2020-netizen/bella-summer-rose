import { getProducts } from "@/lib/store";
import { ProductForm } from "../ProductForm";

export default async function NewProduct() {
  const categories = Array.from(new Set((await getProducts()).map((p) => p.category).filter(Boolean)));
  return (
    <>
      <h1>Add a product</h1>
      <ProductForm categories={categories} />
    </>
  );
}
