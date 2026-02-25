import { promises as fs } from "fs";
import path from "path";
import { Product, Store } from "@/types";

interface GenerateSiteInput {
  templateId: string;
  store: Pick<Store, "id" | "name">;
  products: Product[];
  apiBaseUrl: string;
}

type GeneratedFiles = Record<string, string>;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const templatesRoot = path.join(process.cwd(), "src", "templates");

export const generateProductHTML = (products: Product[]): string => {
  if (products.length === 0) {
    return '<p class="empty">No products available yet.</p>';
  }

  return products
    .map(
      (product) => `<div class="product">
  <img src="${escapeHtml(product.image_url || "https://via.placeholder.com/640x380?text=Product")}" alt="${escapeHtml(product.name)}">
  <h2>${escapeHtml(product.name)}</h2>
  <p>${formatPrice(product.price)}</p>
  <button class="buy-button" data-product-id="${product.id}">Buy now</button>
</div>`,
    )
    .join("\n");
};

const readTemplateFile = async (templateDir: string, filename: string): Promise<string> => {
  const filePath = path.join(templateDir, filename);
  return fs.readFile(filePath, "utf8");
};

const replacePlaceholders = (
  content: string,
  params: { storeName: string; productList: string; productJson: string },
) =>
  content
    .replaceAll("{{STORE_NAME}}", params.storeName)
    .replaceAll("{{PRODUCT_LIST}}", params.productList)
    .replaceAll("{{PRODUCT_JSON}}", params.productJson);

export const generateSite = async ({
  templateId,
  store,
  products,
  apiBaseUrl,
}: GenerateSiteInput): Promise<GeneratedFiles> => {
  const templateDir = path.join(templatesRoot, templateId);

  let indexTemplate: string;
  let styleTemplate: string;
  let scriptTemplate: string;

  try {
    [indexTemplate, styleTemplate, scriptTemplate] = await Promise.all([
      readTemplateFile(templateDir, "index.html"),
      readTemplateFile(templateDir, "style.css"),
      readTemplateFile(templateDir, "script.js"),
    ]);
  } catch {
    throw new Error(`Template "${templateId}" is missing required files`);
  }

  const bootstrap = {
    storeId: store.id,
    storeName: store.name,
    apiBaseUrl,
    products,
  };

  const replacementParams = {
    storeName: escapeHtml(store.name),
    productList: generateProductHTML(products),
    productJson: JSON.stringify(bootstrap, null, 2),
  };

  return {
    "index.html": replacePlaceholders(indexTemplate, replacementParams),
    "style.css": replacePlaceholders(styleTemplate, replacementParams),
    "script.js": replacePlaceholders(scriptTemplate, replacementParams),
    "products.json": JSON.stringify(products, null, 2),
  };
};
