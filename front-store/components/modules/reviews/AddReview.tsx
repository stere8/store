import { Rating } from "@mui/material";
import { apiClient } from "@/lib/epoc-api";
import React, { useState } from "react";
import { Field, Formik, Form, ErrorMessage } from "formik";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogInIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import * as Yup from "yup";
import { TypeProductModel, TypeReviewModel } from "@/types/models";
import Loading from "@/components/custom/Loading";
import { FormattedMessage, useIntl } from "react-intl";

export default function AddReview({
  product,
  reviews,
  setReviews,
}: {
  product: TypeProductModel;
  reviews: TypeReviewModel[];
  setReviews: (value: TypeReviewModel[]) => void;
}) {
  const { user, isSignedIn } = useUser();
  const [rating, setRating] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const router = useRouter();

  const validate = Yup.object({
    review: Yup.string()
      .required(intl.formatMessage({ id: "review.validation.required" }))
      .matches(
        /^[a-zA-Z0-9 -./';,:?<>Ã©& "]{10,2500}$/,
        intl.formatMessage({ id: "review.validation.min" })
      ),
    rating: Yup.string().required(
      intl.formatMessage({ id: "review.validation.rating-required" })
    ),
  });

  const initialValues = {
    review: "",
    rating: "",
  };

  const handleSave = async (values: { review: string }) => {
    setLoading(true);

    if (!isSignedIn || !user) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "toast.error-title" }),
        description: intl.formatMessage({ id: "review.toast.fill-fields" }),
      });
      router.push("/sign-in");
      setLoading(false);
      return;
    }

    if (!rating) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "toast.error-title" }),
        description: intl.formatMessage({ id: "review.toast.missing-rating" }),
      });
      setLoading(false);
      return;
    }

    const optimisticReview = {
      _id: `tmp-${Date.now()}`,
      product: product._id,
      review: values.review,
      rating: Number(rating),
      user: {
        _id: user.id,
        fullName: user.fullName || "unknown",
        imageUrl: user.imageUrl,
      },
      likes: [],
      createdAt: new Date(),
    };

    setReviews([...reviews, optimisticReview as unknown as TypeReviewModel]);

    try {
      const customerResponse = await apiClient.post("/api/customers", {
        username: user.id,
        fullName: user.fullName || user.firstName || user.id,
        phoneNumber: `+250${user.id
          .replace(/\D/g, "")
          .slice(0, 9)
          .padEnd(9, "0")}`,
        email: user.primaryEmailAddress?.emailAddress || null,
        preferredLanguage: "en",
      });

      await apiClient.post(`/api/products/${product._id}/reviews`, {
        customerId: customerResponse.data.id,
        rating: Number(rating),
        title: product.name,
        comment: values.review,
      });

      toast({
        variant: "default",
        title: intl.formatMessage({ id: "toast.success-title" }),
        description: intl.formatMessage({
          id: "review.toast.posted",
          defaultMessage: "Your review has been posted.",
        }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading loading={true} />}
      <h5>
        <FormattedMessage id="review.title" defaultMessage="Add your Review" />
      </h5>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validate}
        onSubmit={(values) => handleSave(values)}
      >
        {({ errors }) => (
          <Form encType="multipart/form-data">
            <div className="flex flex-col gap-4">
              <Field
                name="review"
                placeholder={intl.formatMessage({
                  id: "review.input.placeholder",
                })}
                className={cn(
                  "w-full h-20 border border-black p-4 text-black focus:outline-none",
                  errors.review && "border border-red-300"
                )}
              />
              <ErrorMessage
                name="review"
                component="div"
                className="py-2 font-bold text-red-900"
              />
            </div>

            <div className="flex flex-col gap-10 mt-10">
              <Rating
                onChange={(_, value) => setRating(value ?? "")}
                name="rating"
                precision={1}
                className="text-primary-500 text-3xl inline-flex gap-0.5"
              />
            </div>

            <div className="flex justify-start mt-10">
              {isSignedIn ? (
                <Button
                  variant="default"
                  size="lg"
                  disabled={loading}
                  type="submit"
                  className="px-4 w-fit"
                >
                  <FormattedMessage
                    id="review.button.post"
                    defaultMessage="Post your review"
                  />
                  <SendIcon className="text-white ms-4" />
                </Button>
              ) : (
                <Link
                  href="/sign-in"
                  className="bg-primary-700 flex items-center justify-center gap-4 uppercase text-white p-6"
                >
                  <FormattedMessage
                    id="review.button.login-to-post"
                    defaultMessage="Login to post your comment"
                  />
                  <LogInIcon />
                </Link>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
