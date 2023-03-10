import { required } from "@profits-gg/lib/utils/formRules";
import { Button, TextInput } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "src/utils/api";

export default function Email() {
  const { control, handleSubmit, reset } = useForm();

  const { mutate: emailSignup } = api.user.emailSignup.useMutation();

  const onSubmit = (data: any) => {
    toast(
      "Thank you for signing up! We will keep you updated with our latest news and updates.",
      {
        icon: "👍",
      },
    );
    emailSignup(data);
    reset();
  };

  return (
    <div
      className="flex w-full grow flex-col items-center gap-10 pt-20 pb-20"
      dir="ltr"
    >
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-2xl">Sign up to our marketing & latest updates </p>
        <TextInput
          label="Email"
          name="email"
          control={control}
          rules={{ required }}
        />
        <Button text="Signup" type="submit" />
      </form>
    </div>
  );
}
