"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSendEmail } from "@/apiHandler/sendEmailApiHandler";
import { useState } from "react";
import {toast} from "sonner";
import { LoaderCircle } from "lucide-react";
type EmailButtonProps = {
  email: string;
};

export default function EmailButton({ email }: EmailButtonProps) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const { mutate: sendEmailMutate, isPending: sendEmailLoading } = useSendEmail();

  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const handleSubmitEmail = (e: React.SubmitEvent) => {
    e.preventDefault();
    if(!subject || !message) {
      toast.error("Kindly provide a subject and message", { position: "top-center" });
      return
    };
    sendEmailMutate(
      { email, subject, message },
      {
        onSuccess: () => {
          toast.success("Email sent successfully", { position: "top-center" });
          setSubject("");
          setMessage("");
          setOpenDrawer(false);
        }, 
        onError: (error) => {
          toast.error(`${error.message} `, { position: "top-center" });
        }
      }
    );
  };
  
  return (
    <div className="w-full">
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} repositionInputs={false} >
        <DrawerTrigger asChild>
          <Button className="w-full">Send Feedback</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>We Value Your Feedback</DrawerTitle>
            <DrawerDescription>
              Have suggestions, feedback, or encountered an issue? Let us know — your input helps us improve the experience.
            </DrawerDescription>
          </DrawerHeader>

          {/* Form */}
          <form onSubmit={(e) => handleSubmitEmail(e)}>
            <FieldSet className="w-full px-5 space-y-4">
              <FieldGroup>
                {/* Subject */}
                <Field>
                  <FieldLabel htmlFor="subject">Subject</FieldLabel>
                  <Input
                    id="subject"
                    placeholder="Provide a short title for your message."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                </Field>

                {/* Feedback */}
                <Field>
                  <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
                  <Textarea
                    id="feedback"
                    placeholder="Describe your experience, suggestion, or issue..."
                    rows={4}
                    className="w-full max-h-40 resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <FieldDescription>
                    Please include as much detail as possible to help us understand your feedback.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
            <DrawerFooter>
              <Button type="submit" disabled={sendEmailLoading || !subject || !message}>
                {sendEmailLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Sending Feedback... 
                  </div>

                ) : "Send Feedback"} 
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>

        </DrawerContent>
      </Drawer>

    </div>
  );
}