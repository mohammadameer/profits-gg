import { Button, Modal, TextInput } from "@profits-gg/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import va from "@vercel/analytics";
import { api } from "~/utils/api";
import { useLocalStorage } from "usehooks-ts";
import { usePostHog } from "posthog-js/react";
import { useRouter } from "next/router";
import { required } from "@profits-gg/lib/utils/formRules";

type FormValues = {
  emailOrPhoneNumber: string;
};

export default function ActivateMembershipModal() {
  const router = useRouter();

  const { control, handleSubmit } = useForm<FormValues>();

  const posthog = usePostHog();

  const [userId, setUserId] = useLocalStorage<string>("userId", "");

  const [isActivateMembershipModalOpen, setIsActivateMembershipModalOpen] =
    useState<boolean>(false);

  const { mutate: checkUser, isLoading: isCheckingUser } =
    api.user.checkUser.useMutation();

  const handleActivateMembership = async ({
    emailOrPhoneNumber,
  }: FormValues) => {
    va.track("Activate Membership Clicked");
    if (!emailOrPhoneNumber) return;
    if (isCheckingUser) return;

    if (!emailOrPhoneNumber.includes("@")) {
      if (emailOrPhoneNumber.length != 10) {
        va.track("Activate Membership Number Error");
        toast.error("رقم الجوال يجب أن لا يقل عن ٩ أرقام");
        return;
      }
    }

    checkUser(
      {
        email: emailOrPhoneNumber,
        phoneNumber: emailOrPhoneNumber,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            setUserId(data?.id);
            posthog?.identify(data?.id as string, {
              name: data?.name,
              email: data?.email,
              phoneNumber: data?.phoneNumber,
            });
            va.track("Activate Membership User Set");
            if (data?.membershipExpiration) {
              if (new Date(data?.membershipExpiration) > new Date()) {
                va.track("Activate Membership Success");
                toast.success("تم تفعيل الإشتراك بنجاح");
                setIsActivateMembershipModalOpen(false);
                router.push("/");
                return;
              } else {
                va.track("Activate Membership Expired");
                toast.error("انتهت صلاحية الإشتراك");
                setIsActivateMembershipModalOpen(false);
                router.push("/memberships");
                return;
              }
            }
          } else {
            va.track("Activate Membership User Not Found");
            toast.error(
              "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني أو رقم الجوال"
            );
            return;
          }
        },
        onError: () => {
          va.track("Activate Membership Email Or Phone Number Not Found");
          toast.error(
            "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني أو رقم الجوال"
          );
        },
      }
    );
  };

  return (
    <div className="flex justify-center !bg-gray-200 p-6">
      <div className="flex flex-col gap-4 md:w-2/3 lg:w-1/3">
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          تفعيل الإشتراك
        </p>

        <p className="text text-xl text-gray-900">
          يمكنك تفعيل الإشتراك بإستخدام البريد الإلكتروني أو رقم الجوال الذي تم
          استخدامه عند الإشتراك
        </p>

        <form
          onSubmit={handleSubmit(handleActivateMembership)}
          className="w-full"
        >
          <TextInput
            label="البريد الإلكتروني أو رقم الجوال"
            name="emailOrPhoneNumber"
            control={control}
            rules={{ required: required }}
            className="w-full"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
          />
          <Button
            text="تفعيل الإشتراك"
            type="submit"
            loading={isCheckingUser}
            className="mt-2 w-full !bg-blue-500 !text-white"
          />
        </form>

        <Button
          id="activated-membership"
          text="العودة للصفحة الرئيسية"
          className="mt-8 w-full"
          onClick={() => {
            router.push("/");
          }}
        />
      </div>
    </div>
  );
}
