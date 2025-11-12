import { FormWrapper } from "./formwrapper";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useEffect, type FC } from "react";
import { Center } from "../ui/center";

export const PasswordResetSuccessForm: FC = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Password Reset Success - Flowlio";
  }, []);
  const navigate = useNavigate();

  return (
    <FormWrapper
      description="Your password has been reset successfully! You can now log in with your new credentials."
      label="Your Password Has Been Successfully Reset!"
      logoSource="/logo/logowithtext.png"
      className="w-[27rem]"
    >
      <Button
        className="w-full mt-8 bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80"
        size="xl"
        onClick={() => navigate("/auth/signin")}
      >
        Back to Login
      </Button>
      <Center className="gap-0 mt-4">
        <img src="/authform/checkmark.svg" alt="check" className="size-14" />
      </Center>
    </FormWrapper>
  );
};
