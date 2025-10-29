import { descriptionFormat, nameFormat, slugFormat } from "@/lib/regex";
import { z, ZodType } from "zod";
import {
  AddressFormData,
  BrandFormData,
  CategoryFormData,
  CheckoutFormData,
  DiscountFormData,
  ImageFormData,
  PageFormData,
  PmethodFormData,
  ProductFormData,
  ShippingFormData,
  SlideFormData,
  SlideitemFormData,
  storeAdminFormData,
  StoreFormData,
  StoreTrackOrderData,
  SubcategoryFormData,
  SubscriptionFormData,
  TagFormData,
} from "./forms";
import { TypeColorModel, TypeSizeModel } from "./models";

export const storeValidationSchema: ZodType<StoreFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,) min 4 and max 60 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  user_id: z.string().optional(),
  status: z.enum(["online", "pending", "suspended"]).optional(),
});

export const addressValidationSchema: ZodType<AddressFormData> = z.object({
  firstName: z.string().min(5).max(255),
  lastName: z.string().min(5).max(255),
  phone: z.string().min(5).max(255),
  email: z.string().email(),
  zipCode: z.string().min(5).max(20),
  country: z.string().min(5).max(255).optional(),
  city: z.string().min(5).max(255),
  state: z.string().min(5).max(255),
  address: z.string().min(5).max(255),
  user_id: z.string().nullable().optional(),
});

export const trackOrderValidationSchema: ZodType<StoreTrackOrderData> =
  z.object({
    _id: z.string().min(20).max(30),
    user_id: z.string().optional().nullable(),
  });

export const discountValidationSchema: ZodType<DiscountFormData> = z.object({
  discount: z.string().min(6).max(255),
});

export const ColorValidationSchema: ZodType<TypeColorModel> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  images: z.object({ url: z.string() }).array().max(2),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string(),
  value: z.string().optional(),
});

export const SizeValidationSchema: ZodType<TypeSizeModel> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  images: z.object({ url: z.string() }).array().max(2),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string(),
  value: z.string().optional(),
});

export const productValidationSchema: ZodType<ProductFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,) min 4 and max 60 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  additionnal: z.string().max(2000),
  specification: z.string().max(2000),
  images: z.object({ url: z.string() }).array().max(20),
  user_id: z.string().optional().nullable(),
  status: z.enum(["draft", "publish", "archive"]),
  inventory: z.enum(["instock", "outstock"]),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  price: z.coerce.number().min(0).max(100000),
  discount: z.coerce.number().min(0).max(100),
  unit: z.string(),
  weight: z.coerce.number().min(0).max(100),
  sku: z.string().max(30),
  seoTitle: z
    .string()
    .regex(nameFormat, {
      message: "format: no special (&/,) min 4 and max 60 characters",
    })
    .optional(),
  seoDescription: z
    .string()
    .regex(descriptionFormat, {
      message: "format:min 4 and max 500 characters",
    })
    .optional(),
  seoSlug: z
    .string()
    .regex(slugFormat, {
      message:
        "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
    })
    .optional(),
  // category: z.string(),
  // brand: z.string(),
  // subCategories: z.string().array(),
});

export const categoryValidationSchema: ZodType<CategoryFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const slideValidationSchema: ZodType<SlideFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const tagValidationSchema: ZodType<TagFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const brandValidationSchema: ZodType<BrandFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const shippingValidationSchema: ZodType<ShippingFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
  delay: z.coerce.number().min(0).max(360, "less than 360 days"),
  fees: z.coerce.number().min(0).max(100000),
  region: z.string().array(),
  fixed_amount: z.coerce.number().min(0).max(100000),
  unit_price_weight: z.coerce.number().min(0).max(100000),
  price_range_start: z.coerce.number().min(0).max(100000),
  price_range_end: z.coerce.number().min(0).max(100000),
});
// .refine((schema) => schema.price_range_end < schema.price_range_start, {
//   message: "price range end must be greater than price range start",
// });

export const pmethodValidationSchema: ZodType<PmethodFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const subscriptionValidationSchema: ZodType<SubscriptionFormData> =
  z.object({
    startDate: z.date(),
    endDate: z.date(),
    status: z.enum(["active", "ended", "cancelled"]),
    type: z.enum(["basic", "pro" , "enterprise"]),
    user_id: z.string().nullable(),
    store: z.string(),
  });

export const pageValidationSchema: ZodType<PageFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
});

export const SubcategoryValidationSchema: ZodType<SubcategoryFormData> =
  z.object({
    name: z.string().regex(nameFormat, {
      message: "format: no special (&/,), min 4 and max 60 characters",
    }),
    slug: z.string().regex(slugFormat, {
      message:
        "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
    }),
    description: z.string().regex(descriptionFormat, {
      message: "format:min 4 and max 500 characters",
    }),
    image: z.string().url("Image url is invalid"),
    // image: z.object({ url: z.string() }).array(),
    status: z.enum(["draft", "publish", "archive"]),
    user_id: z.string().optional().nullable(),
    category: z.string(),
  });

export const SlideitemValidationSchema: ZodType<SlideitemFormData> = z.object({
  name: z.string().regex(nameFormat, {
    message: "format: no special (&/,), min 4 and max 60 characters",
  }),
  slug: z.string().regex(slugFormat, {
    message:
      "format: no blank space (_), no special character (&,',/|...), min 4 and max 20 characters",
  }),
  description: z.string().regex(descriptionFormat, {
    message: "format:min 4 and max 500 characters",
  }),
  image: z.string().url("Image url is invalid"),
  // image: z.object({ url: z.string() }).array(),
  status: z.enum(["draft", "publish", "archive"]),
  user_id: z.string().optional().nullable(),
  slide: z.string(),
  store: z.string().optional(),
});

export const ImageValidationSchema: ZodType<ImageFormData> = z.object({
  user_id: z.string(),
  url: z.string(),
  store: z.string(),
});

export const checkoutValidationSchema: ZodType<CheckoutFormData> = z.object({
  user_id: z.string(),
  amount: z.number().min(1),
});

export const SubcategoryArrayValidationSchema: ZodType<{
  subCategory: string[];
}> = z.object({
  subCategory: z.array(z.string()),
});

export const storeAdminValidationSchema: ZodType<storeAdminFormData> = z.object(
  {
    status: z.enum(["online", "pending", "suspended"]),
  }
);
